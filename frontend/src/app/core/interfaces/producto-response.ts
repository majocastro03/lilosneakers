import { Producto } from "./producto";

export interface ProductosResponse {
  productos: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}