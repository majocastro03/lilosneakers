import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  cartService = inject(CartService);
  authService = inject(AuthService);

  checkoutForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  orderSuccess = signal(false);
  orderId = signal<string | null>(null);

  constructor() {
    const user = this.authService.getCurrentUser();
    this.checkoutForm = this.fb.group({
      direccion_envio: ['', [Validators.required, Validators.minLength(10)]],
      telefono_contacto: [user?.email || '', [Validators.required]],
      notas: ['']
    });

    if (this.cartService.items().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const orderData = {
      items: this.cartService.items().map(item => ({
        producto_id: item.producto_id,
        talla_id: item.talla_id,
        cantidad: item.cantidad
      })),
      ...this.checkoutForm.value
    };

    this.http.post<any>(`${environment.apiUrl}/ordenes`, orderData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.orderSuccess.set(true);
        this.orderId.set(response.orden?.id);
        this.cartService.clearCart();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Error al procesar la orden');
      }
    });
  }

  showError(controlName: string): boolean {
    const control = this.checkoutForm.get(controlName);
    return !!control && (control.dirty || control.touched) && !!control.errors;
  }

  goToCatalogo() {
    this.router.navigate(['/catalogo']);
  }
}
