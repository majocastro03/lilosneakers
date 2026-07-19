import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent {
  cartService = inject(CartService);
  private router = inject(Router);

  updateQuantity(productoId: string, tallaId: string, cantidad: number, colorNombre?: string) {
    this.cartService.updateQuantity(productoId, tallaId, cantidad, colorNombre);
  }

  removeItem(productoId: string, tallaId: string, colorNombre?: string) {
    this.cartService.removeItem(productoId, tallaId, colorNombre);
  }

  pedirPorWhatsApp() {
    if (this.cartService.items().length === 0) return;
    const url = this.cartService.construirUrlWhatsApp();
    window.open(url, '_blank');
  }

  continueShopping() {
    this.router.navigate(['/catalogo']);
  }
}
