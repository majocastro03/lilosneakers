import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ordenes.html',
  styleUrl: './admin-ordenes.css'
})
export class AdminOrdenesComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/ordenes`;
  ordenes = signal<any[]>([]);
  loading = signal(true);
  message = signal<string | null>(null);
  estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
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

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => { this.ordenes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cambiarEstado(id: string, estado: string) {
    this.http.put(`${this.apiUrl}/${id}/estado`, { estado }).subscribe({
      next: () => { this.load(); this.modalService.success('Estado actualizado'); },
      error: (err) => this.modalService.error(err.error?.error || 'Error al cambiar estado')
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
