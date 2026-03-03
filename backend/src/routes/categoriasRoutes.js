const express = require('express');
const router = express.Router();
const {
    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
} = require('../controllers/categoriasController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateCategoria } = require('../middleware/validate');

// Rutas públicas
router.get('/', getCategorias);
router.get('/:id', getCategoriaById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, validateCategoria, createCategoria);
router.put('/:id', authMiddleware, adminMiddleware, validateCategoria, updateCategoria);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategoria);

module.exports = router;
