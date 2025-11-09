const supabase = require('../config/supabaseCliente');

// Obtener todas las tallas
const getTallas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tallas')
      .select('*')
      .order('valor', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getTallas:', err);
    res.status(500).json({ error: 'Error al obtener tallas' });
  }
};

// Obtener talla por ID
const getTallaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tallas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Talla no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en getTallaById:', err);
    res.status(500).json({ error: 'Error al obtener talla' });
  }
};

// Crear talla
const crearTalla = async (req, res) => {
  try {
    const { valor, tipo = 'numerica' } = req.body;
    if (!valor) return res.status(400).json({ error: 'Valor de talla requerido' });

    const { data, error } = await supabase
      .from('tallas')
      .insert([{ valor, tipo }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error en crearTalla:', err);
    res.status(500).json({ error: 'Error al crear talla' });
  }
};

// Actualizar talla
const actualizarTalla = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, tipo } = req.body;

    const { data, error } = await supabase
      .from('tallas')
      .update({ valor, tipo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Talla no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en actualizarTalla:', err);
    res.status(500).json({ error: 'Error al actualizar talla' });
  }
};

// Eliminar talla
const eliminarTalla = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tallas').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Talla eliminada correctamente' });
  } catch (err) {
    console.error('Error en eliminarTalla:', err);
    res.status(500).json({ error: 'Error al eliminar talla' });
  }
};

module.exports = {
  getTallas,
  getTallaById,
  crearTalla,
  actualizarTalla,
  eliminarTalla,
};
