import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductoService } from '../../core/services/producto/producto-service';
import { CategoriaService } from '../../core/services/categoria/categoria-service';
import { MarcaService } from '../../core/services/marca/marca-service';
import { Producto } from '../../core/interfaces/producto';
import { Categoria } from '../../core/interfaces/categoria';
import { Marca } from '../../core/interfaces/marca';
=======
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductoService } from '../../core/services/producto/producto-service';
import { Producto } from '../../core/interfaces/producto';
>>>>>>> origin/main

@Component({
  selector: 'app-home',
  standalone: true,
<<<<<<< HEAD
  imports: [HeaderComponent, FooterComponent, ProductCardComponent, CommonModule, FormsModule, RouterLink],
=======
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterLink],
>>>>>>> origin/main
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productoService = inject(ProductoService);
<<<<<<< HEAD
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);

  currentYear = new Date().getFullYear();

  // Catálogo
  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);
  productos = signal<Producto[]>([]);
  loadingCatalogo = signal(true);
  categoriaSeleccionada = signal<string | null>(null);
  marcaSeleccionada = signal<string>('');
  ordenarPor = signal<string>('destacados');
  searchQuery = signal<string>('');

  private searchTimeout: any;

  ngOnInit() {
    this.categoriaService.getCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
    });

    this.marcaService.getMarcas().subscribe({
      next: (marcas) => this.marcas.set(marcas),
    });

    this.cargarProductos();
  }

  cargarProductos() {
    this.loadingCatalogo.set(true);
    const query: any = { limit: 6 };

    const cat = this.categoriaSeleccionada();
    if (cat) query.categoria_id = cat;

    const marca = this.marcaSeleccionada();
    if (marca) query.marca_id = marca;

    const q = this.searchQuery();
    if (q) query.q = q;

    const orden = this.ordenarPor();
    if (orden === 'destacados') {
      query.destacado = true;
    } else if (orden === 'precio_asc') {
      query.orderBy = 'precio_asc';
    } else if (orden === 'precio_desc') {
      query.orderBy = 'precio_desc';
    }

    this.productoService.getProductos(query).subscribe({
      next: (res) => {
        this.productos.set(res.productos);
        this.loadingCatalogo.set(false);
      },
      error: () => this.loadingCatalogo.set(false),
    });
  }

  filtrarPorCategoria(categoriaId: string | null) {
    this.categoriaSeleccionada.set(categoriaId);
    this.cargarProductos();
  }

  onMarcaChange(marcaId: string) {
    this.marcaSeleccionada.set(marcaId);
    this.cargarProductos();
  }

  onOrdenChange(orden: string) {
    this.ordenarPor.set(orden);
    this.cargarProductos();
  }

  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchQuery.set(value);
      this.cargarProductos();
    }, 400);
  }
=======

  productosDestacados = signal<Producto[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.productoService.getProductos({ limit: 4, destacado: true }).subscribe({
      next: (res) => {
        this.productosDestacados.set(res.productos);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
>>>>>>> origin/main
}
