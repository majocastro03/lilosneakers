const express = require('express');
const router = express.Router();
const {
    getMarcas,
    getMarcaById,
    crearMarca,
    actualizarMarca,
    eliminarMarca
} = require('../controllers/marcasController');

router.get('/', getMarcas);
router.get('/:id', getMarcaById);
router.post('/', crearMarca);
router.put('/:id', actualizarMarca);
router.delete('/:id', eliminarMarca);

module.exports = router;
