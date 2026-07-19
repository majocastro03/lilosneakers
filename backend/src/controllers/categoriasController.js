const supabase = require('../config/supabaseCliente');
const parseError = require('../utils/parseError');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, slug, created_at')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getCategorias:', err);
    const { status, message } = parseError(err, 'Error al obtener categorías');
    res.status(status).json({ error: message });
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, slug, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en getCategoriaById:', err);
    const { status, message } = parseError(err, 'Error al obtener la categoría');
    res.status(status).json({ error: message });
  }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre, slug } = req.body;

    if (!nombre || !slug)
      return res.status(400).json({ error: 'nombre y slug son obligatorios' });

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, slug }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error en createCategoria:', err);
    const { status, message } = parseError(err, 'Error al crear la categoría');
    res.status(status).json({ error: message });
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, slug } = req.body;

    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre, slug })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en updateCategoria:', err);
    const { status, message } = parseError(err, 'Error al actualizar la categoría');
    res.status(status).json({ error: message });
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error('Error en deleteCategoria:', err);
    const { status, message } = parseError(err, 'Error al eliminar la categoría');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
