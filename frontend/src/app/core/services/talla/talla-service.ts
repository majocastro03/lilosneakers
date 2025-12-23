import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../frontend/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TallaService {
  private apiUrl = environment.apiUrl + '/tallas';

  constructor(private http: HttpClient) {}

  // Obtener todas las tallas desde el backend
  getTallas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
