import { Component, inject, signal, OnInit } from '@angular/core';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
>>>>>>> origin/main
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-marcas',
  standalone: true,
<<<<<<< HEAD
  imports: [FormsModule],
=======
  imports: [CommonModule, FormsModule, RouterLink],
>>>>>>> origin/main
  templateUrl: './admin-marcas.html',
  styleUrl: './admin-marcas.css'
})
export class AdminMarcasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  marcas = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
<<<<<<< HEAD
  filtroNombre = '';

  get marcasFiltradas() {
    return this.marcas().filter(m =>
      !this.filtroNombre || m.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }
=======
>>>>>>> origin/main
  editingId = signal<string | null>(null);
  form = { nombre: '', slug: '', descripcion: '' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any[]>('/api/marcas').subscribe({
      next: (data) => { this.marcas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() { this.form = { nombre: '', slug: '', descripcion: '' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { nombre: item.nombre, slug: item.slug, descripcion: item.descripcion || '' }; this.editingId.set(item.id); this.showModal.set(true); }

  generateSlug() { this.form.slug = this.form.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`/api/marcas/${id}`, this.form) : this.http.post('/api/marcas', this.form);
    obs.subscribe({
<<<<<<< HEAD
      next: () => { this.showModal.set(false); this.load(); this.modalService.success(this.editingId() ? 'Marca actualizada' : 'Marca creada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
=======
      next: () => { this.showModal.set(false); this.message.set('Guardado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
>>>>>>> origin/main
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Desactivar esta marca?');
    if (!ok) return;
<<<<<<< HEAD
    this.http.delete(`/api/marcas/${id}`).subscribe({
      next: () => { this.load(); this.modalService.success('Marca desactivada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al desactivar')
    });
=======
    this.http.delete(`/api/marcas/${id}`).subscribe({ next: () => { this.message.set('Marca desactivada'); this.load(); setTimeout(() => this.message.set(null), 2000); } });
>>>>>>> origin/main
  }
}
