const supabase = require('../config/supabaseCliente');

class ProductoModel {
  static async findAll(filters = {}) {
    const {
      categoria_id,
      color_id,
      talla_id,
      marca_id,
      genero, 
      minPrecio,
      maxPrecio,
      destacado,
      mostrar_precio,
      search,
      orderBy = 'nombre',
      orderDir = 'asc',
      page = 1,
      limit = 10,
    } = filters;

    const offset = (page - 1) * limit;

    // Query base con joins
    let query = supabase
      .from('productos')
      .select(
        `
        id,
        nombre,
        precio,
        descuento,
        imagen_url,
        descripcion,
        destacado,
        mostrar_precio,
        categorias!left(id, nombre),
        marcas!left(id, nombre),
        producto_colores(color_id, colores(nombre, codigo_hex)),
        producto_tallas(talla_id, cantidad, tallas(valor, genero))
      `,
        { count: 'exact' }
      )
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(offset, offset + limit - 1);

    // Filtros base (en productos)
    if (categoria_id) query = query.eq('categoria_id', categoria_id);
    if (marca_id) query = query.eq('marca_id', marca_id);
    if (destacado !== undefined) query = query.eq('destacado', destacado === 'true');
    if (mostrar_precio !== undefined)
      query = query.eq('mostrar_precio', mostrar_precio === 'true');
    if (minPrecio) query = query.gte('precio', parseFloat(minPrecio));
    if (maxPrecio) query = query.lte('precio', parseFloat(maxPrecio));
    if (search)
      query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);

    // Ejecutar query
    const { data, error, count } = await query;
    if (error) throw error;

    let productos = data || [];

    // Filtro por color
    if (color_id) {
      productos = productos.filter((p) =>
        p.producto_colores?.some((c) => c.color_id === parseInt(color_id))
      );
    }

    // Filtro por talla
    if (talla_id) {
      productos = productos.filter((p) =>
        p.producto_tallas?.some((t) => t.talla_id === parseInt(talla_id))
      );
    }

    // Filtro por género (desde tallas)
    if (genero) {
      productos = productos.filter((p) =>
        p.producto_tallas?.some(
          (t) =>
            t.tallas?.genero?.toLowerCase() === genero.toString().toLowerCase()
        )
      );
    }

    // Formateo final
    const productosFormateados = productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      descuento: p.descuento,
      precio_final: p.descuento
        ? Math.round(p.precio * (1 - p.descuento / 100))
        : p.precio,
      imagen_url: p.imagen_url,
      descripcion: p.descripcion,
      destacado: p.destacado,
      mostrar_precio: p.mostrar_precio,
      categoria: p.categorias?.nombre || 'Sin categoría',
      marca: p.marcas?.nombre || 'Sin marca',
      colores: p.producto_colores?.map((c) => c.colores) || [],
      tallas:
        p.producto_tallas?.map((t) => ({
          talla: t.tallas.valor,
          genero: t.tallas.genero,
          cantidad: t.cantidad,
        })) || [],
    }));

    return { productos: productosFormateados, total: count, page, limit };
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('productos')
      .select(
        `
        id,
        nombre,
        precio,
        descuento,
        imagen_url,
        descripcion,
        destacado,
        mostrar_precio,
        categorias(nombre),
        marcas(nombre),
        producto_colores(colores(nombre, codigo_hex)),
        producto_tallas(tallas(valor, genero), cantidad)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(data) {
    const { error, data: producto } = await supabase
      .from('productos')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return producto;
  }

  static async update(id, data) {
    const { error, data: producto } = await supabase
      .from('productos')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return producto;
  }

  static async delete(id) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = ProductoModel;
