const supabase = require('../config/supabaseCliente');
const parseError = require('../utils/parseError');

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
    const { status, message } = parseError(err, 'Error al obtener marcas');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al obtener la marca');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al crear marca');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al actualizar marca');
    res.status(status).json({ error: message });
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
    const { status, message } = parseError(err, 'Error al eliminar marca');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  getMarcas,
  getMarcaById,
  crearMarca,
  actualizarMarca,
  eliminarMarca
};
