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

// GET /productos
router.get('/', getProductos);

// GET /productos/:id
router.get('/:id', getProductoById);

// POST /productos (con imagen opcional)
router.post('/', upload.single('imagen'), crearProducto);

// PUT /productos/:id (con imagen opcional)
router.put('/:id', upload.single('imagen'), actualizarProducto);

// DELETE /productos/:id
router.delete('/:id', eliminarProducto);

module.exports = router;
