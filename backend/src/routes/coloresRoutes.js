const express = require('express');
const router = express.Router();
const {
    getColores,
    getColorById,
    crearColor,
    actualizarColor,
    eliminarColor
} = require('../controllers/coloresController');

router.get('/', getColores);
router.get('/:id', getColorById);
router.post('/', crearColor);
router.put('/:id', actualizarColor);
router.delete('/:id', eliminarColor);

module.exports = router;
