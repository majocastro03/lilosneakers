const express = require('express');
const router = express.Router();
const { getMarcas, getMarcaById, crearMarca } = require('../controllers/marcasController');

router.get('/', getMarcas);
router.get('/:id', getMarcaById);
router.post('/', crearMarca); 

module.exports = router;