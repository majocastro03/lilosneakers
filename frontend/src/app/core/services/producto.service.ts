import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Color {
  id: string;
  nombre: string;
  codigo_hex: string;
}

export interface Talla {
  id: string;
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
  activo: boolean;
  categoria: string;
  categoria_id?: string;
  categoria_slug?: string;
  mostrar_precio?: boolean;
  marca_id?: string;
  marca?: any;
  colores: Color[];
  tallas: Talla[];
  imagenes?: { id: string; imagen_url: string; orden: number }[];
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
  incluir_inactivos?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  getProductos(filtros: FiltrosProducto = {}): Observable<ProductosResponse> {
    let params = new HttpParams();
    
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros.categoria_id) params = params.set('categoria_id', filtros.categoria_id); // Ya es string (UUID)
    if (filtros.destacado !== undefined) params = params.set('destacado', filtros.destacado.toString());
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.incluir_inactivos) params = params.set('incluir_inactivos', 'true');

    return this.http.get<ProductosResponse>(this.apiUrl, { params });
  }

  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarProducto(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
