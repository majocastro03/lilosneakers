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
const carritoRoutes = require('./routes/carritoRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Ruta de salud (antes de CORS/helmet para que Render pueda hacer health checks)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''].filter(Boolean),
    }
  }
}));

// CORS - Permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:4200',
  'https://lilosneakers.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (health checks, apps móviles, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting global para API
app.use('/api', apiLimiter);

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
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware global de errores (DEBE ir al final)
app.use(errorHandler);

module.exports = app;
