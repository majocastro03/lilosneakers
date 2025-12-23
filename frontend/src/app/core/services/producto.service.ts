import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Color {
  nombre: string;
  codigo_hex: string;
}

export interface Talla {
  talla: string;
  cantidad: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
  precio_final: number;
  imagen_url: string;
  descripcion: string;
  destacado: boolean;
  categoria: string;
  categoria_slug: string | null;
  colores: Color[];
  tallas: Talla[];
}

export interface ProductosResponse {
  productos: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltrosProducto {
  page?: number;
  limit?: number;
  categoria_id?: string; // UUID
  destacado?: boolean;
  q?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/productos';

  getProductos(filtros: FiltrosProducto = {}): Observable<ProductosResponse> {
    let params = new HttpParams();
    
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros.categoria_id) params = params.set('categoria_id', filtros.categoria_id); // Ya es string (UUID)
    if (filtros.destacado !== undefined) params = params.set('destacado', filtros.destacado.toString());
    if (filtros.q) params = params.set('q', filtros.q);

    return this.http.get<ProductosResponse>(this.apiUrl, { params });
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarProducto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
