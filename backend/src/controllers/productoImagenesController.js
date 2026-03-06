const supabase = require('../config/supabaseCliente');
const crypto = require('crypto');
const parseError = require('../utils/parseError');

// Upload image to storage
const uploadImage = async (file) => {
  const ext = file.originalname.split('.').pop();
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const filePath = `productos/${filename}`;

  const { error } = await supabase.storage
    .from('imagenes')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('imagenes')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Delete image from storage
const deleteImageFromStorage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const match = imageUrl.match(/imagenes\/(.+)$/);
    if (match) {
      await supabase.storage.from('imagenes').remove([match[1]]);
    }
  } catch (err) {
    console.error('Error al eliminar imagen de storage:', err);
  }
};

// GET /api/productos/:producto_id/imagenes
const getImagenes = async (req, res) => {
  try {
    const { producto_id } = req.params;

    const { data, error } = await supabase
      .from('producto_imagenes')
      .select('*')
      .eq('producto_id', producto_id)
      .order('orden', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error en getImagenes:', err);
    const { status, message } = parseError(err, 'Error al obtener imágenes');
    res.status(status).json({ error: message });
  }
};

// POST /api/productos/:producto_id/imagenes
const subirImagen = async (req, res) => {
  try {
    const { producto_id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    const imageUrl = await uploadImage(req.file);

    // Get current max order
    const { data: existing } = await supabase
      .from('producto_imagenes')
      .select('orden')
      .eq('producto_id', producto_id)
      .order('orden', { ascending: false })
      .limit(1);

    const nextOrder = (existing && existing.length > 0) ? existing[0].orden + 1 : 0;

    const { data, error } = await supabase
      .from('producto_imagenes')
      .insert([{ producto_id, imagen_url: imageUrl, orden: nextOrder }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Error en subirImagen:', err);
    const { status, message } = parseError(err, 'Error al subir imagen');
    res.status(status).json({ error: message });
  }
};

// DELETE /api/productos/:producto_id/imagenes/:imagen_id
const eliminarImagen = async (req, res) => {
  try {
    const { producto_id, imagen_id } = req.params;

    // Get image URL before deleting
    const { data: img } = await supabase
      .from('producto_imagenes')
      .select('imagen_url')
      .eq('id', imagen_id)
      .eq('producto_id', producto_id)
      .single();

    if (!img) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    // Delete from DB
    const { error } = await supabase
      .from('producto_imagenes')
      .delete()
      .eq('id', imagen_id)
      .eq('producto_id', producto_id);

    if (error) throw error;

    // Delete from storage
    await deleteImageFromStorage(img.imagen_url);

    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    console.error('Error en eliminarImagen:', err);
    const { status, message } = parseError(err, 'Error al eliminar imagen');
    res.status(status).json({ error: message });
  }
};

module.exports = {
  getImagenes,
  subirImagen,
  eliminarImagen
};
