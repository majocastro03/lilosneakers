export interface ProductosQuery {
  page?: number;
  limit?: number;
  categoria_id?: number | string;
  destacado?: boolean;
  q?: string; // búsqueda
}