import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';
import { SicTooltipComponent } from './sic-tooltip.component';

export type SicTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<SicTooltipPlacement, ConnectedPosition> = {
  top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
};

@Directive({
  selector: '[sicTooltip]',
  standalone: true,
})
export class SicTooltipDirective implements OnDestroy {
  @Input('sicTooltip') text = '';
  @Input() sicTooltipPlacement: SicTooltipPlacement = 'top';

  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);
  private overlayRef?: OverlayRef;

  @HostListener('mouseenter')
  @HostListener('focus')
  show(): void {
    if (!this.text || this.overlayRef) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([POSITIONS[this.sicTooltipPlacement], ...Object.values(POSITIONS)]);

    this.overlayRef = this.overlay.create({ positionStrategy, panelClass: 'sic-tooltip__panel' });
    const portal = new ComponentPortal(SicTooltipComponent);
    const ref = this.overlayRef.attach(portal);
    ref.instance.text = this.text;
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
