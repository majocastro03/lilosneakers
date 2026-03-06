import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-marcas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-marcas.html',
  styleUrl: './admin-marcas.css'
})
export class AdminMarcasComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/marcas`;
  marcas = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  filtroNombre = '';

  get marcasFiltradas() {
    return this.marcas().filter(m =>
      !this.filtroNombre || m.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }
  editingId = signal<string | null>(null);
  form = { nombre: '', slug: '', descripcion: '' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => { this.marcas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() { this.form = { nombre: '', slug: '', descripcion: '' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { nombre: item.nombre, slug: item.slug, descripcion: item.descripcion || '' }; this.editingId.set(item.id); this.showModal.set(true); }

  generateSlug() { this.form.slug = this.form.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`${this.apiUrl}/${id}`, this.form) : this.http.post(this.apiUrl, this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.modalService.success(this.editingId() ? 'Marca actualizada' : 'Marca creada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Desactivar esta marca?');
    if (!ok) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.load(); this.modalService.success('Marca desactivada'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al desactivar')
    });
  }
}
