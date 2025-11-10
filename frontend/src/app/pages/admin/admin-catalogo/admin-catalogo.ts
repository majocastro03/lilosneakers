import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../../core/services/producto/producto-service';
import { CategoriaService } from '../../../core/services/categoria/categoria-service';
import { FooterComponent } from '../../../shared/footer/footer';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-admin-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    TableModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    RippleModule
  ],
  templateUrl: './admin-catalogo.html',
  styleUrls: ['./admin-catalogo.css'],
})
export class AdminCatalogo implements OnInit {

  productos: any[] = [];
  categorias: any[] = [];
  productosFiltrados: any[] = [];

  filtroBusqueda = '';
  filtroCategoria = '';
  itemsPorPagina = 10;
  paginaActual = 1;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private router: Router,
    private cdr: ChangeDetectorRef // 
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = Array.isArray(data) ? data : data.productos ?? [];
        this.filtrarProductos(); // Se ejecuta aquí
        this.cdr.detectChanges(); // Fuerza render si hay retraso
      },
      error: (err) => console.error('Error al cargar productos', err),
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges(); // Para que el dropdown se actualice
      },
      error: (err) => console.error('Error al cargar categorías', err),
    });
  }

  filtrarProductos() {
    let filtered = [...this.productos];

    if (this.filtroBusqueda) {
      const term = this.filtroBusqueda.toLowerCase();
      filtered = filtered.filter((p) =>
        (p.nombre?.toLowerCase().includes(term) || p.id?.toLowerCase().includes(term))
      );
    }

    if (this.filtroCategoria) {
      filtered = filtered.filter(
        (p) => p.categoria_id === this.filtroCategoria
      );
    }

    this.productosFiltrados = filtered;
    this.paginaActual = 1;
    this.cdr.detectChanges(); // Garantiza que la tabla se actualice
  }

  onPageChange(event: any) {
    this.paginaActual = event.page + 1;
    this.itemsPorPagina = event.rows;
  }

  editarProducto(producto: any) {
    this.router.navigate(['/admin/editar', producto.id]);
  }

  eliminarProducto(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter((p) => p.id !== id);
          this.filtrarProductos();
        },
        error: (err) => console.error('Error al eliminar producto', err),
      });
    }
  }

  abrirModalNuevo() {
    this.router.navigate(['/admin/nuevo']);
  }
  // En la clase AdminCatalogo
  get startIndex(): number {
    return (this.paginaActual - 1) * this.itemsPorPagina;
  }

  get endIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.productosFiltrados.length);
  }

  get totalPages(): number {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.paginaActual = page;
    }
  }
}