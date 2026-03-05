import { Component, inject } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styles: [`
    :host { display: contents; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-scale-in { animation: scaleIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ModalComponent {
  modal = inject(ModalService);

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.modal.close(false);
    }
  }

  getButtonClass(): string {
    switch (this.modal.state().type) {
      case 'success': return 'bg-green-600 text-white hover:bg-green-700';
      case 'error': return 'bg-red-600 text-white hover:bg-red-700';
      default: return 'bg-primary-600 text-white hover:bg-primary-700';
    }
  }
}
