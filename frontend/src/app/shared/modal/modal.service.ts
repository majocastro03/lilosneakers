import { Injectable, signal } from '@angular/core';

export type ModalType = 'info' | 'success' | 'error' | 'confirm';

export interface ModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  state = signal<ModalState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    resolve: null,
  });

  private open(type: ModalType, message: string, title?: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const titles: Record<ModalType, string> = {
        info: 'Informacion',
        success: 'Exito',
        error: 'Error',
        confirm: 'Confirmar',
      };
      this.state.set({
        visible: true,
        type,
        title: title ?? titles[type],
        message,
        confirmText: type === 'confirm' ? 'Confirmar' : 'Aceptar',
        cancelText: 'Cancelar',
        resolve,
      });
    });
  }

  info(message: string, title?: string) {
    return this.open('info', message, title);
  }

  success(message: string, title?: string) {
    return this.open('success', message, title);
  }

  error(message: string, title?: string) {
    return this.open('error', message, title);
  }

  confirm(message: string, title?: string) {
    return this.open('confirm', message, title);
  }

  close(result: boolean) {
    const current = this.state();
    if (current.resolve) {
      current.resolve(result);
    }
    this.state.set({ ...current, visible: false, resolve: null });
  }
}
