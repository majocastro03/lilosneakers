const express = require('express');
const router = express.Router();
const {
    asignarColores,
    asignarTallas,
    eliminarColorProducto,
    eliminarTallaProducto,
} = require('../controllers/modificacionesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Todas las rutas de modificaciones son admin-only
router.post('/:producto_id/colores', authMiddleware, adminMiddleware, asignarColores);
router.delete('/:producto_id/colores/:color_id', authMiddleware, adminMiddleware, eliminarColorProducto);
router.post('/:producto_id/tallas', authMiddleware, adminMiddleware, asignarTallas);
router.delete('/:producto_id/tallas/:talla_id', authMiddleware, adminMiddleware, eliminarTallaProducto);

module.exports = router;
