import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  updateQuantity(productoId: string, tallaId: string, cantidad: number) {
    this.cartService.updateQuantity(productoId, tallaId, cantidad);
  }

  removeItem(productoId: string, tallaId: string) {
    this.cartService.removeItem(productoId, tallaId);
  }

  goToCheckout() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/catalogo']);
  }
}
