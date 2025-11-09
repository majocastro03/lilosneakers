import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../../core/services/producto/producto-service';
import { CategoriaService } from '../../../core/services/categoria/categoria-service';
import { HeaderComponent } from '../../../shared/header/header';
import { FooterComponent } from '../../../shared/footer/footer';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    HeaderComponent,
    FooterComponent,
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        // Si tu API devuelve un objeto con { productos, total }:
        this.productos = Array.isArray(data) ? data : data.productos ?? [];
        this.filtrarProductos();
      },
      error: (err) => console.error('Error al cargar productos', err),
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
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
  }

  cambiarPagina(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.paginaActual = page;
  }

  get totalPages(): number {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
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
}
