import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';
=======
import { RouterLink } from '@angular/router';
>>>>>>> origin/main

@Component({
  selector: 'app-admin-ordenes',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
=======
  imports: [CommonModule, FormsModule, RouterLink],
>>>>>>> origin/main
  templateUrl: './admin-ordenes.html',
  styleUrl: './admin-ordenes.css'
})
export class AdminOrdenesComponent implements OnInit {
  private http = inject(HttpClient);
<<<<<<< HEAD
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/ordenes`;
=======
>>>>>>> origin/main
  ordenes = signal<any[]>([]);
  loading = signal(true);
  message = signal<string | null>(null);
  estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
<<<<<<< HEAD
  filtroCliente = '';
  filtroEstado = '';

  get ordenesFiltradas() {
    return this.ordenes().filter(o => {
      if (this.filtroCliente) {
        const nombre = `${o.perfiles?.nombre || ''} ${o.perfiles?.apellido || ''}`.toLowerCase();
        if (!nombre.includes(this.filtroCliente.toLowerCase())) return false;
      }
      if (this.filtroEstado && o.estado !== this.filtroEstado) return false;
      return true;
    });
  }
=======
>>>>>>> origin/main

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
<<<<<<< HEAD
    this.http.get<any[]>(this.apiUrl).subscribe({
=======
    this.http.get<any[]>('/api/ordenes').subscribe({
>>>>>>> origin/main
      next: (data) => { this.ordenes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cambiarEstado(id: string, estado: string) {
<<<<<<< HEAD
    this.http.put(`${this.apiUrl}/${id}/estado`, { estado }).subscribe({
      next: () => { this.load(); this.modalService.success('Estado actualizado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al cambiar estado')
=======
    this.http.put(`/api/ordenes/${id}/estado`, { estado }).subscribe({
      next: () => { this.message.set('Estado actualizado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
>>>>>>> origin/main
    });
  }

  getEstadoColor(estado: string): string {
    const colors: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-primary-100 text-primary-800',
      'enviada': 'bg-purple-100 text-purple-800',
      'entregada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }
}
