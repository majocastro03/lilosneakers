import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ProductosQuery } from "../../interfaces/producto-query";
import { Observable } from "rxjs";
import { Producto } from "../producto.service";


@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProductos(query?: ProductosQuery): Observable<{ productos: Producto[]; totalPages: number }> {
    let params = new HttpParams();

    if (query?.page !== undefined) params = params.set('page', query.page.toString());
    if (query?.limit !== undefined) params = params.set('limit', query.limit.toString());
    if (query?.categoria_id) params = params.set('categoria_id', query.categoria_id);
    if (query?.destacado !== undefined) params = params.set('destacado', query.destacado.toString());
    if (query?.q) params = params.set('q', query.q.trim());
    if (query?.search) params = params.set('q', query.search.trim());
    if (query?.marca_id) params = params.set('marca_id', query.marca_id);
    if (query?.color_id) params = params.set('color_id', query.color_id);
    if (query?.talla_id) params = params.set('talla_id', query.talla_id);
    if (query?.genero) params = params.set('genero', query.genero);
    if (query?.precio_min != null) params = params.set('precio_min', query.precio_min.toString());
    if (query?.precio_max != null) params = params.set('precio_max', query.precio_max.toString());
    if (query?.orderBy) params = params.set('orderBy', query.orderBy);

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