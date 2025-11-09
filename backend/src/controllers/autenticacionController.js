const supabase = require('../config/supabaseCliente'); // Debe usar SERVICE_ROLE_KEY

// POST /auth/login → inicio de sesión
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email o username
    console.log('Intentando login para:', identifier);
    // Validación básica
    if (!identifier || !password) {
      return res.status(400).json({ 
        error: 'Faltan credenciales', 
        detalle: 'Se requiere "identifier" (email o username) y "password"' 
      });
    }
    
    let user = null;

    // Opción 1: Intentar login con email
    if (identifier.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password
      });

      if (!error) {
        user = data.user;
      }
    }

    // Opción 2: Si no es email o falló, buscar por username
    if (!user) {
      // Buscar el perfil por username para obtener el email
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, username')
        .eq('username', identifier)
        .single();

      if (perfilError || !perfil) {
        return res.status(401).json({ 
          error: 'Credenciales incorrectas' 
        });
      }

      // Ahora obtener el email desde auth.users (usando Service Role)
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', perfil.id)
        .single();

      if (userError || !userData) {
        return res.status(401).json({ 
          error: 'Credenciales incorrectas' 
        });
      }

      // Intentar login con el email encontrado
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password
      });

      if (loginError) {
        return res.status(401).json({ 
          error: 'Credenciales incorrectas' 
        });
      }

      user = loginData.user;
    }

    // Verificar que el usuario tenga perfil
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('tipo_usuario, nombre, username')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      // Opcional: crear perfil mínimo si no existe (solo para migración)
      return res.status(403).json({ 
        error: 'Perfil no configurado. Contacte al administrador.' 
      });
    }

    // Opcional: Restringir acceso solo a admins (para tu panel)
    // Si quieres permitir clientes también, comenta esta validación
    if (perfil.tipo_usuario !== 'admin') {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo administradores pueden iniciar sesión.' 
      });
    }

    // Éxito: devolver sesión + datos del perfil
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        nombre: perfil.nombre,
        username: perfil.username,
        tipo_usuario: perfil.tipo_usuario
      },
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ 
      error: 'Error interno al procesar el inicio de sesión' 
    });
  }

};

// POST /auth/logout → cerrar sesión
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: 'No se pudo cerrar la sesión', detalle: error.message });
    }

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ error: 'Error interno al cerrar sesión' });
  }
};

// GET /auth/me → obtener perfil del usuario actual (para frontend)
const obtenerPerfil = async (req, res) => {
  try {
    // Obtener sesión desde cookies (Supabase SSR)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const userId = session.user.id;

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('id, nombre, apellido, username, telefono, tipo_usuario, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (perfilError) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.status(200).json({
      user: {
        id: userId,
        email: session.user.email,
        ...perfil
      }
    });

  } catch (err) {
    console.error('Error en obtenerPerfil:', err);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

module.exports = { 
  login, 
  logout, 
  obtenerPerfil 
};