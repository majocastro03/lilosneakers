const supabase = require('../config/supabaseCliente');
const parseError = require('../utils/parseError');

// Registra un movimiento de inventario y ajusta el stock de producto_tallas.
// Reutilizable desde otros controllers (ej. órdenes web).
// opts: { producto_id, talla_id, tipo, cantidad, motivo, precio_venta, precio_costo, referencia, origen, creado_por }
const registrarMovimiento = async (opts) => {
  const {
    producto_id, talla_id, tipo, cantidad,
    motivo = null, precio_venta = null, referencia = null,
    origen = 'manual', creado_por = null
  } = opts;

  const cant = parseInt(cantidad);
  if (!producto_id || !talla_id) throw { status: 400, message: 'Producto y talla son requeridos' };
  if (!['entrada', 'salida', 'ajuste'].includes(tipo)) throw { status: 400, message: 'Tipo de movimiento inválido' };
  if (isNaN(cant) || cant < 0) throw { status: 400, message: 'Cantidad inválida' };
  if (tipo !== 'ajuste' && cant <= 0) throw { status: 400, message: 'La cantidad debe ser mayor a 0' };

  // Stock actual de la variante
  const { data: stockRow, error: stockError } = await supabase
    .from('producto_tallas')
    .select('cantidad')
    .eq('producto_id', producto_id)
    .eq('talla_id', talla_id)
    .single();

  if (stockError || !stockRow) {
    throw { status: 400, message: 'Esa talla no está asignada al producto' };
  }

  const stockActual = stockRow.cantidad ?? 0;
  let nuevoStock;
  if (tipo === 'entrada') nuevoStock = stockActual + cant;
  else if (tipo === 'salida') {
    if (stockActual < cant) throw { status: 400, message: `Stock insuficiente (disponible: ${stockActual})` };
    nuevoStock = stockActual - cant;
  } else {
    nuevoStock = cant; // ajuste = establecer stock absoluto
  }

  // Costo actual del producto (para snapshot y ganancia)
  const { data: prod } = await supabase
    .from('productos')
    .select('precio, descuento, precio_costo')
    .eq('id', producto_id)
    .single();

  const costo = prod?.precio_costo ?? null;
  let venta = precio_venta != null && precio_venta !== '' ? parseFloat(precio_venta) : null;
  if (tipo === 'salida' && venta == null && prod) {
    venta = Math.round(prod.precio * (1 - (prod.descuento || 0) / 100));
  }

  let ganancia = null;
  if (tipo === 'salida' && venta != null && costo != null) {
    ganancia = (venta - costo) * cant;
  }

  // Ajustar stock
  const { error: updError } = await supabase
    .from('producto_tallas')
    .update({ cantidad: nuevoStock })
    .eq('producto_id', producto_id)
    .eq('talla_id', talla_id);
  if (updError) throw updError;

  // Registrar movimiento
  const { data: mov, error: movError } = await supabase
    .from('movimientos_inventario')
    .insert([{
      producto_id,
      talla_id,
      tipo,
      cantidad: cant,
      motivo,
      precio_venta: tipo === 'salida' ? venta : null,
      precio_costo: costo,
      ganancia,
      referencia,
      origen,
      creado_por
    }])
    .select()
    .single();
  if (movError) throw movError;

  return { movimiento: mov, stock_anterior: stockActual, stock_nuevo: nuevoStock };
};

// POST /api/inventario/movimientos  (admin)
const crearMovimiento = async (req, res) => {
  try {
    const { producto_id, talla_id, tipo, cantidad, motivo, precio_venta, referencia } = req.body;
    const resultado = await registrarMovimiento({
      producto_id, talla_id, tipo, cantidad, motivo, precio_venta, referencia,
      origen: 'manual',
      creado_por: req.user?.id || null
    });
    res.status(201).json({ message: 'Movimiento registrado', ...resultado });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error('Error en crearMovimiento:', err);
    const { status, message } = parseError(err, 'Error al registrar el movimiento');
    res.status(status).json({ error: message });
  }
};

// GET /api/inventario/movimientos  (admin) — historial con filtros
const getMovimientos = async (req, res) => {
  try {
    const { producto_id, tipo, desde, hasta } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    let query = supabase
      .from('movimientos_inventario')
      .select(`
        id, tipo, cantidad, motivo, precio_venta, precio_costo, ganancia, referencia, origen, creado_en,
        productos!left(id, nombre, imagen_url),
        tallas!left(valor, genero)
      `)
      .order('creado_en', { ascending: false })
      .limit(limit);

    if (producto_id) query = query.eq('producto_id', producto_id);
    if (tipo) query = query.eq('tipo', tipo);
    if (desde) query = query.gte('creado_en', desde);
    if (hasta) query = query.lte('creado_en', hasta);

    const { data, error } = await query;
    if (error) throw error;

    const movimientos = (data || []).map(m => ({
      id: m.id,
      tipo: m.tipo,
      cantidad: m.cantidad,
      motivo: m.motivo,
      precio_venta: m.precio_venta,
      precio_costo: m.precio_costo,
      ganancia: m.ganancia,
      referencia: m.referencia,
      origen: m.origen,
      creado_en: m.creado_en,
      producto: m.productos ? { id: m.productos.id, nombre: m.productos.nombre, imagen_url: m.productos.imagen_url } : null,
      talla: m.tallas ? { valor: m.tallas.valor, genero: m.tallas.genero } : null
    }));

    res.json(movimientos);
  } catch (err) {
    console.error('Error en getMovimientos:', err);
    const { status, message } = parseError(err, 'Error al obtener los movimientos');
    res.status(status).json({ error: message });
  }
};

