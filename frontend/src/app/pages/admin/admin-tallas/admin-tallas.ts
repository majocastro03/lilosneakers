import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-tallas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-tallas.html',
  styleUrl: './admin-tallas.css'
})
export class AdminTallasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/tallas`;
  tallas = signal<any[]>([]);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  form = { valor: '', tipo: 'numerica' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>(this.apiUrl).subscribe({ next: (data) => this.tallas.set(data) }); }
  openCreate() { this.form = { valor: '', tipo: 'numerica' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { valor: item.valor, tipo: item.tipo || 'numerica' }; this.editingId.set(item.id); this.showModal.set(true); }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`${this.apiUrl}/${id}`, this.form) : this.http.post(this.apiUrl, this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.message.set('Guardado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar esta talla?');
    if (!ok) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({ next: () => { this.message.set('Eliminada'); this.load(); setTimeout(() => this.message.set(null), 2000); } });
  }
}
