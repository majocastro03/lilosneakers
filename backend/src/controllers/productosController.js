const ProductoModel = require('../models/ProductoModel');
const supabase = require('../config/supabaseCliente');
const fs = require('fs').promises;
const path = require('path');

// GET /api/productos
const getProductos = async (req, res) => {
  try {
    const result = await ProductoModel.findAll(req.query);
    res.json(result);
  } catch (err) {
    console.error('Error en getProductos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// GET /api/productos/:id
const getProductoById = async (req, res) => {
  try {
    const { data, error } = await ProductoModel.findById(req.params.id);
    if (error) throw error;
    res.json(data);
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
      mostrar_precio = true,
      categoria_id,
      marca_id,
      colores = [],
      tallas = [],
    } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    // Manejo de imagen (si llega con multer)
    let imagen_url = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads/productos');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, req.file.buffer);

      imagen_url = `uploads/productos/${filename}`;
    }

    const { data: producto, error } = await ProductoModel.create({
      nombre,
      precio: parseFloat(precio),
      descuento: parseFloat(descuento),
      descripcion,
      destacado,
      mostrar_precio,
      imagen_url,
      categoria_id: categoria_id || null,
      marca_id: marca_id || null,
    });

    if (error) throw error;

    // Asignar relaciones
    if (colores.length > 0) {
      const dataColores = colores.map(c => ({ producto_id: producto.id, color_id: c.id }));
      await supabase.from('producto_colores').insert(dataColores);
    }

    if (tallas.length > 0) {
      const dataTallas = tallas.map(t => ({
        producto_id: producto.id,
        talla_id: t.id,
        cantidad: t.cantidad || 0,
      }));
      await supabase.from('producto_tallas').insert(dataTallas);
    }

    res.status(201).json({ message: 'Producto creado con éxito', producto });
  } catch (err) {
    console.error('Error en crearProducto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT /api/productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await ProductoModel.update(id, req.body);
    if (error) throw error;
    res.json({ message: 'Producto actualizado', producto: data });
  } catch (err) {
    console.error('Error en actualizarProducto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE /api/productos/:id
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('producto_colores').delete().eq('producto_id', id);
    await supabase.from('producto_tallas').delete().eq('producto_id', id);
    const { error } = await ProductoModel.delete(id);
    if (error) throw error;
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error en eliminarProducto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
