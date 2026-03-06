import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-tallas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-tallas.html',
  styleUrl: './admin-tallas.css'
})
export class AdminTallasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/tallas`;
  tallas = signal<any[]>([]);
  showModal = signal(false);
  filtroValor = '';
  filtroGenero = '';

  get tallasFiltradas() {
    return this.tallas().filter(t => {
      if (this.filtroValor && !t.valor.toLowerCase().includes(this.filtroValor.toLowerCase())) return false;
      if (this.filtroGenero && t.genero !== this.filtroGenero) return false;
      return true;
    });
  }
  editingId = signal<string | null>(null);
  form = { valor: '', valor_us: '', valor_eur: '', valor_cm: '', genero: 'mujer' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>(this.apiUrl).subscribe({ next: (data) => this.tallas.set(data) }); }

  openCreate() {
    this.form = { valor: '', valor_us: '', valor_eur: '', valor_cm: '', genero: 'mujer' };
    this.editingId.set(null);
    this.showModal.set(true);
  }

  openEdit(item: any) {
    this.form = {
      valor: item.valor,
      valor_us: item.valor_us || '',
      valor_eur: item.valor_eur || '',
      valor_cm: item.valor_cm || '',
      genero: item.genero || 'mujer'
    };
    this.editingId.set(item.id);
    this.showModal.set(true);
  }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`${this.apiUrl}/${id}`, this.form) : this.http.post(this.apiUrl, this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.modalService.success(this.editingId() ? 'Talla actualizada' : 'Talla creada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar esta talla?');
    if (!ok) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.load(); this.modalService.success('Talla eliminada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar')
    });
  }
}
