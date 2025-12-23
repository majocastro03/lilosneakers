const express = require('express');
const router = express.Router();
const {
    getTallas,
    getTallaById,
    crearTalla,
    actualizarTalla,
    eliminarTalla
} = require('../controllers/tallasController');

router.get('/', getTallas);
router.get('/:id', getTallaById);
router.post('/', crearTalla);
router.put('/:id', actualizarTalla);
router.delete('/:id', eliminarTalla);

module.exports = router;
