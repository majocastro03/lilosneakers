import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductosQuery } from '../interfaces/productoQuery';
import { ProductosResponse } from '../interfaces/productoResponse';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:3001/api'; // Cambiar en prod

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