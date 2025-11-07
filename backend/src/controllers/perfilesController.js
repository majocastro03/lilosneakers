const supabase = require('../config/supabaseCliente');

// POST /perfiles → crea un perfil después del registro de usuario
const crearPerfil = async (req, res) => {
  try {
    const { 
      id,           // UUID del usuario (viene de auth.users)
      nombre, 
      apellido, 
      username, 
      telefono, 
      tipo_usuario = 'cliente' 
    } = req.body;

    // Validación básica
    if (!id || !nombre || !username) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: id, nombre, username' });
    }

    const { data, error } = await supabase
      .from('perfiles')
      .insert([
        { id, nombre, apellido, username, telefono, tipo_usuario }
      ])
      .select()
      .single();

    if (error) {
      // Manejo de errores comunes
      if (error.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'El username ya está en uso' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error en crearPerfil:', err);
    res.status(500).json({ error: 'Error al crear perfil' });
  }
};

module.exports = { crearPerfil };