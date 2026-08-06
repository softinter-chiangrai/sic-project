import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, StaticProvider, inject } from '@angular/core';

export const SIC_DIALOG_DATA = Symbol('SIC_DIALOG_DATA');

export interface SicDialogConfig<D = unknown> {
  data?: D;
  width?: string;
  disableClose?: boolean;
}

export interface SicDialogRef<T = unknown> {
  componentInstance: T;
  close: () => void;
  overlayRef: OverlayRef;
}

@Injectable({
  providedIn: 'root',
})
export class SicDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  open<T, D = unknown>(component: ComponentType<T>, config: SicDialogConfig<D> = {}): SicDialogRef<T> {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      width: config.width ?? 'auto',
      panelClass: 'sic-dialog__panel',
      backdropClass: 'sic-dialog__backdrop',
    });

    const close = () => overlayRef.dispose();

    if (!config.disableClose) {
      overlayRef.backdropClick().subscribe(close);
    }

    const providers: StaticProvider[] = [{ provide: SIC_DIALOG_DATA, useValue: config.data }];
    const childInjector = Injector.create({ parent: this.injector, providers });
    const portal = new ComponentPortal(component, null, childInjector);
    const componentRef = overlayRef.attach(portal);

    return { componentInstance: componentRef.instance, close, overlayRef };
  }
}
