import { Component, inject, effect } from '@angular/core';
import {ProductoService} from '../../core/services/producto';
import { computed, signal } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer';
import { HeaderComponent } from "../../shared/header/header";
import { Producto } from '../../core/interfaces/producto';
import { ProductosQuery } from '../../core/interfaces/productoQuery';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private productoService = inject(ProductoService);

  // Filtros reactivos
  searchTerm = signal<string>('');
  categoriaId = signal<string | null>(null);
  orderBy = signal<'relevancia' | 'precio_asc' | 'precio_desc' | 'novedades'>('relevancia');

  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(false);

  // Productos con datos derivados
  productos = signal<Producto[]>([]);

  productosConTallas = computed(() => {
    return this.productos().map(p => {
      // Filtramos tallas con stock > 0
      const tallasDisponibles = p.tallas.filter(t => t.cantidad > 0);
      const tallasPreview = tallasDisponibles.slice(0, 3);
      const tallasExtraCount = tallasDisponibles.length - 3;

      return {
        ...p,
        tallasDisponibles,
        tallasPreview,
        tallasExtraCount: tallasExtraCount > 0 ? tallasExtraCount : 0,
      };
    });
  });

  // Array de páginas
  protected readonly createPageArray = computed(() => {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const current = this.currentPage();
    const pages: (number)[] = [1];

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);
    pages.push(total);

    return pages;
  });

  // Query reactiva (se actualiza automáticamente cuando cambian los filtros)
  private query = computed(() => {
    const qParams: ProductosQuery = {
      page: this.currentPage(),
      limit: 8,
      q: this.searchTerm().trim() || undefined,
      categoria_id: this.categoriaId() || undefined,
    };
    return qParams;
  });

  // Efecto reactivo: cuando cambia `query`, recargamos
  protected readonly _ = effect(() => {
    // Leer `query` para establecer la dependencia reactiva y recargar
    this.query();
    this.cargarProductos();
  });

  cargarProductos() {
    this.loading.set(true);
    const q = this.query();

    this.productoService.getProductos(q).subscribe({
      next: (res) => {
        this.productos.set(res.productos);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading.set(false);
      },
    });
  }

  cambiarPagina(page: number) {
    if (page === -1 || page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    // El efecto reactivo ya se encarga de recargar
  }

  // Métodos para filtros
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onCategoriaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.categoriaId.set(select.value || null);
  }

  onOrderByChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.orderBy.set(select.value as any);
  }

  limpiarFiltros() {
    this.searchTerm.set('');
    this.categoriaId.set(null);
    this.orderBy.set('relevancia');
    this.currentPage.set(1);
  }
}