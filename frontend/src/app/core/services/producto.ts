import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Color {
  nombre: string;
  codigo_hex: string;
}

export interface TallaStock {
  talla: string;
  cantidad: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descuento: number;
  precio_final: number;
  imagen_url: string;
  descripcion: string;
  destacado: boolean;
  categoria: string;
  categoria_slug?: string;
  colores: Color[];
  tallas: TallaStock[];
  // ✅ Agregamos derivados (calculados una vez)
  tallasDisponibles?: TallaStock[];     // t.cantidad > 0
  tallasPreview?: TallaStock[];         // primeras 3
  tallasExtraCount?: number;            // cuántas más hay
}

export interface ProductosResponse {
  productos: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para filtros
export interface ProductosQuery {
  page?: number;
  limit?: number;
  categoria_id?: number | string;
  destacado?: boolean;
  q?: string; // búsqueda
}

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:3001/api'; // Cambiar en producción

  constructor(private http: HttpClient) {}

  getProductos(params: ProductosQuery = {}): Observable<ProductosResponse> {
    let httpParams = new HttpParams();

    // Solo agregar parámetros si están definidos
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.categoria_id !== undefined) {
      httpParams = httpParams.set('categoria_id', params.categoria_id.toString());
    }
    if (params.destacado !== undefined) {
      httpParams = httpParams.set('destacado', params.destacado.toString());
    }
    if (params.q) {
      httpParams = httpParams.set('q', params.q.trim());
    }

    return this.http.get<ProductosResponse>(`${this.apiUrl}/productos`, { params: httpParams });
  }

  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }
}