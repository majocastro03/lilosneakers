const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productosController');
const {
  asignarColores,
  asignarTallas,
  eliminarColorProducto,
  eliminarTallaProducto,
} = require('../controllers/modificacionesController');
const {
  getImagenes,
  subirImagen,
  eliminarImagen,
} = require('../controllers/productoImagenesController');
const upload = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateProducto } = require('../middleware/validate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateProducto } = require('../middleware/validate');

// Rutas públicas
// Rutas públicas
router.get('/', getProductos);
router.get('/:id', getProductoById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, upload.single('imagen'), validateProducto, crearProducto);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagen'), validateProducto, actualizarProducto);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarProducto);

// Asignación de colores y tallas a productos (admin)
router.post('/:producto_id/colores', authMiddleware, adminMiddleware, asignarColores);
router.delete('/:producto_id/colores/:color_id', authMiddleware, adminMiddleware, eliminarColorProducto);
router.post('/:producto_id/tallas', authMiddleware, adminMiddleware, asignarTallas);
router.delete('/:producto_id/tallas/:talla_id', authMiddleware, adminMiddleware, eliminarTallaProducto);

// Imágenes de producto (admin)
router.get('/:producto_id/imagenes', getImagenes);
router.post('/:producto_id/imagenes', authMiddleware, adminMiddleware, upload.single('imagen'), subirImagen);
router.delete('/:producto_id/imagenes/:imagen_id', authMiddleware, adminMiddleware, eliminarImagen);

module.exports = router;
