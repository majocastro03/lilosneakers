const supabase = require('../config/supabaseCliente');

// GET /productos
const getProductos = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('productos')
      .select(`
        id,
        nombre,
        precio,
        descuento,
        imagen_url,
        descripcion,
        destacado,
        categorias!left(nombre, slug)
      `, { count: 'exact' })
      .order('destacado', { ascending: false })
      .order('nombre', { ascending: true });

    // Filtros
    if (req.query.categoria_id) {
      query = query.eq('categoria_id', req.query.categoria_id);
    }
    if (req.query.destacado) {
      const isDestacado = req.query.destacado === 'true';
      query = query.eq('destacado', isDestacado);
    }
    if (req.query.q) {
      const q = req.query.q.trim();
      if (q) {
        query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`);
      }
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    // Ejecutar query
    const { data: productos, error, count } = await query;
    if (error) throw error;

    // Si no hay productos, devolver vacío (pero con metadatos)
    if (productos.length === 0) {
      return res.json({
        productos: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }

    // IDs para cargar colores y tallas
    const ids = productos.map(p => p.id);

    // Cargar colores y tallas en paralelo
    const [coloresRes, tallasRes] = await Promise.all([
      supabase
        .from('producto_colores')
        .select('producto_id, colores(nombre, codigo_hex)')
        .in('producto_id', ids),

      supabase
        .from('producto_tallas')
        .select('producto_id, cantidad, tallas(valor)')
        .in('producto_id', ids)
    ]);

    if (coloresRes.error) throw coloresRes.error;
    if (tallasRes.error) throw tallasRes.error;

    // Agrupar colores por producto_id
    const coloresMap = {};
    coloresRes.data.forEach(pc => {
      if (!coloresMap[pc.producto_id]) coloresMap[pc.producto_id] = [];
      coloresMap[pc.producto_id].push(pc.colores);
    });

    // Agrupar tallas por producto_id
    const tallasMap = {};
    tallasRes.data.forEach(pt => {
      if (!tallasMap[pt.producto_id]) tallasMap[pt.producto_id] = [];
      tallasMap[pt.producto_id].push({
        talla: pt.tallas.valor,
        cantidad: pt.cantidad
      });
    });

    // Formatear productos
    const productosFormateados = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      descuento: p.descuento,
      precio_final: Math.round(p.precio * (1 - p.descuento / 100)), // Redondeo para evitar decimales
      imagen_url: p.imagen_url,
      descripcion: p.descripcion,
      destacado: p.destacado,
      categoria: p.categorias?.nombre || 'Sin categoría',
      categoria_slug: p.categorias?.slug || null,
      colores: coloresMap[p.id] || [],
      tallas: tallasMap[p.id] || []
    }));

    // Responder con metadatos
    res.json({
      productos: productosFormateados,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error('❌ Error en getProductos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// GET /productos/:id
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Producto
    const { data: producto, error } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        precio,
        descuento,
        imagen_url,
        descripcion,
        destacado,
        categorias!left(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Colores y tallas
    const [coloresRes, tallasRes] = await Promise.all([
      supabase
        .from('producto_colores')
        .select('colores(nombre, codigo_hex)')
        .eq('producto_id', id),

      supabase
        .from('producto_tallas')
        .select('cantidad, tallas(valor)')
        .eq('producto_id', id)
    ]);

    if (coloresRes.error) throw coloresRes.error;
    if (tallasRes.error) throw tallasRes.error;

    const productoFormateado = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descuento: producto.descuento,
      precio_final: Math.round(producto.precio * (1 - producto.descuento / 100)),
      imagen_url: producto.imagen_url,
      descripcion: producto.descripcion,
      destacado: producto.destacado,
      categoria: producto.categorias?.nombre || 'Sin categoría',
      colores: coloresRes.data.map(pc => pc.colores),
      tallas: tallasRes.data.map(pt => ({
        talla: pt.tallas.valor,
        cantidad: pt.cantidad
      }))
    };

    res.json(productoFormateado);

  } catch (err) {
    console.error('❌ Error en getProductoById:', err);
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

module.exports = { getProductos, getProductoById };