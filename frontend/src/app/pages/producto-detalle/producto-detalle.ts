import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductoService } from '../../core/services/producto/producto-service';
import { CartService } from '../../core/services/cart.service';
import { Producto } from '../../core/interfaces/producto';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css'
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private cartService = inject(CartService);

  producto = signal<Producto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedTalla = signal<string | null>(null);
  selectedTallaId = signal<string | null>(null);
  cantidad = signal(1);
  addedToCart = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/catalogo']);
      return;
    }

    this.productoService.getProductoById(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el producto');
        this.loading.set(false);
      }
    });
  }

  selectTalla(talla: any) {
    if (talla.cantidad <= 0) return;
    this.selectedTalla.set(talla.talla);
    this.selectedTallaId.set(talla.id);
  }

  incrementCantidad() {
    const talla = this.producto()?.tallas.find(t => t.id === this.selectedTallaId());
    const max = talla?.cantidad || 1;
    if (this.cantidad() < max) {
      this.cantidad.update(c => c + 1);
    }
  }

  decrementCantidad() {
    if (this.cantidad() > 1) {
      this.cantidad.update(c => c - 1);
    }
  }

  addToCart() {
    const prod = this.producto();
    if (!prod || !this.selectedTallaId()) return;

    this.cartService.addItem({
      producto_id: prod.id,
      talla_id: this.selectedTallaId()!,
      talla_valor: this.selectedTalla()!,
      cantidad: this.cantidad(),
      nombre: prod.nombre,
      precio: prod.precio_final,
      imagen_url: prod.imagen_url
    });

    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  goBack() {
    this.router.navigate(['/catalogo']);
  }
}
