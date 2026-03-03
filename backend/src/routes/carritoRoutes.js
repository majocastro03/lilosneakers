const express = require('express');
const router = express.Router();
const { validarCarrito } = require('../controllers/carritoController');

// Public route - validate cart items
router.post('/validar', validarCarrito);

module.exports = router;
