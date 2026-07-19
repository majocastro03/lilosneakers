import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { SidebarService } from '../services/sidebar.service';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, SafeHtmlPipe],
  templateUrl: './admin-layout.html',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  readonly sidebar = inject(SidebarService);

  showUserMenu = signal(false);

  @ViewChild('userMenuContainer') userMenuContainer?: ElementRef<HTMLElement>;

  /** Items de navegación principal del admin */
  navItems: NavItem[] = [
    {
      name: 'Productos',
      path: '/admin/productos',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 7.5L12 3.25l8.5 4.25L12 11.75 3.5 7.5zm0 4.5L12 16.25 20.5 12M3.5 16.5L12 20.75 20.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'Categorías',
      path: '/admin/categorias',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H10.25V10.25H3.25V5.5ZM13.75 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V10.25H13.75V3.25ZM3.25 13.75H10.25V20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V13.75ZM13.75 13.75H20.75V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H13.75V13.75Z" fill="currentColor"/></svg>`,
    },
    {
      name: 'Marcas',
      path: '/admin/marcas',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'Colores',
      path: '/admin/colores',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.75a9.25 9.25 0 109.25 9.25c0-2.5-2.25-2.5-2.25-4.5 0-1 .75-1.5.75-2.5 0-1.25-1.25-2.25-2.75-2.25-2.75 0-4.5-.25-4.5-.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="11" r="1.25" fill="currentColor"/><circle cx="10" cy="7" r="1.25" fill="currentColor"/><circle cx="14" cy="7" r="1.25" fill="currentColor"/><circle cx="17" cy="11" r="1.25" fill="currentColor"/></svg>`,
    },
    {
      name: 'Tallas',
      path: '/admin/tallas',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.25 8.5L12 4.25l8.75 4.25L12 12.75 3.25 8.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.25 13.5L12 17.75l8.75-4.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'Órdenes',
      path: '/admin/ordenes',
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
  ];

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    const nombre = user.nombre || user.username || '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /** Sidebar "abierto" visualmente (expandido por click, hover, o abierto en mobile) */
  get sidebarOpen(): boolean {
    return this.sidebar.isExpanded() || this.sidebar.isHovered() || this.sidebar.isMobileOpen();
  }

  onSidebarMouseEnter() {
    if (!this.sidebar.isExpanded()) {
      this.sidebar.setHovered(true);
    }
  }

  onSidebarMouseLeave() {
    this.sidebar.setHovered(false);
  }

  toggleSidebar() {
    // En mobile usa el off-canvas; en desktop expande/colapsa
    if (window.matchMedia('(min-width: 1280px)').matches) {
      this.sidebar.toggleExpanded();
    } else {
      this.sidebar.toggleMobile();
    }
  }

  closeMobile() {
    this.sidebar.setMobileOpen(false);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  toggleUserMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.showUserMenu.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showUserMenu()) return;
    const target = event.target as Node;
    if (this.userMenuContainer && !this.userMenuContainer.nativeElement.contains(target)) {
      this.showUserMenu.set(false);
    }
  }

  async logout() {
    this.showUserMenu.set(false);
    const ok = await this.modalService.confirm('¿Estás seguro de cerrar sesión?');
    if (ok) {
      this.authService.logout();
    }
  }
}
