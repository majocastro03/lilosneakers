import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Categoria } from '../../interfaces/categoria';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  getCategorias() {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}
