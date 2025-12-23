import { Component, inject, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/footer/footer';
import { HeaderComponent } from '../../shared/header/header';
import { ProductoService } from '../../core/services/producto/producto-service';
import { MarcaService } from '../../core/services/marca/marca-service';
import { CategoriaService } from '../../core/services/categoria/categoria-service';
import { TallaService } from '../../core/services/talla/talla-service';
import { ColoresService } from '../../core/services/colores/colores-service';
import { Producto } from '../../core/interfaces/producto';
import { ProductosQuery } from '../../core/interfaces/producto-query';

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
  private tallaService = inject(TallaService);
  private colorService = inject(ColoresService);

  // --- Filtros reactivos ---
  searchTerm = signal<string>('');
  marcaId = signal<string | null>(null);
  categoriaId = signal<string | null>(null);
  colorId = signal<string | null>(null);
  tallaId = signal<string | null>(null);
  genero = signal<string | null>(null);
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  orderBy = signal<'precio_asc' | 'precio_desc' | 'destacado'>('destacado');

  // --- Paginación ---
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(false);

  // --- Catálogos para filtros ---
  marcas$ = this.marcaService.getMarcas();
  categorias$ = this.categoriaService.getCategorias();
  tallas$ = this.tallaService.getTallas();
  colores$ = this.colorService.getColores();

  // --- Productos ---
  productos = signal<Producto[]>([]);

  productosConTallas = computed(() => {
    return this.productos().map((p) => {
      const tallasDisponibles = p.tallas.filter((t) => t.cantidad > 0);
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

  // --- Array de páginas dinámico ---
  protected readonly createPageArray = computed(() => {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const current = this.currentPage();
    const pages: number[] = [1];

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);
    pages.push(total);

    return pages;
  });

  // --- Query reactiva ---
  private query = computed(() => {
    const qParams: ProductosQuery = {
      page: this.currentPage(),
      limit: 8,
      search: this.searchTerm().trim() || undefined,
      categoria_id: this.categoriaId() || undefined,
      marca_id: this.marcaId() || undefined,
      color_id: this.colorId() || undefined,
      talla_id: this.tallaId() || undefined,
      genero: this.genero() || undefined,
      precio_min: this.precioMin() || undefined,
      precio_max: this.precioMax() || undefined,
      orderBy: this.orderBy(),
    };
    return qParams;
  });

  // --- Efecto reactivo ---
  protected readonly _ = effect(() => {
    this.query();
    this.cargarProductos();
  });

  // --- Métodos principales ---
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
  }

  // --- Métodos de filtros ---
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onCategoriaChange(event: Event) {
    const select = (event.target as HTMLSelectElement).value;
    this.categoriaId.set(select || null);
  }

  onMarcaChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.marcaId.set(value || null);
  }

  onColorChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.colorId.set(value || null);
  }

  onTallaChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.tallaId.set(value || null);
  }

  onGeneroChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.genero.set(value || null);
  }

  onOrderByChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.orderBy.set(select.value as any);
  }

  limpiarFiltros() {
    this.searchTerm.set('');
    this.categoriaId.set(null);
    this.marcaId.set(null);
    this.colorId.set(null);
    this.tallaId.set(null);
    this.genero.set(null);
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.orderBy.set('destacado');
    this.currentPage.set(1);
  }
}
