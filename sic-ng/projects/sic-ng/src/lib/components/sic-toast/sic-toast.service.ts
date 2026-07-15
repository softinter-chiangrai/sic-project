import { Injectable, signal } from '@angular/core';

export type SicToastType = 'info' | 'success' | 'danger' | 'warning';
export type SicToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface SicToast {
  id: number;
  message: string;
  type: SicToastType;
  duration: number;
}

let nextId = 1;

@Injectable({
  providedIn: 'root',
})
export class SicToastService {
  readonly toasts = signal<SicToast[]>([]);

  show(message: string, type: SicToastType = 'info', duration = 3500): number {
    const toast: SicToast = { id: nextId++, message, type, duration };
    this.toasts.update((list) => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }

    return toast.id;
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
