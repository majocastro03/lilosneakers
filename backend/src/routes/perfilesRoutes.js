const express = require('express');
const { crearPerfil } = require('../controllers/perfilesController');
const router = express.Router();

router.post('/', crearPerfil);

module.exports = router;