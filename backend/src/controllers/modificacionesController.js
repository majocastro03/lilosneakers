const supabase = require('../config/supabaseCliente');

// Asociar colores a un producto
const asignarColores = async (req, res) => {
  try {
    const { producto_id } = req.params;
    const { colores } = req.body; // [{ color_id }, ...]

    if (!colores || colores.length === 0)
      return res.status(400).json({ error: 'Debe enviar una lista de colores' });

    const dataToInsert = colores.map(c => ({
      producto_id,
      color_id: c.color_id
    }));

    const { error } = await supabase.from('producto_colores').insert(dataToInsert);
    if (error) throw error;

    res.json({ message: 'Colores asignados correctamente' });
  } catch (err) {
    console.error('Error en asignarColores:', err);
    res.status(500).json({ error: 'Error al asignar colores' });
  }
};

// Asociar tallas a un producto
const asignarTallas = async (req, res) => {
  try {
    const { producto_id } = req.params;
    const { tallas } = req.body; // [{ talla_id, cantidad }]

    if (!tallas || tallas.length === 0)
      return res.status(400).json({ error: 'Debe enviar una lista de tallas' });

    const dataToInsert = tallas.map(t => ({
      producto_id,
      talla_id: t.talla_id,
      cantidad: parseInt(t.cantidad) || 0
    }));

    const { error } = await supabase.from('producto_tallas').insert(dataToInsert);
    if (error) throw error;

    res.json({ message: 'Tallas asignadas correctamente' });
  } catch (err) {
    console.error('Error en asignarTallas:', err);
    res.status(500).json({ error: 'Error al asignar tallas' });
  }
};

// Eliminar un color de un producto
const eliminarColorProducto = async (req, res) => {
  try {
    const { producto_id, color_id } = req.params;
    const { error } = await supabase
      .from('producto_colores')
      .delete()
      .match({ producto_id, color_id });

    if (error) throw error;
    res.json({ message: 'Color eliminado del producto' });
  } catch (err) {
    console.error('Error en eliminarColorProducto:', err);
    res.status(500).json({ error: 'Error al eliminar color' });
  }
};

// Eliminar una talla de un producto
const eliminarTallaProducto = async (req, res) => {
  try {
    const { producto_id, talla_id } = req.params;
    const { error } = await supabase
      .from('producto_tallas')
      .delete()
      .match({ producto_id, talla_id });

    if (error) throw error;
    res.json({ message: 'Talla eliminada del producto' });
  } catch (err) {
    console.error('Error en eliminarTallaProducto:', err);
    res.status(500).json({ error: 'Error al eliminar talla' });
  }
};

module.exports = {
  asignarColores,
  asignarTallas,
  eliminarColorProducto,
  eliminarTallaProducto,
};
