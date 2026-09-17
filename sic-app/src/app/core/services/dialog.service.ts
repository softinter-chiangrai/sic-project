// src/app/core/services/dialog.service.ts
import { ApplicationRef, ComponentRef, createComponent, DOCUMENT, EnvironmentInjector, inject, Injectable, signal, Type } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SicDialogService as SicNgDialogService } from 'sic-ng';
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
  private readonly sicDialog = inject(SicNgDialogService);
  private readonly dialogState = signal<DialogState | null>(null);
  private componentRef?: ComponentRef<SicDialogComponent>;
  private resolver?: (result: boolean) => void;

  readonly state = this.dialogState.asReadonly();

  async info(title: string, description: string): Promise<boolean> {
    await firstValueFrom(this.sicDialog.info(title, description));
    return true;
  }

  async success(title: string, description: string): Promise<boolean> {
    await firstValueFrom(this.sicDialog.success(title, description));
    return true;
  }

  async warn(title: string, description: string): Promise<boolean> {
    await firstValueFrom(this.sicDialog.warning(title, description));
    return true;
  }

  async error(title: string, description: string): Promise<boolean> {
    await firstValueFrom(this.sicDialog.danger(title, description));
    return true;
  }

  confirm(title: string, description: string): Promise<boolean> {
    return firstValueFrom(this.sicDialog.confirm(title, description));
  }

  /** Custom-component dialogs still render through our own SicDialogComponent —
   *  sic-ng's SicDialogService.open() passes data via DI (SIC_DIALOG_DATA), while
   *  every dialog component here expects plain @Input()s via componentInputs. */
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