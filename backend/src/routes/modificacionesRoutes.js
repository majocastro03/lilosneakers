const express = require('express');
const router = express.Router();
const {
    asignarColores,
    asignarTallas,
    eliminarColorProducto,
    eliminarTallaProducto,
} = require('../controllers/modificacionesController');

router.post('/:producto_id/colores', asignarColores);
router.delete('/:producto_id/colores/:color_id', eliminarColorProducto);
router.post('/:producto_id/tallas', asignarTallas);
router.delete('/:producto_id/tallas/:talla_id', eliminarTallaProducto);

module.exports = router;
