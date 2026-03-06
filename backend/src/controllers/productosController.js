const supabase = require('../config/supabaseCliente');
const crypto = require('crypto');
const parseError = require('../utils/parseError');

// GET /api/productos
const getProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('productos')
      .select(`
        id, nombre, precio, descuento, imagen_url, descripcion, destacado, mostrar_precio, activo,
        categoria_id, marca_id,
        categorias!left(nombre, slug),
        marcas!left(nombre, slug, imagen_url)
      `, { count: 'exact' });

    // By default, only show active products (storefront). Admin passes incluir_inactivos=true
    if (req.query.incluir_inactivos !== 'true') {
      query = query.eq('activo', true);
    }

    // Ordenamiento
    const orderBy = req.query.orderBy;
    if (orderBy === 'precio_asc') {
      query = query.order('precio', { ascending: true });
    } else if (orderBy === 'precio_desc') {
      query = query.order('precio', { ascending: false });
    } else {
      query = query.order('destacado', { ascending: false }).order('nombre', { ascending: true });
    }

    // Filtros
    if (req.query.categoria_id) {
      query = query.eq('categoria_id', req.query.categoria_id);
    }
    if (req.query.marca_id) {
      query = query.eq('marca_id', req.query.marca_id);
    }
    if (req.query.marca_id) {
      query = query.eq('marca_id', req.query.marca_id);
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
    if (req.query.precio_min) {
      query = query.gte('precio', parseFloat(req.query.precio_min));
    }
    if (req.query.precio_max) {
      query = query.lte('precio', parseFloat(req.query.precio_max));
    }

    if (req.query.precio_min) {
      query = query.gte('precio', parseFloat(req.query.precio_min));
    }
    if (req.query.precio_max) {
      query = query.lte('precio', parseFloat(req.query.precio_max));
    }

    query = query.range(offset, offset + limit - 1);

    const { data: productos, error, count } = await query;
    if (error) throw error;

    if (productos.length === 0) {
      return res.json({
        productos: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }

    let ids = productos.map(p => p.id);

    // Pre-filter by color_id or talla_id if specified (junction table filters)
    if (req.query.color_id) {
      const { data: colorFilter, error: cfErr } = await supabase
        .from('producto_colores')
        .select('producto_id')
        .eq('color_id', req.query.color_id)
        .in('producto_id', ids);
      if (cfErr) throw cfErr;
      const validIds = new Set(colorFilter.map(r => r.producto_id));
      ids = ids.filter(id => validIds.has(id));
    }
    if (req.query.talla_id) {
      const { data: tallaFilter, error: tfErr } = await supabase
        .from('producto_tallas')
        .select('producto_id')
        .eq('talla_id', req.query.talla_id)
        .in('producto_id', ids);
      if (tfErr) throw tfErr;
      const validIds = new Set(tallaFilter.map(r => r.producto_id));
      ids = ids.filter(id => validIds.has(id));
    }

    // Filter productos to only include valid ids
    const filteredProductos = (req.query.color_id || req.query.talla_id)
      ? productos.filter(p => ids.includes(p.id))
      : productos;

    if (filteredProductos.length === 0) {
      return res.json({
        productos: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }

    const [coloresRes, tallasRes, imagenesRes] = await Promise.all([
      supabase
        .from('producto_colores')
        .select('producto_id, color_id, colores(id, nombre, codigo_hex)')
        .in('producto_id', ids),
      supabase
        .from('producto_tallas')
        .select('producto_id, cantidad, tallas(id, valor, valor_us, valor_eur, valor_cm, genero)')
        .in('producto_id', ids),
      supabase
        .from('producto_imagenes')
        .select('id, producto_id, imagen_url, orden')
        .in('producto_id', ids)
        .order('orden', { ascending: true })
    ]);

    if (coloresRes.error) throw coloresRes.error;
    if (tallasRes.error) throw tallasRes.error;
    if (imagenesRes.error) throw imagenesRes.error;

    const coloresMap = {};
    coloresRes.data.forEach(pc => {
      if (!coloresMap[pc.producto_id]) coloresMap[pc.producto_id] = [];
      coloresMap[pc.producto_id].push({ id: pc.colores.id, nombre: pc.colores.nombre, codigo_hex: pc.colores.codigo_hex });
    });

    const tallasMap = {};
    tallasRes.data.forEach(pt => {
      if (!tallasMap[pt.producto_id]) tallasMap[pt.producto_id] = [];
      tallasMap[pt.producto_id].push({
        id: pt.tallas.id,
        id: pt.tallas.id,
        talla: pt.tallas.valor,
        valor_us: pt.tallas.valor_us,
        valor_eur: pt.tallas.valor_eur,
        valor_cm: pt.tallas.valor_cm,
        genero: pt.tallas.genero,
        cantidad: pt.cantidad
      });
    });

    const imagenesMap = {};
    imagenesRes.data.forEach(pi => {
      if (!imagenesMap[pi.producto_id]) imagenesMap[pi.producto_id] = [];
      imagenesMap[pi.producto_id].push({ id: pi.id, imagen_url: pi.imagen_url, orden: pi.orden });
    });

    const productosFormateados = filteredProductos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      descuento: p.descuento,
      precio_final: Math.round(p.precio * (1 - p.descuento / 100)),
      imagen_url: p.imagen_url,
      descripcion: p.descripcion,
      destacado: p.destacado,
      mostrar_precio: p.mostrar_precio,
      activo: p.activo ?? true,
      categoria: p.categorias?.nombre || 'Sin categoría',
      categoria_slug: p.categorias?.slug || null,
      categoria_id: p.categoria_id,
      marca_id: p.marca_id,
      marca: p.marcas || null,
      colores: coloresMap[p.id] || [],
      tallas: tallasMap[p.id] || [],
      imagenes: imagenesMap[p.id] || []
    }));

    const finalTotal = (req.query.color_id || req.query.talla_id) ? filteredProductos.length : count;

    const finalTotal = (req.query.color_id || req.query.talla_id) ? filteredProductos.length : count;

    res.json({
      productos: productosFormateados,
      total: finalTotal,
      total: finalTotal,
      page,
      limit,
      totalPages: Math.ceil(finalTotal / limit)
      totalPages: Math.ceil(finalTotal / limit)
    });

  } catch (err) {
    console.error('Error en getProductos:', err);
    const { status, message } = parseError(err, 'Error al obtener productos');
    res.status(status).json({ error: message });
  }
};

