import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SITE_CONFIG } from '../config/site.config';

export interface CartItem {
  producto_id: string;
  talla_id: string;
  talla_valor: string;
  color_nombre?: string;
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

  /** Se actualiza cada vez que se agrega un producto, para disparar el toast. */
  ultimoAgregado = signal<{ nombre: string; ts: number } | null>(null);

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

  private mismaVariante(item: CartItem, productoId: string, tallaId: string, colorNombre?: string) {
    return item.producto_id === productoId
      && item.talla_id === tallaId
      && (item.color_nombre ?? '') === (colorNombre ?? '');
  }

  addItem(item: CartItem) {
    const current = this.items();
    const existing = current.findIndex(
      i => this.mismaVariante(i, item.producto_id, item.talla_id, item.color_nombre)
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
    this.ultimoAgregado.set({ nombre: item.nombre, ts: Date.now() });
  }

  updateQuantity(productoId: string, tallaId: string, cantidad: number, colorNombre?: string) {
    if (cantidad <= 0) {
      this.removeItem(productoId, tallaId, colorNombre);
      return;
    }
    const updated = this.items().map(item =>
      this.mismaVariante(item, productoId, tallaId, colorNombre)
        ? { ...item, cantidad }
        : item
    );
    this.items.set(updated);
    this.saveToStorage();
  }

  removeItem(productoId: string, tallaId: string, colorNombre?: string) {
    const filtered = this.items().filter(
      item => !this.mismaVariante(item, productoId, tallaId, colorNombre)
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
    return this.http.post(`${environment.apiUrl}/carrito/validar`, { items: cartItems });
  }

  private formatearPrecio(valor: number): string {
    return '$' + Math.round(valor).toLocaleString('es-CO');
  }

  /** Arma el mensaje del pedido y devuelve la URL de WhatsApp lista para abrir. */
  construirUrlWhatsApp(): string {
    const items = this.items();
    const lineas: string[] = [
      `¡Hola ${SITE_CONFIG.name}! 👟 Quiero hacer este pedido:`,
      ''
    ];

    items.forEach((item, i) => {
      lineas.push(`${i + 1}. ${item.nombre}`);
      lineas.push(`   • Talla: ${item.talla_valor}`);
      if (item.color_nombre) {
        lineas.push(`   • Color: ${item.color_nombre}`);
      }
      lineas.push(`   • Cantidad: ${item.cantidad}`);
      lineas.push(`   • Precio: ${this.formatearPrecio(item.precio)} c/u`);
      lineas.push(`   • Subtotal: ${this.formatearPrecio(item.precio * item.cantidad)}`);
      lineas.push('');
    });

    lineas.push(`*Total: ${this.formatearPrecio(this.totalPrice())}*`);
    lineas.push('');
    lineas.push('¡Gracias! 😊');

    const telefono = SITE_CONFIG.whatsapp[0].number.replace(/\D/g, '');
    const texto = encodeURIComponent(lineas.join('\n'));
    return `https://api.whatsapp.com/send?phone=57${telefono}&text=${texto}`;
  }
}
