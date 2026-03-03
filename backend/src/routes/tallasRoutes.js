const express = require('express');
const router = express.Router();
const {
    getTallas,
    getTallaById,
    crearTalla,
    actualizarTalla,
    eliminarTalla
} = require('../controllers/tallasController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateTalla } = require('../middleware/validate');

// Rutas públicas
router.get('/', getTallas);
router.get('/:id', getTallaById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, validateTalla, crearTalla);
router.put('/:id', authMiddleware, adminMiddleware, validateTalla, actualizarTalla);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarTalla);

module.exports = router;
