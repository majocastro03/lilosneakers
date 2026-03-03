const supabase = require('../config/supabaseCliente');

// POST /api/ordenes - Create a new order
const crearOrden = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, direccion_envio, telefono_contacto, notas } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
    }

    if (!direccion_envio || typeof direccion_envio !== 'string' || direccion_envio.trim().length === 0) {
      return res.status(400).json({ error: 'La dirección de envío es requerida' });
    }

    // Validate stock and calculate totals
    let total = 0;
    const itemsValidados = [];

    for (const item of items) {
      const { data: producto, error: prodError } = await supabase
        .from('productos')
        .select('id, nombre, precio, descuento')
        .eq('id', item.producto_id)
        .single();

      if (prodError || !producto) {
        return res.status(400).json({ error: `Producto ${item.producto_id} no encontrado` });
      }

      const { data: stock, error: stockError } = await supabase
        .from('producto_tallas')
        .select('cantidad')
        .eq('producto_id', item.producto_id)
        .eq('talla_id', item.talla_id)
        .single();

      if (stockError || !stock || stock.cantidad < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}"`
        });
      }

      const precioFinal = Math.round(producto.precio * (1 - producto.descuento / 100));
      const subtotal = precioFinal * item.cantidad;
      total += subtotal;

      itemsValidados.push({
        producto_id: item.producto_id,
        talla_id: item.talla_id,
        cantidad: item.cantidad,
        precio_unitario: precioFinal,
        subtotal
      });
    }

    // Create order
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .insert([{
        usuario_id: userId,
        total,
        estado: 'pendiente',
        direccion_envio: direccion_envio.trim(),
        telefono_contacto: telefono_contacto?.trim() || null,
        notas: notas?.trim() || null
      }])
      .select()
      .single();

    if (ordenError) throw ordenError;

    // Create order items
    const orderItems = itemsValidados.map(item => ({
      orden_id: orden.id,
      producto_id: item.producto_id,
      talla_id: item.talla_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('orden_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update stock
    for (const item of itemsValidados) {
      const { data: currentStock } = await supabase
        .from('producto_tallas')
        .select('cantidad')
        .eq('producto_id', item.producto_id)
        .eq('talla_id', item.talla_id)
        .single();

      if (currentStock) {
        await supabase
          .from('producto_tallas')
          .update({ cantidad: currentStock.cantidad - item.cantidad })
          .eq('producto_id', item.producto_id)
          .eq('talla_id', item.talla_id);
      }
    }

    res.status(201).json({
      message: 'Orden creada exitosamente',
      orden: {
        id: orden.id,
        total,
        estado: 'pendiente',
        items: itemsValidados.length
      }
    });

  } catch (err) {
    console.error('Error en crearOrden:', err);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};

// GET /api/ordenes - Get user's orders
const getOrdenes = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.tipo_usuario === 'admin';

    let query = supabase
      .from('ordenes')
      .select(`
        id, total, estado, direccion_envio, telefono_contacto, notas, created_at,
        perfiles!left(nombre, apellido, username)
      `)
      .order('created_at', { ascending: false });

    // Admin sees all orders, users see only their own
    if (!isAdmin) {
      query = query.eq('usuario_id', userId);
    }

    const { data: ordenes, error } = await query;
    if (error) throw error;

    res.json(ordenes || []);
  } catch (err) {
    console.error('Error en getOrdenes:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// GET /api/ordenes/:id - Get order details
const getOrdenById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.tipo_usuario === 'admin';

    let query = supabase
      .from('ordenes')
      .select(`
        id, total, estado, direccion_envio, telefono_contacto, notas, created_at,
        perfiles!left(nombre, apellido, username)
      `)
      .eq('id', id)
      .single();

    const { data: orden, error } = await query;
    if (error) throw error;
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    // Non-admin can only see their own orders
    if (!isAdmin && orden.usuario_id !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Get order items with product and size details
    const { data: items, error: itemsError } = await supabase
      .from('orden_items')
      .select(`
        id, cantidad, precio_unitario, subtotal,
        productos!left(nombre, imagen_url),
        tallas!left(valor)
      `)
      .eq('orden_id', id);

    if (itemsError) throw itemsError;

    res.json({
      ...orden,
      items: items || []
    });

  } catch (err) {
    console.error('Error en getOrdenById:', err);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
};

// PUT /api/ordenes/:id/estado - Update order status (admin only)
const actualizarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('ordenes')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Orden no encontrada' });

    res.json({ message: 'Estado actualizado', orden: data });

  } catch (err) {
    console.error('Error en actualizarEstadoOrden:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
  }
};

module.exports = {
  crearOrden,
  getOrdenes,
  getOrdenById,
  actualizarEstadoOrden
};
