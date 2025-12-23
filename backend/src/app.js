const express = require('express');
const path = require('path'); // ✅ Añade esto
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const categoriasRoutes = require('./routes/categoriasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const perfilesRoutes = require('./routes/perfilesRoutes');
const marcasRoutes = require('./routes/marcasRoutes');
const authRoutes = require('./routes/autenticacionRoutes');

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Desactivar CSP por ahora para desarrollo
}));

// CORS - Permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:4200',
  'https://lilosneakers.netlify.app', // Tu dominio de Netlify
  process.env.FRONTEND_URL // Variable de entorno
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como apps móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/auth', authRoutes);
// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;