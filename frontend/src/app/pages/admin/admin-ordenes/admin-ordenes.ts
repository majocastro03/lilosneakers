import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-ordenes.html',
  styleUrl: './admin-ordenes.css'
})
export class AdminOrdenesComponent implements OnInit {
  private http = inject(HttpClient);
  ordenes = signal<any[]>([]);
  loading = signal(true);
  message = signal<string | null>(null);
  estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any[]>('/api/ordenes').subscribe({
      next: (data) => { this.ordenes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cambiarEstado(id: string, estado: string) {
    this.http.put(`/api/ordenes/${id}/estado`, { estado }).subscribe({
      next: () => { this.message.set('Estado actualizado'); this.load(); setTimeout(() => this.message.set(null), 2000); },
      error: (err) => this.message.set(err.error?.error || 'Error')
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
