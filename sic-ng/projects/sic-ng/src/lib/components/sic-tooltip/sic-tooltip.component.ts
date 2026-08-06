import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'sic-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="sic-tooltip__bubble">{{ text }}</div>`,
  styleUrl: './sic-tooltip.component.css',
})
export class SicTooltipComponent {
  @Input() text = '';
}
