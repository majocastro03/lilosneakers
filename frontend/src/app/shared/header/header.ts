import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {

  isMobileMenuOpen = false;
  cartItemCount = 0; 
  SearchQuery = '';
  navLinks = [
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/regalos', label: 'Regalos' },
    { path: '/contacto', label: 'Contacto' }
  ];

  constructor(private router: Router) {}

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onCart(): void {
    this.router.navigate(['/carrito']);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}