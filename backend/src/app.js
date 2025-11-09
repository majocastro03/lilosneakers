const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar rutas
const categoriasRoutes = require('./routes/categoriasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const perfilesRoutes = require('./routes/perfilesRoutes');
const marcasRoutes = require('./routes/marcasRoutes');
const authRoutes = require('./routes/autenticacionRoutes');
const coloresRoutes = require('./routes/coloresRoutes');
const tallasRoutes = require('./routes/tallasRoutes');
const modificacionesRoutes = require('./routes/modificacionesRoutes');

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/colores', coloresRoutes);
app.use('/api/tallas', tallasRoutes);
app.use('/api/modificaciones', modificacionesRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
