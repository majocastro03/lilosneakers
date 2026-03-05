import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-colores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-colores.html',
  styleUrl: './admin-colores.css'
})
export class AdminColoresComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/colores`;
  colores = signal<any[]>([]);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  form = { nombre: '', codigo_hex: '#000000' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>(this.apiUrl).subscribe({ next: (data) => this.colores.set(data) }); }
  openCreate() { this.form = { nombre: '', codigo_hex: '#000000' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { nombre: item.nombre, codigo_hex: item.codigo_hex }; this.editingId.set(item.id); this.showModal.set(true); }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`${this.apiUrl}/${id}`, this.form) : this.http.post(this.apiUrl, this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.message.set('Guardado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar este color?');
    if (!ok) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({ next: () => { this.message.set('Eliminado'); this.load(); setTimeout(() => this.message.set(null), 2000); } });
  }
}
