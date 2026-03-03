import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  producto_id: string;
  talla_id: string;
  talla_valor: string;
  cantidad: number;
  nombre: string;
  precio: number;
  imagen_url: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);

  items = signal<CartItem[]>([]);

  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  );

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        this.items.set(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('cart');
    }
  }

  private saveToStorage() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    } catch {
      // Storage not available
    }
  }

  addItem(item: CartItem) {
    const current = this.items();
    const existing = current.findIndex(
      i => i.producto_id === item.producto_id && i.talla_id === item.talla_id
    );

    if (existing >= 0) {
      const updated = [...current];
      updated[existing] = {
        ...updated[existing],
        cantidad: updated[existing].cantidad + item.cantidad
      };
      this.items.set(updated);
    } else {
      this.items.set([...current, item]);
    }
    this.saveToStorage();
  }

  updateQuantity(productoId: string, tallaId: string, cantidad: number) {
    if (cantidad <= 0) {
      this.removeItem(productoId, tallaId);
      return;
    }
    const updated = this.items().map(item =>
      item.producto_id === productoId && item.talla_id === tallaId
        ? { ...item, cantidad }
        : item
    );
    this.items.set(updated);
    this.saveToStorage();
  }

  removeItem(productoId: string, tallaId: string) {
    const filtered = this.items().filter(
      item => !(item.producto_id === productoId && item.talla_id === tallaId)
    );
    this.items.set(filtered);
    this.saveToStorage();
  }

  clearCart() {
    this.items.set([]);
    this.saveToStorage();
  }

  validateCart(): Observable<any> {
    const cartItems = this.items().map(item => ({
      producto_id: item.producto_id,
      talla_id: item.talla_id,
      cantidad: item.cantidad
    }));
    return this.http.post('/api/carrito/validar', { items: cartItems });
  }
}
