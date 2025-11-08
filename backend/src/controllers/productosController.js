const supabase = require('../config/supabaseCliente');
const path = require('path');
const fs = require('fs').promises;

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
        mostrar_precio,
        categorias!left(nombre, slug),
        marcas!left(nombre, slug, imagen_url)
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
    console.error('Error en getProductos:', err);
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
    console.error('Error en getProductoById:', err);
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// POST /productos
const crearProducto = async (req, res) => {
  try {
    // 1. Validar cuerpo
    const {
      nombre,
      precio,
      descuento = 0,
      descripcion,
      destacado = false,
      categoria_id,
      colores = [],
      tallas = []
    } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    // 2. Manejar archivo (si se sube con multer)
    let imagenUrl = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads/productos');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      await fs.writeFile(filepath, req.file.buffer);

      // URL absoluta (clave para que funcione en frontend)
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagenUrl = `${baseUrl}/uploads/productos/${filename}`;
    }
    // 3. Insertar producto
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert([
        {
          nombre,
          precio: parseFloat(precio),
          descuento: parseFloat(descuento),
          imagen_url: imagenUrl,
          descripcion,
          destacado,
          categoria_id: categoria_id || null
        }
      ])
      .select()
      .single();

    if (productoError) throw productoError;

    // 4. Insertar colores (si hay)
    // if (colores.length > 0) {
    //   const coloresData = colores.map(color => ({
    //     producto_id: producto.id,
    //     color_id: color.id
    //   }));

    //   const { error: coloresError } = await supabase
    //     .from('producto_colores')
    //     .insert(coloresData);

    //   if (coloresError) throw coloresError;
    // }

    // 5. Insertar tallas (si hay)
    // if (tallas.length > 0) {
    //   const tallasData = tallas.map(t => ({
    //     producto_id: producto.id,
    //     talla_id: t.id,
    //     cantidad: parseInt(t.cantidad) || 0
    //   }));

    //   const { error: tallasError } = await supabase
    //     .from('producto_tallas')
    //     .insert(tallasData);

    //   if (tallasError) throw tallasError;
    // }

    // 6. Responder
    res.status(201).json({
      message: 'Producto creado con éxito',
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        imagen_url: producto.imagen_url
      }
    });

  } catch (err) {
    console.error('Error en crearProducto:', err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto
};