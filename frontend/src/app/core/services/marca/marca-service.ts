import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Marca } from '../../interfaces/marca';
  @Injectable({
  providedIn: 'root',
})
export class MarcaService {
    private apiUrl = 'http://localhost:3001/api';
    constructor(private http: HttpClient) {}

    getMarcas() {
      return this.http.get<Marca[]>(`${this.apiUrl}/marcas`);
    }
}
