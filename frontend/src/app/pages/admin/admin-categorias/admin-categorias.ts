import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-categorias.html',
  styleUrl: './admin-categorias.css'
})
export class AdminCategoriasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  authService = inject(AuthService);

  categorias = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  form = { nombre: '', slug: '' };
  message = signal<string | null>(null);

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
      next: () => { this.showModal.set(false); this.message.set(id ? 'Categoría actualizada' : 'Categoría creada'); this.loadCategorias(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error al guardar')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar esta categoria?');
    if (!ok) return;
    this.http.delete(`/api/categorias/${id}`).subscribe({
      next: () => { this.message.set('Categoria eliminada'); this.loadCategorias(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error al eliminar')
    });
  }
}
