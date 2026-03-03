const express = require('express');
const router = express.Router();
const {
    getMarcas,
    getMarcaById,
    crearMarca,
    actualizarMarca,
    eliminarMarca
} = require('../controllers/marcasController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateMarca } = require('../middleware/validate');

// Rutas públicas
router.get('/', getMarcas);
router.get('/:id', getMarcaById);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, validateMarca, crearMarca);
router.put('/:id', authMiddleware, adminMiddleware, validateMarca, actualizarMarca);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarMarca);

module.exports = router;
