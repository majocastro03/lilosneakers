import { Component, inject, signal, OnInit } from '@angular/core';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
>>>>>>> origin/main
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
<<<<<<< HEAD
  imports: [FormsModule],
=======
  imports: [CommonModule, FormsModule, RouterLink],
>>>>>>> origin/main
  templateUrl: './admin-categorias.html',
  styleUrl: './admin-categorias.css'
})
export class AdminCategoriasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
<<<<<<< HEAD
=======
  authService = inject(AuthService);
>>>>>>> origin/main

  categorias = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
<<<<<<< HEAD
  filtroNombre = '';
=======
>>>>>>> origin/main
  editingId = signal<string | null>(null);
  form = { nombre: '', slug: '' };
  message = signal<string | null>(null);

<<<<<<< HEAD
  get categoriasFiltradas() {
    return this.categorias().filter(c =>
      !this.filtroNombre || c.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }

=======
>>>>>>> origin/main
  ngOnInit() { this.loadCategorias(); }

  loadCategorias() {
    this.loading.set(true);
    this.http.get<any[]>('/api/categorias').subscribe({
      next: (data) => { this.categorias.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.form = { nombre: '', slug: '' };
    this.editingId.set(null);
    this.showModal.set(true);
  }

  openEdit(cat: any) {
    this.form = { nombre: cat.nombre, slug: cat.slug };
    this.editingId.set(cat.id);
    this.showModal.set(true);
  }

  generateSlug() {
    this.form.slug = this.form.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  save() {
    const id = this.editingId();
    const obs = id
      ? this.http.put(`/api/categorias/${id}`, this.form)
      : this.http.post('/api/categorias', this.form);

    obs.subscribe({
<<<<<<< HEAD
      next: () => { this.showModal.set(false); this.loadCategorias(); this.modalService.success(id ? 'Categoría actualizada' : 'Categoría creada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
=======
      next: () => { this.showModal.set(false); this.message.set(id ? 'Categoría actualizada' : 'Categoría creada'); this.loadCategorias(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error al guardar')
>>>>>>> origin/main
    });
  }

  async delete(id: string) {
<<<<<<< HEAD
    const ok = await this.modalService.confirm('¿Eliminar esta categoría?');
    if (!ok) return;
    this.http.delete(`/api/categorias/${id}`).subscribe({
      next: () => { this.loadCategorias(); this.modalService.success('Categoría eliminada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar')
=======
    const ok = await this.modalService.confirm('¿Eliminar esta categoria?');
    if (!ok) return;
    this.http.delete(`/api/categorias/${id}`).subscribe({
      next: () => { this.message.set('Categoria eliminada'); this.loadCategorias(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error al eliminar')
>>>>>>> origin/main
    });
  }
}
