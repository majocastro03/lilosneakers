const supabase = require('../config/supabaseCliente');

const getCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, slug')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getCategorias:', err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

module.exports = { getCategorias };