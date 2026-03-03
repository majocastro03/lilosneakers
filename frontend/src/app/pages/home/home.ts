import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductoService } from '../../core/services/producto/producto-service';
import { Producto } from '../../core/interfaces/producto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productoService = inject(ProductoService);

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
}
