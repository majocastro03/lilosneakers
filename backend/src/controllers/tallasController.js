const supabase = require('../config/supabaseCliente');
const parseError = require('../utils/parseError');

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
    const { status, message } = parseError(err, 'Error al obtener tallas');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al obtener talla');
    res.status(status).json({ error: message });
  }
};

// Crear talla
const crearTalla = async (req, res) => {
  try {
    const { valor, tipo = 'CO', genero = 'mujer', valor_us, valor_eur, valor_cm } = req.body;
    if (!valor) return res.status(400).json({ error: 'Valor de talla requerido' });

    const { data, error } = await supabase
      .from('tallas')
      .insert([{ valor, tipo, genero, valor_us: valor_us || null, valor_eur: valor_eur || null, valor_cm: valor_cm || null }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error en crearTalla:', err);
    const { status, message } = parseError(err, 'Error al crear talla');
    res.status(status).json({ error: message });
  }
};

// Actualizar talla
const actualizarTalla = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, tipo, genero, valor_us, valor_eur, valor_cm } = req.body;

    const { data, error } = await supabase
      .from('tallas')
      .update({ valor, tipo, genero, valor_us: valor_us || null, valor_eur: valor_eur || null, valor_cm: valor_cm || null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Talla no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en actualizarTalla:', err);
    const { status, message } = parseError(err, 'Error al actualizar talla');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al eliminar talla');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  getTallas,
  getTallaById,
  crearTalla,
  actualizarTalla,
  eliminarTalla,
};
