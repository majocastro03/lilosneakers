const supabase = require('../config/supabaseCliente');

// Obtener todos los colores
const getColores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('colores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getColores:', err);
    res.status(500).json({ error: 'Error al obtener colores' });
  }
};

// Obtener color por ID
const getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('colores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Color no encontrado' });

    res.json(data);
  } catch (err) {
    console.error('Error en getColorById:', err);
    res.status(500).json({ error: 'Error al obtener color' });
  }
};

// Crear color
const crearColor = async (req, res) => {
  try {
    const { nombre, codigo_hex } = req.body;
    if (!nombre || !codigo_hex)
      return res.status(400).json({ error: 'Nombre y código hex son requeridos' });

    const { data, error } = await supabase
      .from('colores')
      .insert([{ nombre, codigo_hex }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error en crearColor:', err);
    res.status(500).json({ error: 'Error al crear color' });
  }
};

// Actualizar color
const actualizarColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo_hex } = req.body;

    const { data, error } = await supabase
      .from('colores')
      .update({ nombre, codigo_hex })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Color no encontrado' });

    res.json(data);
  } catch (err) {
    console.error('Error en actualizarColor:', err);
    res.status(500).json({ error: 'Error al actualizar color' });
  }
};

// Eliminar color
const eliminarColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('colores').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Color eliminado correctamente' });
  } catch (err) {
    console.error('Error en eliminarColor:', err);
    res.status(500).json({ error: 'Error al eliminar color' });
  }
};

module.exports = {
  getColores,
  getColorById,
  crearColor,
  actualizarColor,
  eliminarColor,
};
