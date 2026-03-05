const supabase = require('../config/supabaseCliente');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Get profile for role info
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('id, nombre, apellido, username, tipo_usuario')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      tipo_usuario: perfil?.tipo_usuario || 'cliente',
      perfil
    };

    next();
  } catch (err) {
    console.error('Error en authMiddleware:', err);
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
