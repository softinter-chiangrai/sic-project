import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-flex',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-flex.component.css',
})
export class SicFlexComponent {
  @Input() direction: 'row' | 'column' | 'row-reverse' | 'column-reverse' = 'row';
  @Input() align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' = 'stretch';
  @Input() justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start';
  @Input() wrap: 'nowrap' | 'wrap' | 'wrap-reverse' = 'nowrap';
  @Input() gap = '0';

  @HostBinding('style.display') readonly display = 'flex';
  @HostBinding('style.flex-direction') get flexDirection() {
    return this.direction;
  }
  @HostBinding('style.align-items') get alignItems() {
    const map = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch', baseline: 'baseline' };
    return map[this.align];
  }
  @HostBinding('style.justify-content') get justifyContent() {
    const map = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };
    return map[this.justify];
  }
  @HostBinding('style.flex-wrap') get flexWrap() {
    return this.wrap;
  }
  @HostBinding('style.gap') get flexGap() {
    return this.gap;
  }
}
