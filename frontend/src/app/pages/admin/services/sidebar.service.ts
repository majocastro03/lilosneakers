import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  /** Sidebar fijado abierto en desktop (xl+) */
  readonly isExpanded = signal(true);
  /** Sidebar abierto temporalmente por hover (cuando está colapsado) */
  readonly isHovered = signal(false);
  /** Sidebar visible en mobile (off-canvas) */
  readonly isMobileOpen = signal(false);

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  setHovered(v: boolean) {
    this.isHovered.set(v);
  }

  toggleMobile() {
    this.isMobileOpen.update(v => !v);
  }

  setMobileOpen(v: boolean) {
    this.isMobileOpen.set(v);
  }
}
