const supabase = require('../config/supabaseCliente');

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
    res.status(500).json({ error: 'Error al obtener categorías' });
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
    res.status(500).json({ error: 'Error al obtener la categoría' });
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
    res.status(500).json({ error: 'Error al crear la categoría' });
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
    res.status(500).json({ error: 'Error al actualizar la categoría' });
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
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
