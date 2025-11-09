const express = require('express');
const { login, obtenerPerfil, logout } = require('../controllers/autenticacionController');
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/getUser', obtenerPerfil);


module.exports = router;