// GET /api/productos/:id
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: producto, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, precio, descuento, imagen_url, descripcion, destacado, mostrar_precio, activo,
        categoria_id, marca_id,
        categorias!left(nombre, slug),
        marcas!left(nombre, slug, imagen_url)
      `)
      .eq('id', id)
      .single();

    if (error || !producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (error || !producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const [coloresRes, tallasRes, imagenesRes] = await Promise.all([
      supabase
        .from('producto_colores')
        .select('color_id, colores(id, nombre, codigo_hex)')
        .eq('producto_id', id),
      supabase
        .from('producto_tallas')
        .select('cantidad, tallas(id, valor, valor_us, valor_eur, valor_cm, genero)')
        .eq('producto_id', id),
      supabase
        .from('producto_imagenes')
        .select('id, imagen_url, orden')
        .eq('producto_id', id)
        .order('orden', { ascending: true })
    ]);

    if (coloresRes.error) throw coloresRes.error;
    if (tallasRes.error) throw tallasRes.error;
    if (imagenesRes.error) throw imagenesRes.error;

    const productoFormateado = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descuento: producto.descuento,
      precio_final: Math.round(producto.precio * (1 - producto.descuento / 100)),
      imagen_url: producto.imagen_url,
      descripcion: producto.descripcion,
      destacado: producto.destacado,
      mostrar_precio: producto.mostrar_precio,
      activo: producto.activo ?? true,
      categoria: producto.categorias?.nombre || 'Sin categoría',
      categoria_slug: producto.categorias?.slug || null,
      categoria_slug: producto.categorias?.slug || null,
      categoria_id: producto.categoria_id,
      marca_id: producto.marca_id,
      marca: producto.marcas || null,
      colores: coloresRes.data.map(pc => ({ id: pc.colores.id, nombre: pc.colores.nombre, codigo_hex: pc.colores.codigo_hex })),
      tallas: tallasRes.data.map(pt => ({
        id: pt.tallas.id,
        id: pt.tallas.id,
        talla: pt.tallas.valor,
        valor_us: pt.tallas.valor_us,
        valor_eur: pt.tallas.valor_eur,
        valor_cm: pt.tallas.valor_cm,
        genero: pt.tallas.genero,
        cantidad: pt.cantidad
      })),
      imagenes: imagenesRes.data.map(pi => ({ id: pi.id, imagen_url: pi.imagen_url, orden: pi.orden }))
    };

    res.json(productoFormateado);

  } catch (err) {
    console.error('Error en getProductoById:', err);
    const { status, message } = parseError(err, 'Error al obtener el producto');
    res.status(status).json({ error: message });
  }
};

// Helper: Upload image to Supabase Storage
const uploadImage = async (file) => {
  const ext = file.originalname.split('.').pop();
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const filePath = `productos/${filename}`;

  const { data, error } = await supabase.storage
    .from('imagenes')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('imagenes')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Helper: Delete image from Supabase Storage
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Extract path from URL
    const match = imageUrl.match(/imagenes\/(.+)$/);
    if (match) {
      await supabase.storage.from('imagenes').remove([match[1]]);
    }
  } catch (err) {
    console.error('Error al eliminar imagen:', err);
  }
};

// POST /api/productos
const crearProducto = async (req, res) => {
  try {
    const {
      nombre, precio, descuento = 0, descripcion, destacado = false, categoria_id, marca_id, activo = true
    } = req.body;

    let imagenUrl = null;
    if (req.file) {
      imagenUrl = await uploadImage(req.file);
    }

      imagenUrl = await uploadImage(req.file);
    }

    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert([{
        nombre,
        precio: parseFloat(precio),
        descuento: parseFloat(descuento),
        imagen_url: imagenUrl,
        descripcion,
        destacado: destacado === 'true' || destacado === true,
        activo: activo === 'true' || activo === true,
        categoria_id: categoria_id || null,
        marca_id: marca_id || null
      }])
      .select()
      .single();

    if (productoError) throw productoError;
    if (productoError) throw productoError;

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
    const { status, message } = parseError(err, 'Error al crear el producto');
    res.status(status).json({ error: message });
  }
};

// PUT /productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, precio, descuento = 0, descripcion, destacado = false, categoria_id, marca_id, activo = true
    } = req.body;

    const updateData = {
      nombre,
      precio: parseFloat(precio),
      descuento: parseFloat(descuento),
      descripcion,
      destacado: destacado === 'true' || destacado === true,
      activo: activo === 'true' || activo === true,
      categoria_id: categoria_id || null,
      marca_id: marca_id || null
    };

    if (req.file) {
      // Delete old image
      const { data: existing } = await supabase
        .from('productos')
        .select('imagen_url')
        .eq('id', id)
        .single();

      if (existing?.imagen_url) {
        await deleteImage(existing.imagen_url);
      }

      updateData.imagen_url = await uploadImage(req.file);
      // Delete old image
      const { data: existing } = await supabase
        .from('productos')
        .select('imagen_url')
        .eq('id', id)
        .single();

      if (existing?.imagen_url) {
        await deleteImage(existing.imagen_url);
      }

      updateData.imagen_url = await uploadImage(req.file);
    }

    const { data: producto, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Producto actualizado con éxito', producto });
    res.json({ message: 'Producto actualizado con éxito', producto });

  } catch (err) {
    console.error('Error en actualizarProducto:', err);
    const { status, message } = parseError(err, 'Error al actualizar el producto');
    res.status(status).json({ error: message });
  }
};

// DELETE /productos/:id
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete image from storage
    const { data: existing } = await supabase
      .from('productos')
      .select('imagen_url')
      .eq('id', id)
      .single();

    if (existing?.imagen_url) {
      await deleteImage(existing.imagen_url);
    }

    // Delete image from storage
    const { data: existing } = await supabase
      .from('productos')
      .select('imagen_url')
      .eq('id', id)
      .single();

    if (existing?.imagen_url) {
      await deleteImage(existing.imagen_url);
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Producto eliminado con éxito' });

  } catch (err) {
    console.error('Error en eliminarProducto:', err);
    const { status, message } = parseError(err, 'Error al eliminar el producto');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
