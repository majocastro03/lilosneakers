export interface ProductosQuery {
  page?: number;
  limit?: number;
  categoria_id?: string;
  destacado?: boolean;
  q?: string;
  search?: string;
  marca_id?: string;
  color_id?: string;
  talla_id?: string;
  genero?: string;
  precio_min?: number;
  precio_max?: number;
  orderBy?: string;
}