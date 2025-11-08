import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Categoria } from '../../interfaces/categoria';
@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
   private apiUrl = 'http://localhost:3001/api';
    constructor(private http: HttpClient) {}
    getCategorias() {
      return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
    }
}