// GET /api/inventario/reporte  (admin) — resumen agrupado por día
const getReporteDiario = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    let query = supabase
      .from('movimientos_inventario')
      .select('tipo, cantidad, precio_venta, ganancia, creado_en')
      .order('creado_en', { ascending: false });

    if (desde) query = query.gte('creado_en', desde);
    if (hasta) query = query.lte('creado_en', hasta);

    const { data, error } = await query;
    if (error) throw error;

    const dias = {};
    for (const m of data || []) {
      const fecha = (m.creado_en || '').slice(0, 10); // YYYY-MM-DD
      if (!dias[fecha]) {
        dias[fecha] = { fecha, entradas: 0, salidas: 0, unidades_vendidas: 0, ingresos: 0, ganancia: 0 };
      }
      if (m.tipo === 'entrada') dias[fecha].entradas += m.cantidad;
      if (m.tipo === 'salida') {
        dias[fecha].salidas += m.cantidad;
        dias[fecha].unidades_vendidas += m.cantidad;
        dias[fecha].ingresos += (m.precio_venta || 0) * m.cantidad;
        dias[fecha].ganancia += (m.ganancia || 0);
      }
    }

    res.json(Object.values(dias).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
  } catch (err) {
    console.error('Error en getReporteDiario:', err);
    const { status, message } = parseError(err, 'Error al generar el reporte');
    res.status(status).json({ error: message });
  }
};

// GET /api/inventario  (admin) — productos con stock por talla, costo, venta y ganancia
const getInventario = async (req, res) => {
  try {
    const soloDisponibles = req.query.entrega_inmediata === 'true';

    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, imagen_url, precio, descuento, precio_costo, activo,
        categorias!left(nombre),
        marcas!left(nombre)
      `)
      .order('nombre', { ascending: true });
    if (error) throw error;

    const ids = (productos || []).map(p => p.id);
    let tallasPorProducto = {};
    let coloresPorProducto = {};
    if (ids.length > 0) {
      const [tallasRes, coloresRes] = await Promise.all([
        supabase
          .from('producto_tallas')
          .select('producto_id, cantidad, tallas(id, valor, valor_us, valor_eur, valor_cm, genero)')
          .in('producto_id', ids),
        supabase
          .from('producto_colores')
          .select('producto_id, colores(nombre, codigo_hex)')
          .in('producto_id', ids)
      ]);
      if (tallasRes.error) throw tallasRes.error;
      if (coloresRes.error) throw coloresRes.error;

      for (const pt of tallasRes.data || []) {
        if (!tallasPorProducto[pt.producto_id]) tallasPorProducto[pt.producto_id] = [];
        tallasPorProducto[pt.producto_id].push({
          talla_id: pt.tallas.id,
          talla: pt.tallas.valor,
          valor_us: pt.tallas.valor_us,
          valor_eur: pt.tallas.valor_eur,
          valor_cm: pt.tallas.valor_cm,
          genero: pt.tallas.genero,
          cantidad: pt.cantidad ?? 0
        });
      }

      for (const pc of coloresRes.data || []) {
        if (!pc.colores) continue;
        if (!coloresPorProducto[pc.producto_id]) coloresPorProducto[pc.producto_id] = [];
        coloresPorProducto[pc.producto_id].push({ nombre: pc.colores.nombre, codigo_hex: pc.colores.codigo_hex });
      }
    }

    let resultado = (productos || []).map(p => {
      const tallas = (tallasPorProducto[p.id] || []).sort((a, b) =>
        String(a.talla).localeCompare(String(b.talla), undefined, { numeric: true })
      );
      const stockTotal = tallas.reduce((s, t) => s + (t.cantidad || 0), 0);
      const precioFinal = Math.round(p.precio * (1 - (p.descuento || 0) / 100));
      const costo = p.precio_costo ?? null;
      const gananciaUnit = costo != null ? precioFinal - costo : null;
      const margen = (costo != null && precioFinal > 0) ? Math.round(((precioFinal - costo) / precioFinal) * 100) : null;

      return {
        id: p.id,
        nombre: p.nombre,
        imagen_url: p.imagen_url,
        activo: p.activo ?? true,
        categoria: p.categorias?.nombre || 'Sin categoría',
        marca: p.marcas?.nombre || null,
        precio: p.precio,
        precio_final: precioFinal,
        precio_costo: costo,
        ganancia_unit: gananciaUnit,
        margen,
        stock_total: stockTotal,
        entrega_inmediata: stockTotal > 0,
        valor_inventario_costo: costo != null ? costo * stockTotal : null,
        tallas,
        colores: coloresPorProducto[p.id] || []
      };
    });

    if (soloDisponibles) {
      resultado = resultado.filter(p => p.stock_total > 0);
    }

    res.json(resultado);
  } catch (err) {
    console.error('Error en getInventario:', err);
    const { status, message } = parseError(err, 'Error al obtener el inventario');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  registrarMovimiento,
  crearMovimiento,
  getMovimientos,
  getReporteDiario,
  getInventario
};
