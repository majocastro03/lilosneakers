import { Component, OnInit } from '@angular/core';
import { Producto, ProductoService, ProductosResponse } from '../../core/services/producto';
import { Signal, computed, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  productos = signal<Producto[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(false);

  // ✅ Computamos el array de páginas (mejor que Array.from en plantilla)
  protected readonly createPageArray = computed(() => {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const current = this.currentPage();
    const pages: number[] = [];

    // Siempre incluir 1 y última
    pages.push(1);

    // Rango alrededor de la página actual
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1); // ... (ellipsis)
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);

    pages.push(total);

    return pages;
  });

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos(page: number = 1) {
    this.loading.set(true);
    this.currentPage.set(page);

    this.productoService.getProductos({ page, limit: 8 }).subscribe({
      next: (res: ProductosResponse) => {
        this.productos.set(res.productos);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading.set(false);
      }
    });
  }

  cambiarPagina(page: number) {
    if (page === -1) return; // ellipsis
    if (page >= 1 && page <= this.totalPages()) {
      this.cargarProductos(page);
    }
  }
}