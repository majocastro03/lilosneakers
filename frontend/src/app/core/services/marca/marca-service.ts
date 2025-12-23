import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Marca } from '../../interfaces/marca';
import { environment } from '../../../../../../frontend/environments/environment';
  @Injectable({
  providedIn: 'root',
})
export class MarcaService {
    private apiUrl = environment.apiUrl + '/marcas';
    constructor(private http: HttpClient) {}

    getMarcas() {
      return this.http.get<Marca[]>(`${this.apiUrl}`);
    }
}
