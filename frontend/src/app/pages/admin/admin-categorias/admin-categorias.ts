import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-categorias.html',
  styleUrl: './admin-categorias.css'
})
export class AdminCategoriasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  categorias = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  filtroNombre = '';
  editingId = signal<string | null>(null);
  form = { nombre: '', slug: '' };
  message = signal<string | null>(null);

  get categoriasFiltradas() {
    return this.categorias().filter(c =>
      !this.filtroNombre || c.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }

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
      next: () => { this.showModal.set(false); this.loadCategorias(); this.modalService.success(id ? 'Categoría actualizada' : 'Categoría creada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar esta categoría?');
    if (!ok) return;
    this.http.delete(`/api/categorias/${id}`).subscribe({
      next: () => { this.loadCategorias(); this.modalService.success('Categoría eliminada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar')
    });
  }
}
