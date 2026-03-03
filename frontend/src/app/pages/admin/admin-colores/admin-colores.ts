import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-colores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-colores.html',
  styleUrl: './admin-colores.css'
})
export class AdminColoresComponent implements OnInit {
  private http = inject(HttpClient);
  colores = signal<any[]>([]);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  form = { nombre: '', codigo_hex: '#000000' };
  message = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>('/api/colores').subscribe({ next: (data) => this.colores.set(data) }); }
  openCreate() { this.form = { nombre: '', codigo_hex: '#000000' }; this.editingId.set(null); this.showModal.set(true); }
  openEdit(item: any) { this.form = { nombre: item.nombre, codigo_hex: item.codigo_hex }; this.editingId.set(item.id); this.showModal.set(true); }

  save() {
    const id = this.editingId();
    const obs = id ? this.http.put(`/api/colores/${id}`, this.form) : this.http.post('/api/colores', this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.message.set('Guardado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
    });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este color?')) return;
    this.http.delete(`/api/colores/${id}`).subscribe({ next: () => { this.message.set('Eliminado'); this.load(); setTimeout(() => this.message.set(null), 2000); } });
  }
}
