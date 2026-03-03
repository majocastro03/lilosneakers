// backend/src/middleware/validate.js

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};

const validateProducto = (req, res, next) => {
  const { nombre, precio, descuento } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (nombre.trim().length > 200) {
    return res.status(400).json({ error: 'El nombre no puede exceder 200 caracteres' });
  }

  if (precio === undefined || precio === null || precio === '') {
    return res.status(400).json({ error: 'El precio es requerido' });
  }
  const precioNum = parseFloat(precio);
  if (isNaN(precioNum) || precioNum < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }
  if (precioNum > 99999999) {
    return res.status(400).json({ error: 'El precio excede el máximo permitido' });
  }

  if (descuento !== undefined && descuento !== null && descuento !== '') {
    const descuentoNum = parseFloat(descuento);
    if (isNaN(descuentoNum) || descuentoNum < 0 || descuentoNum > 100) {
      return res.status(400).json({ error: 'El descuento debe ser entre 0 y 100' });
    }
  }

  // Sanitize strings
  req.body.nombre = sanitizeString(nombre);
  if (req.body.descripcion) {
    req.body.descripcion = sanitizeString(req.body.descripcion);
  }

  next();
};

const validateCategoria = (req, res, next) => {
  const { nombre, slug } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (nombre.trim().length > 100) {
    return res.status(400).json({ error: 'El nombre no puede exceder 100 caracteres' });
  }
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return res.status(400).json({ error: 'El slug es requerido' });
  }
  if (!/^[a-z0-9-]+$/.test(slug.trim())) {
    return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas, números y guiones' });
  }

  req.body.nombre = sanitizeString(nombre);
  req.body.slug = slug.trim().toLowerCase();
  next();
};

const validateMarca = (req, res, next) => {
  const { nombre, slug } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return res.status(400).json({ error: 'El slug es requerido' });
  }

  req.body.nombre = sanitizeString(nombre);
  req.body.slug = slug.trim().toLowerCase();
  if (req.body.descripcion) req.body.descripcion = sanitizeString(req.body.descripcion);
  next();
};

const validateColor = (req, res, next) => {
  const { nombre, codigo_hex } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (!codigo_hex || typeof codigo_hex !== 'string') {
    return res.status(400).json({ error: 'El código hex es requerido' });
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(codigo_hex.trim())) {
    return res.status(400).json({ error: 'El código hex debe tener formato #RRGGBB' });
  }

  req.body.nombre = sanitizeString(nombre);
  req.body.codigo_hex = codigo_hex.trim();
  next();
};

const validateTalla = (req, res, next) => {
  const { valor } = req.body;

  if (!valor || (typeof valor !== 'string' && typeof valor !== 'number')) {
    return res.status(400).json({ error: 'El valor de talla es requerido' });
  }

  if (typeof valor === 'string') {
    req.body.valor = sanitizeString(valor);
  }
  next();
};

const validateRegistro = (req, res, next) => {
  const { email, password, nombre, username } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  if (password.length > 72) {
    return res.status(400).json({ error: 'La contraseña no puede exceder 72 caracteres' });
  }
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'El username debe tener al menos 3 caracteres' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return res.status(400).json({ error: 'El username solo puede contener letras, números y guión bajo' });
  }

  req.body.email = email.trim().toLowerCase();
  req.body.nombre = sanitizeString(nombre);
  req.body.username = username.trim().toLowerCase();
  if (req.body.apellido) req.body.apellido = sanitizeString(req.body.apellido);
  next();
};

module.exports = {
  sanitizeString,
  validateProducto,
  validateCategoria,
  validateMarca,
  validateColor,
  validateTalla,
  validateRegistro
};
