const express = require('express');
const router = express.Router();
const { getProductos, getProductoById, crearProducto } = require('../controllers/productosController');
const upload = require('../middleware/upload');

// GET /productos
router.get('/', getProductos);

// GET /productos/:id
router.get('/:id', getProductoById);

// POST /productos (con imagen opcional)
router.post('/', upload.single('imagen'), crearProducto);

module.exports = router;