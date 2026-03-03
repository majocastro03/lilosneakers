const supabase = require('../config/supabaseCliente');

const registrarUsuario = async (req, res) => {
  try {
    const { email, password, nombre, apellido, username, telefono, tipo_usuario = 'cliente' } = req.body;

    // Validación ya hecha en middleware, pero doble check
    if (!email || !password || !nombre || !username) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Forzar tipo_usuario a 'cliente' para registro público
    const tipoUsuarioSeguro = 'cliente';

    // 1. Crear el usuario en Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError) {
      console.error('Error al crear usuario:', userError);
      // No exponer detalles internos de Supabase
      if (userError.message?.includes('already')) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      return res.status(400).json({ error: 'No se pudo crear el usuario' });
    }

    const userId = userData.user.id;

    // 2. Crear el perfil asociado al usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert([
        { id: userId, nombre, apellido, username, telefono, tipo_usuario: tipoUsuarioSeguro }
      ])
      .select()
      .single();

    if (perfilError) {
      console.error('Error al crear perfil:', perfilError);
      // Intentar eliminar el usuario de auth si falla el perfil
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: 'No se pudo crear el perfil. Intente de nuevo.' });
    }

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: userId,
        nombre: perfil.nombre,
        username: perfil.username,
        email
      }
    });

  } catch (err) {
    console.error('Error en registrarUsuario:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
};

module.exports = { registrarUsuario };
