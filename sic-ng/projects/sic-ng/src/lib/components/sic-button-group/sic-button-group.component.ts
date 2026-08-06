import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-button-group',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content select="sic-button"></ng-content>`,
  styleUrl: './sic-button-group.component.css',
})
export class SicButtonGroupComponent {
  @Input() attached = false;
  @Input() direction: 'row' | 'column' = 'row';

  @HostBinding('class.sic-button-group-host') readonly hostClass = true;
  @HostBinding('class.sic-button-group--attached') get isAttached() {
    return this.attached;
  }
  @HostBinding('class.sic-button-group--column') get isColumn() {
    return this.direction === 'column';
  }
}
