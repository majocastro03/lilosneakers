const express = require('express');
const path = require('path'); // ✅ Añade esto
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const categoriasRoutes = require('./routes/categoriasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const perfilesRoutes = require('./routes/perfilesRoutes');
const marcasRoutes = require('./routes/marcasRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/marcas', marcasRoutes);
// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;