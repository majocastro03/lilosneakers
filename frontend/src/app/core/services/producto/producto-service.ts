import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/producto';
import { ProductosQuery } from '../../interfaces/producto-query';
import { ProductosResponse } from '../../interfaces/producto-response';
import { Producto } from '../../interfaces/producto';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener productos con filtros opcionales (para catálogo público o admin)
  getProductos(query?: ProductosQuery): Observable<{ productos: Producto[]; totalPages: number }> {
    let params = new HttpParams();

    // Solo agregar parámetros si están definidos
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.categoria_id !== undefined) {
      httpParams = httpParams.set('categoria_id', params.categoria_id); // Ya es string (UUID)
    }
    if (params.destacado !== undefined) {
      httpParams = httpParams.set('destacado', params.destacado.toString());
    }
    if (params.q) {
      httpParams = httpParams.set('q', params.q.trim());
    }

    return this.http.get<{ productos: Producto[]; totalPages: number }>(this.apiUrl, { params });
  }

  // Obtener un producto por su ID
  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo producto
  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // Actualizar un producto existente
  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  // Eliminar un producto
  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Asignar tallas a un producto
  asignarTallas(productoId: string, tallas: { talla_id: string; cantidad: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/tallas`, { tallas });
  }

  // Asignar colores a un producto
  asignarColores(productoId: string, colores: { color_id: string }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/colores`, { colores });
  }

  // Eliminar una talla asignada
  eliminarTalla(productoId: string, tallaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productoId}/tallas/${tallaId}`);
  }

  // Eliminar un color asignado
  eliminarColor(productoId: string, colorId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productoId}/colores/${colorId}`);
  }
}
