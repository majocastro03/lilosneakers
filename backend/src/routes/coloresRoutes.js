const express = require('express');
const router = express.Router();
const {
    getColores,
    getColorById,
    crearColor,
    actualizarColor,
    eliminarColor
} = require('../controllers/coloresController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateColor } = require('../middleware/validate');

// Rutas públicas
router.get('/', getColores);
router.get('/:id', getColorById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, validateColor, crearColor);
router.put('/:id', authMiddleware, adminMiddleware, validateColor, actualizarColor);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarColor);

module.exports = router;
