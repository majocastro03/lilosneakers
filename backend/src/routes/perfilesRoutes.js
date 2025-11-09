const express = require('express');
const { registrarUsuario } = require('../controllers/perfilesController');
const router = express.Router();

router.post('/', registrarUsuario);

module.exports = router;