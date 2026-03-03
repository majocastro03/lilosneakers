const supabase = require('../config/supabaseCliente');

// POST /api/carrito/validar - Validate cart items (check stock availability)
const validarCarrito = async (req, res) => {
  try {
    const { items } = req.body; // [{ producto_id, talla_id, cantidad }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const validationResults = [];

    for (const item of items) {
      // Get product info
      const { data: producto, error: prodError } = await supabase
        .from('productos')
        .select('id, nombre, precio, descuento, imagen_url')
        .eq('id', item.producto_id)
        .single();

      if (prodError || !producto) {
        validationResults.push({
          ...item,
          valid: false,
          error: 'Producto no encontrado'
        });
        continue;
      }

      // Check stock for the specific size
      const { data: stock, error: stockError } = await supabase
        .from('producto_tallas')
        .select('cantidad')
        .eq('producto_id', item.producto_id)
        .eq('talla_id', item.talla_id)
        .single();

      if (stockError || !stock) {
        validationResults.push({
          ...item,
          valid: false,
          error: 'Talla no disponible',
          producto
        });
        continue;
      }

      const disponible = stock.cantidad >= item.cantidad;
      const precioFinal = Math.round(producto.precio * (1 - producto.descuento / 100));

      validationResults.push({
        producto_id: item.producto_id,
        talla_id: item.talla_id,
        cantidad: item.cantidad,
        valid: disponible,
        stock_disponible: stock.cantidad,
        precio_unitario: precioFinal,
        subtotal: precioFinal * item.cantidad,
        producto: {
          nombre: producto.nombre,
          imagen_url: producto.imagen_url,
          precio: producto.precio,
          descuento: producto.descuento,
          precio_final: precioFinal
        },
        error: disponible ? null : `Solo hay ${stock.cantidad} unidades disponibles`
      });
    }

    const todosValidos = validationResults.every(r => r.valid);
    const total = validationResults
      .filter(r => r.valid)
      .reduce((sum, r) => sum + r.subtotal, 0);

    res.json({
      valid: todosValidos,
      items: validationResults,
      total
    });

  } catch (err) {
    console.error('Error en validarCarrito:', err);
    res.status(500).json({ error: 'Error al validar el carrito' });
  }
};

module.exports = { validarCarrito };
