const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productosController');
const upload = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateProducto } = require('../middleware/validate');

// Rutas públicas
router.get('/', getProductos);
router.get('/:id', getProductoById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, upload.single('imagen'), validateProducto, crearProducto);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagen'), validateProducto, actualizarProducto);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarProducto);

module.exports = router;
