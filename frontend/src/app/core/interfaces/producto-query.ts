export interface ProductosQuery {
  page?: number;
  limit?: number;
  categoria_id?: string; // UUID
  destacado?: boolean;
  q?: string; // búsqueda
}