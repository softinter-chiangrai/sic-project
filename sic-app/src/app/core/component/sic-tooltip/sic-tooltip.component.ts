import { Component, Input } from '@angular/core';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'sic-tooltip',
  templateUrl: './sic-tooltip.component.html',
  styleUrl: './sic-tooltip.component.css',
  host: {
    class: 'fixed block pointer-events-none z-[9999]'
  }
})
export class SictoolTipComponent {
  @Input() text = '';
  @Input() position: TooltipPosition = 'bottom';

  get positionClass(): string {
    return 'animate-fade-in';
  }
}