import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="sic-spinner__ring"></span>`,
  styleUrl: './sic-spinner.component.css',
})
export class SicSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @HostBinding('class.sic-spinner-host') readonly hostClass = true;
  @HostBinding('class.sic-size-sm') get isSm() {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-size-lg') get isLg() {
    return this.size === 'lg';
  }
}
