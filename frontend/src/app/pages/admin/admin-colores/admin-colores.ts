import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-colores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-colores.html',
  styleUrl: './admin-colores.css'
})
export class AdminColoresComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/colores`;
  colores = signal<any[]>([]);
  showModal = signal(false);
  filtroNombre = '';

  get coloresFiltrados() {
    return this.colores().filter(c =>
      !this.filtroNombre || c.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }
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
      next: () => { this.showModal.set(false); this.load(); this.modalService.success(this.editingId() ? 'Color actualizado' : 'Color creado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al guardar')
    });
  }

  async delete(id: string) {
    const ok = await this.modalService.confirm('¿Eliminar este color?');
    if (!ok) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.load(); this.modalService.success('Color eliminado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar')
    });
  }
}
