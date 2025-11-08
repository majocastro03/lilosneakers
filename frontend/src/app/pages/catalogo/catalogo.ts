import { Component, inject, effect } from '@angular/core';
import { ProductoService } from '../../core/services/producto/producto-service';
import { computed, signal } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer';
import { HeaderComponent } from "../../shared/header/header";
import { Producto } from '../../core/interfaces/producto';
import { ProductosQuery } from '../../core/interfaces/producto-query';
import { MarcaService } from '../../core/services/marca/marca-service';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../core/services/categoria/categoria-service';


@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private productoService = inject(ProductoService);
  private marcaService = inject(MarcaService);
  private categoriaService = inject(CategoriaService);
  // Filtros reactivos
  searchTerm = signal<string>('');
  marcaId = signal<string | null>(null);
  categoriaId = signal<string | null>(null);
  orderBy = signal<'relevancia' | 'precio_asc' | 'precio_desc' | 'novedades'>('relevancia');

  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(false);

  // Marcas
  marcas$ = this.marcaService.getMarcas();

  // Categorías
  categorias$ = this.categoriaService.getCategorias();
  // Productos con datos derivados
  productos = signal<Producto[]>([]);

  // Productos con tallas filtradas y datos adicionales
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
    const select = (event.target as HTMLSelectElement).value;
    this.categoriaId.set(select || null);
  }

  onMarcaChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // Haz lo que necesites con el ID (ej: filtrar productos)
    this.marcaId.set(value || null);
    console.log('Marca seleccionada:', value);
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
    this.marcaId.set(null);
  }
}