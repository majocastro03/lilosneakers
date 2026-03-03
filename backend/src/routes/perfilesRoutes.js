const express = require('express');
const { registrarUsuario } = require('../controllers/perfilesController');
const { registerLimiter } = require('../middleware/rateLimiter');
const { validateRegistro } = require('../middleware/validate');
const router = express.Router();

router.post('/', registerLimiter, validateRegistro, registrarUsuario);

module.exports = router;
