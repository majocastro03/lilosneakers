const supabase = require('../config/supabaseCliente'); // usa Service Role Key

const registrarUsuario = async (req, res) => {
  try {
    const { email, password, nombre, apellido, username, telefono, tipo_usuario = 'cliente' } = req.body;

    // Validar campos
    if (!email || !password || !nombre || !username) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // 1️⃣ Crear el usuario en Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // crea el usuario ya verificado
    });

    if (userError) {
      console.error('Error al crear usuario:', userError);
      return res.status(400).json({ error: 'No se pudo crear el usuario', detalle: userError.message });
    }

    const userId = userData.user.id;

    // 2️⃣ Crear el perfil asociado al usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert([
        { id: userId, nombre, apellido, username, telefono, tipo_usuario }
      ])
      .select()
      .single();

    if (perfilError) {
      console.error('Error al crear perfil:', perfilError);
      return res.status(400).json({ error: 'No se pudo crear el perfil', detalle: perfilError.message });
    }

    res.status(201).json({
      message: 'Usuario y perfil creados correctamente',
      user: userData.user,
      perfil
    });

  } catch (err) {
    console.error('Error en registrarUsuario:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario y perfil' });
  }
};

module.exports = { registrarUsuario };
