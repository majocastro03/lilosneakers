import { Component, inject, signal, OnInit } from '@angular/core';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
>>>>>>> origin/main

@Component({
  selector: 'app-admin-colores',
  standalone: true,
<<<<<<< HEAD
  imports: [FormsModule],
=======
  imports: [CommonModule, FormsModule, RouterLink],
>>>>>>> origin/main
  templateUrl: './admin-colores.html',
  styleUrl: './admin-colores.css'
})
export class AdminColoresComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
<<<<<<< HEAD
  private apiUrl = `${environment.apiUrl}/colores`;
  colores = signal<any[]>([]);
  showModal = signal(false);
  filtroNombre = '';

  get coloresFiltrados() {
    return this.colores().filter(c =>
      !this.filtroNombre || c.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }
=======
  colores = signal<any[]>([]);
  showModal = signal(false);
>>>>>>> origin/main
  editingId = signal<string | null>(null);
  form = { nombre: '', codigo_hex: '#000000' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

<<<<<<< HEAD
  load() { this.http.get<any[]>(this.apiUrl).subscribe({ next: (data) => this.colores.set(data) }); }
=======
  load() { this.http.get<any[]>('/api/colores').subscribe({ next: (data) => this.colores.set(data) }); }
>>>>>>> origin/main
  openCreate() { this.form = { nombre: '', codigo_hex: '#000000' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { nombre: item.nombre, codigo_hex: item.codigo_hex }; this.editingId.set(item.id); this.showModal.set(true); }

  save() {
    const id = this.editingId();
<<<<<<< HEAD
    const obs = id ? this.http.put(`${this.apiUrl}/${id}`, this.form) : this.http.post(this.apiUrl, this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.modalService.success(this.editingId() ? 'Color actualizado' : 'Color creado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
=======
    const obs = id ? this.http.put(`/api/colores/${id}`, this.form) : this.http.post('/api/colores', this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.message.set('Guardado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
>>>>>>> origin/main
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar este color?');
    if (!ok) return;
<<<<<<< HEAD
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.load(); this.modalService.success('Color eliminado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar')
    });
=======
    this.http.delete(`/api/colores/${id}`).subscribe({ next: () => { this.message.set('Eliminado'); this.load(); setTimeout(() => this.message.set(null), 2000); } });
>>>>>>> origin/main
  }
}
