const express = require('express');
const { login, obtenerPerfil, logout } = require('../controllers/autenticacionController');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, obtenerPerfil);

module.exports = router;
