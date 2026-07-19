import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  InventarioProducto,
  Movimiento,
  CrearMovimiento,
  ReporteDia,
  TipoMovimiento
} from '../../interfaces/inventario';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = environment.apiUrl + '/inventario';
  private http = inject(HttpClient);

  getInventario(entregaInmediata = false) {
    let params = new HttpParams();
    if (entregaInmediata) params = params.set('entrega_inmediata', 'true');
    return this.http.get<InventarioProducto[]>(this.apiUrl, { params });
  }

  getMovimientos(filtros: { producto_id?: string; tipo?: TipoMovimiento; desde?: string; hasta?: string; limit?: number } = {}) {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Movimiento[]>(`${this.apiUrl}/movimientos`, { params });
  }

  crearMovimiento(body: CrearMovimiento) {
    return this.http.post<{ message: string; movimiento: Movimiento; stock_anterior: number; stock_nuevo: number }>(
      `${this.apiUrl}/movimientos`, body
    );
  }

  getReporte(desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<ReporteDia[]>(`${this.apiUrl}/reporte`, { params });
  }
}
