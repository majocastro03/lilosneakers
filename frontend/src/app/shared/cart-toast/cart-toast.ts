import { Component, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-toast.html',
  styleUrl: './cart-toast.css'
})
export class CartToastComponent {
  cartService = inject(CartService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  visible = signal(false);
  private timeoutId: any = null;

  constructor() {
    effect(() => {
      const agregado = this.cartService.ultimoAgregado();
      if (!agregado || !this.isBrowser) return;

      this.visible.set(true);
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.visible.set(false), 4000);
    });
  }

  irAlCarrito() {
    this.visible.set(false);
    this.router.navigate(['/carrito']);
  }

  cerrar() {
    this.visible.set(false);
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
