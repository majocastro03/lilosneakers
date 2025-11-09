export interface ProductosQuery {
  page?: number;
  limit?: number;
  search?: string; // búsqueda
  categoria_id?: string;
  marca_id?: string;
  color_id?: string;
  talla_id?: string;
  genero?: string;
  precio_min?: number;
  precio_max?: number;
  orderBy?: 'precio_asc' | 'precio_desc' | 'destacado';
}
