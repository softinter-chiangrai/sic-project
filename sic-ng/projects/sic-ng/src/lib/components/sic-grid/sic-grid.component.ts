import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-grid',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-grid.component.css',
})
export class SicGridComponent {
  @Input() cols = 12;
  @Input() gap = 'var(--sic-space-4)';
  /** Breakpoint → column count, e.g. { sm: 1, md: 2, lg: 4 } */
  @Input() colsBreakpoints: Record<'sm' | 'md' | 'lg', number> | null = null;

  @HostBinding('style.display') readonly display = 'grid';
  @HostBinding('style.gap') get gridGap() {
    return this.gap;
  }
  @HostBinding('style.grid-template-columns') get gridCols() {
    return `repeat(${this.cols}, minmax(0, 1fr))`;
  }
  @HostBinding('class.sic-grid--responsive') get responsive() {
    return !!this.colsBreakpoints;
  }
  @HostBinding('style.--sic-grid-cols-sm') get colsSm() {
    return this.colsBreakpoints?.sm ?? this.cols;
  }
  @HostBinding('style.--sic-grid-cols-md') get colsMd() {
    return this.colsBreakpoints?.md ?? this.cols;
  }
  @HostBinding('style.--sic-grid-cols-lg') get colsLg() {
    return this.colsBreakpoints?.lg ?? this.cols;
  }
}
