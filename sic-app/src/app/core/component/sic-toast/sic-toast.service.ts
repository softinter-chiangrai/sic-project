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
  title?: string;
  type: SicToastType;
  duration: number;
  linkUrl?: string;
  onClick?: () => void;
}

export interface SicToastOptions {
  title?: string;
  type?: SicToastType;
  duration?: number;
  linkUrl?: string;
  onClick?: () => void;
}

let nextId = 1;

@Injectable({
  providedIn: 'root',
})
export class SicToastService {
  readonly toasts = signal<SicToast[]>([]);

  show(
    message: string,
    typeOrOptions: SicToastType | SicToastOptions = 'info',
    duration = 3500
  ): number {
    let options: SicToastOptions = {};
    if (typeof typeOrOptions === 'string') {
      options = { type: typeOrOptions, duration };
    } else if (typeOrOptions) {
      options = { duration, ...typeOrOptions };
    }

    const toast: SicToast = {
      id: nextId++,
      message,
      title: options.title,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : duration,
      linkUrl: options.linkUrl,
      onClick: options.onClick,
    };
    this.toasts.update((list) => [...list, toast]);

    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
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
