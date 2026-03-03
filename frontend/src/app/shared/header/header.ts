import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private router = inject(Router);
  cartService = inject(CartService);
  authService = inject(AuthService);

  isMobileMenuOpen = false;
  searchQuery = '';
  navLinks = [
    { path: '/catalogo', label: 'Catalogo' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/contacto', label: 'Contacto' }
  ];

  onLogin(): void {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/productos']);
      } else {
        this.router.navigate(['/catalogo']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onCart(): void {
    this.router.navigate(['/carrito']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalogo'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.isMobileMenuOpen = false;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
