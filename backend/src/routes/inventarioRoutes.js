const express = require('express');
const router = express.Router();
const {
  crearMovimiento,
  getMovimientos,
  getReporteDiario,
  getInventario
} = require('../controllers/inventarioController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Todo el módulo de inventario es privado (solo admin)
router.get('/', authMiddleware, adminMiddleware, getInventario);
router.get('/movimientos', authMiddleware, adminMiddleware, getMovimientos);
router.post('/movimientos', authMiddleware, adminMiddleware, crearMovimiento);
router.get('/reporte', authMiddleware, adminMiddleware, getReporteDiario);

module.exports = router;
