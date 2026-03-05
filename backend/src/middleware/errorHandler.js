const errorHandler = (err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo excede el tamaño máximo de 5MB' });
  }
  if (err.message === 'Solo se permiten imágenes') {
    return res.status(400).json({ error: 'Solo se permiten archivos de imagen' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message || 'Error interno del servidor';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
