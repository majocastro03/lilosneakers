const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD
router.get('/', productosController.getProductos);
router.get('/:id', productosController.getProductoById);
router.post('/', upload.single('imagen'), productosController.crearProducto);
router.put('/:id', productosController.actualizarProducto);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
