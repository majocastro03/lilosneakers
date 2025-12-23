const ProductoModel = require('../models/ProductoModel');
const supabase = require('../config/supabaseCliente');
const fs = require('fs').promises;
const path = require('path');

// GET /api/productos
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
        categoria_id,
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
      precio_final: Math.round(p.precio * (1 - p.descuento / 100)),
      imagen_url: p.imagen_url,
      descripcion: p.descripcion,
      destacado: p.destacado,
      categoria: p.categorias?.nombre || 'Sin categoría',
      categoria_slug: p.categorias?.slug || null,
      categoria_id: p.categoria_id,
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

// GET /api/productos/:id
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
        categoria_id,
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
      categoria_id: producto.categoria_id,
      colores: coloresRes.data.map(pc => pc.colores),
      tallas: tallasRes.data.map(pt => ({
        talla: pt.tallas.valor,
        cantidad: pt.cantidad
      }))
    };

    res.json(productoFormateado);

  } catch (err) {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
};

// POST /api/productos
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      precio,
      descuento = 0,
      descripcion,
      destacado = false,
      categoria_id
    } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    // Manejar archivo
    let imagenUrl = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads/productos');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, req.file.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagenUrl = `${baseUrl}/uploads/productos/${filename}`;
    }

    // Insertar producto
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert([
        {
          nombre,
          precio: parseFloat(precio),
          descuento: parseFloat(descuento),
          imagen_url: imagenUrl,
          descripcion,
          destacado: destacado === 'true' || destacado === true,
          categoria_id: categoria_id || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

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

// PUT /productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      precio,
      descuento = 0,
      descripcion,
      destacado = false,
      categoria_id
    } = req.body;

    // Construir objeto de actualización
    const updateData = {
      nombre,
      precio: parseFloat(precio),
      descuento: parseFloat(descuento),
      descripcion,
      destacado: destacado === 'true' || destacado === true,
      categoria_id: categoria_id || null
    };

    // Si hay nueva imagen
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads/productos');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      await fs.writeFile(filepath, req.file.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.imagen_url = `${baseUrl}/uploads/productos/${filename}`;
    }

    // Actualizar producto
    const { data: producto, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Producto actualizado con éxito',
      producto
    });

  } catch (err) {
    console.error('Error en actualizarProducto:', err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// DELETE /productos/:id
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar producto
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Producto eliminado con éxito' });

  } catch (err) {
    console.error('Error en eliminarProducto:', err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};

