const express = require('express');
const router = express.Router();
const {
  crearOrden,
  getOrdenes,
  getOrdenById,
  actualizarEstadoOrden
} = require('../controllers/ordenesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All order routes require authentication
router.post('/', authMiddleware, crearOrden);
router.get('/', authMiddleware, getOrdenes);
router.get('/:id', authMiddleware, getOrdenById);
router.put('/:id/estado', authMiddleware, adminMiddleware, actualizarEstadoOrden);

module.exports = router;
