import { Component, Input } from '@angular/core';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'sic-tooltip',
  templateUrl: './sic-tooltip.html',
  styleUrl: './sic-tooltip.css',
  host: {
    class: 'fixed block pointer-events-none z-[9999]'
  }
})
export class SictoolTip {
  @Input() text = '';
  @Input() position: TooltipPosition = 'bottom';

  get positionClass(): string {
    return 'animate-fade-in';
  }
}