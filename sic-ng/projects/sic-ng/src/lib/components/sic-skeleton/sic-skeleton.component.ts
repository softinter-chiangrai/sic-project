import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styleUrl: './sic-skeleton.component.css',
})
export class SicSkeletonComponent {
  @Input() variant: 'text' | 'circle' | 'rect' = 'text';
  @Input() width = '100%';
  @Input() height?: string;

  @HostBinding('class') get hostClasses() {
    return `sic-skeleton-host sic-skeleton--${this.variant}`;
  }
  @HostBinding('style.width') get hostWidth() {
    return this.width;
  }
  @HostBinding('style.height') get hostHeight() {
    return this.height ?? (this.variant === 'text' ? '1em' : this.variant === 'circle' ? this.width : '6rem');
  }
}
