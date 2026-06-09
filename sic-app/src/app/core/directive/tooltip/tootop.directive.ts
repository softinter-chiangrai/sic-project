import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  Input,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SictoolTipComponent } from '../../component/sic-tooltip/sic-tooltip.component';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective implements OnDestroy {
  @Input('tooltip') text = '';
  @Input() tooltipPosition: TooltipPosition = 'bottom';
  @Input() tooltipOffset = 8;
  @Input() tooltipDisabled = false;

  private tooltipRef?: ComponentRef<SictoolTipComponent>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private appRef: ApplicationRef,
    private injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipDisabled || !this.text?.trim()) return;
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.tooltipDisabled || !this.text?.trim()) return;
    this.showTooltip();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hideTooltip();
  }

  ngOnDestroy(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (this.tooltipRef) return;

    this.tooltipRef = createComponent(SictoolTipComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    this.tooltipRef.instance.text = this.text;
    this.tooltipRef.instance.position = this.tooltipPosition;

    this.appRef.attachView(this.tooltipRef.hostView);

    const tooltipElement = this.tooltipRef.location.nativeElement as HTMLElement;
    this.document.body.appendChild(tooltipElement);

    this.setPosition();
  }

  private hideTooltip(): void {
    if (!this.tooltipRef) return;

    this.appRef.detachView(this.tooltipRef.hostView);
    this.tooltipRef.destroy();
    this.tooltipRef = undefined;
  }

  private setPosition(): void {
    if (!this.tooltipRef) return;

    const hostEl = this.elementRef.nativeElement;
    const tooltipEl = this.tooltipRef.location.nativeElement as HTMLElement;

    const hostRect = hostEl.getBoundingClientRect();

    tooltipEl.style.position = 'fixed';
    tooltipEl.style.top = '0';
    tooltipEl.style.left = '0';
    tooltipEl.style.visibility = 'hidden';

    requestAnimationFrame(() => {
      const tooltipRect = tooltipEl.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (this.tooltipPosition) {
        case 'top':
          top = hostRect.top - tooltipRect.height - this.tooltipOffset;
          left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
          break;

        case 'bottom':
          top = hostRect.bottom + this.tooltipOffset;
          left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
          break;

        case 'left':
          top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
          left = hostRect.left - tooltipRect.width - this.tooltipOffset;
          break;

        case 'right':
          top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
          left = hostRect.right + this.tooltipOffset;
          break;
      }

      const padding = 8;

      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }

      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.visibility = 'visible';
    });
  }
}