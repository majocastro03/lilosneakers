import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  sidebarOpen = signal(false);

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    const nombre = user.nombre || user.username || '';
    return nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  async logout() {
    const ok = await this.modalService.confirm('¿Estás seguro de cerrar sesión?');
    if (ok) {
      this.authService.logout();
    }
  }
}
