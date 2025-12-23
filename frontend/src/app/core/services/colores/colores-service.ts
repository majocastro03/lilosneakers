import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../frontend/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ColoresService {
  private apiUrl = environment.apiUrl + '/colores';

  constructor(private http: HttpClient) {}

  // Obtener todos los colores desde el backend
  getColores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
