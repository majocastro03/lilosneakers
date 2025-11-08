const supabase = require('../config/supabaseCliente');

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
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
};

const getMarcaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Marca no encontrada' });
  }
};

const crearMarca = async (req, res) => {
  try {
    const { nombre, slug, descripcion, imagen_url } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({ error: 'Nombre y slug son requeridos' });
    }

    const { data, error } = await supabase
      .from('marcas')
      .insert([{ nombre, slug, descripcion, imagen_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear marca' });
  }
};

module.exports = { getMarcas, getMarcaById, crearMarca };