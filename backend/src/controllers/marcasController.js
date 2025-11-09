const supabase = require('../config/supabaseCliente');

// Obtener todas las marcas activas
const getMarcas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getMarcas:', err);
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
};

// Obtener una marca por ID
const getMarcaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Marca no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en getMarcaById:', err);
    res.status(500).json({ error: 'Error al obtener la marca' });
  }
};

// Crear una nueva marca
const crearMarca = async (req, res) => {
  try {
    const { nombre, slug, descripcion, imagen_url, activo = true } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({ error: 'Nombre y slug son requeridos' });
    }

    const { data, error } = await supabase
      .from('marcas')
      .insert([{ nombre, slug, descripcion, imagen_url, activo }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error en crearMarca:', err);
    res.status(500).json({ error: 'Error al crear marca' });
  }
};

// Actualizar una marca existente
const actualizarMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion, imagen_url, activo } = req.body;

    const { data, error } = await supabase
      .from('marcas')
      .update({
        nombre,
        slug,
        descripcion,
        imagen_url,
        activo,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Marca no encontrada' });

    res.json(data);
  } catch (err) {
    console.error('Error en actualizarMarca:', err);
    res.status(500).json({ error: 'Error al actualizar marca' });
  }
};

// Eliminar una marca (borrado lógico) marcamos "activo" en false
const eliminarMarca = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marcas')
      .update({ activo: false, actualizado_en: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Marca desactivada correctamente' });
  } catch (err) {
    console.error('Error en eliminar marca:', err);
    res.status(500).json({ error: 'Error al eliminar marca' });
  }
};

module.exports = {
  getMarcas,
  getMarcaById,
  crearMarca,
  actualizarMarca,
  eliminarMarca
};
