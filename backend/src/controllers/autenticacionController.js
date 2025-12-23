const supabase = require('../config/supabaseCliente');

// POST /auth/login → inicio de sesión
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Intentando login para:', username);

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Faltan credenciales'
      });
    }

    // 1. Buscar perfil por username
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('id, nombre, apellido, username, tipo_usuario')
      .eq('username', username)
      .single();

    if (perfilError || !perfil) {
      console.log('❌ Usuario no encontrado:', username);
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // 2. Obtener email del usuario desde auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(perfil.id);

    if (authError || !authUser?.user?.email) {
      console.log('❌ Email no encontrado para usuario:', perfil.id);
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // 3. Intentar login con email y password
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email,
      password
    });

    if (loginError) {
      console.log('❌ Contraseña incorrecta para:', username);
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // 4. Éxito
    console.log('✅ Login exitoso:', username, '- Tipo:', perfil.tipo_usuario);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: perfil.id,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        username: perfil.username,
        tipo_usuario: perfil.tipo_usuario,
        email: authUser.user.email
      },
      session: loginData.session
    });

  } catch (err) {
    console.error('💥 Error en login:', err);
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
      return res.status(400).json({ 
        error: 'No se pudo cerrar la sesión' 
      });
    }

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ error: 'Error interno al cerrar sesión' });
  }
};

// GET /auth/me → obtener perfil del usuario actual
const obtenerPerfil = async (req, res) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const userId = session.user.id;

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
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
