// src/app/core/services/dialog.service.ts
import { ApplicationRef, ComponentRef, createComponent, DOCUMENT, EnvironmentInjector, inject, Injectable, signal, Type } from '@angular/core';
import { SicDialogComponent } from '../component/sic-dialog/sic-dialog.component';

export type DialogType = 'info' | 'success' | 'warn' | 'confirm' | 'error';

export type DialogOptions = {
  type: DialogType;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  component?: Type<unknown> | null;
  componentInputs?: Record<string, unknown>;
};

export type DialogState = Required<DialogOptions>;

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly dialogState = signal<DialogState | null>(null);
  private componentRef?: ComponentRef<SicDialogComponent>;
  private resolver?: (result: boolean) => void;

  readonly state = this.dialogState.asReadonly();

  info(title: string, description: string): Promise<boolean> {
    return this.open({ type: 'info', title, description, confirmText: 'OK' });
  }

  success(title: string, description: string): Promise<boolean> {
    return this.open({ type: 'success', title, description, confirmText: 'OK' });
  }

  warn(title: string, description: string): Promise<boolean> {
    return this.open({ type: 'warn', title, description, confirmText: 'OK' });
  }

  error(title: string, description: string): Promise<boolean> {
    return this.open({ type: 'error', title, description, confirmText: 'OK' });
  }

  confirm(title: string, description: string): Promise<boolean> {
    return this.open({
      type: 'confirm',
      title,
      description,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    });
  }

  open(options: DialogOptions): Promise<boolean> {
    this.ensureDialogMounted();
    this.close(false);

    const state: DialogState = {
      ...options,
      title: options.title ?? '',
      description: options.description ?? '',
      confirmText: options.confirmText ?? 'OK',
      cancelText: options.cancelText ?? 'Cancel',
      component: options.component ?? null,
      componentInputs: options.componentInputs ?? {},
    };

    this.dialogState.set(state);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  close(result = false): void {
    const resolve = this.resolver;
    this.resolver = undefined;
    this.dialogState.set(null);
    resolve?.(result);
  }

  private ensureDialogMounted(): void {
    if (this.componentRef) {
      return;
    }

    const hostElement = this.document.createElement('div');
    this.document.body.appendChild(hostElement);

    this.componentRef = createComponent(SicDialogComponent, {
      environmentInjector: this.environmentInjector,
      hostElement,
    });

    this.appRef.attachView(this.componentRef.hostView);
  }
}