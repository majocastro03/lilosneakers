import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto, ProductoService, ProductosResponse } from '../../core/services/producto.service';
import { Categoria, CategoriaService } from '../../core/services/categoria.service';
import { HeaderComponent } from "../../shared/header/header";

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;

  // Estados
  productos: ProductosResponse = {
    productos: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  };
  categorias: Categoria[] = [];
  loading = true; // Iniciar en true para mostrar loading desde el primer render
  error: string | null = null;

  // Filtros
  filtros: FiltrosProducto = {
    page: 1,
    limit: 12,
    q: '',
    categoria_id: undefined,
    destacado: undefined
  };

  // Variables auxiliares para los selects
  filtroDestacado: string = '';

  // Para búsqueda con debounce
  searchTimeout: any;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarProductos() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.productoService.getProductos(this.filtros).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar los productos. Por favor intenta de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filtros
  onSearchChange(searchTerm: string) {
    // Debounce de 500ms
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filtros.q = searchTerm;
      this.filtros.page = 1; // Reset a página 1
      this.cargarProductos();
    }, 500);
  }

  onCategoriaChange(categoriaId: string | undefined) {
    this.filtros.categoria_id = categoriaId || undefined;
    this.filtros.page = 1;
    this.cargarProductos();
  }

  onDestacadoChange(destacado: string) {
    if (destacado === 'true') {
      this.filtros.destacado = true;
    } else if (destacado === 'false') {
      this.filtros.destacado = false;
    } else {
      this.filtros.destacado = undefined;
    }
    this.filtros.page = 1;
    this.cargarProductos();
  }

  limpiarFiltros() {
    this.filtros = {
      page: 1,
      limit: 12,
      q: '',
      categoria_id: undefined,
      destacado: undefined
    };
    this.filtroDestacado = '';
    this.cargarProductos();
  }

  // Paginación
  cambiarPagina(page: number) {
    if (page < 1 || page > this.productos.totalPages) return;
    this.filtros.page = page;
    this.cargarProductos();
    
    // Scroll al inicio solo en el navegador
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get paginasPaginacion(): number[] {
    const total = this.productos.totalPages;
    const actual = this.productos.page;
    const rango = 2; // Páginas a mostrar a cada lado

    let inicio = Math.max(1, actual - rango);
    let fin = Math.min(total, actual + rango);

    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
