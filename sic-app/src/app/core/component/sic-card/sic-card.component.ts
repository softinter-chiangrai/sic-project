import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-card.component.html',
  styleUrl: './sic-card.component.css',
})
export class SicCardComponent {
  @Input() title?: string;
  @Input() bordered = true;
  @Input() elevated = false;

  @HostBinding('class.sic-card-host') readonly hostClass = true;
  @HostBinding('class.sic-card--bordered') get isBordered() {
    return this.bordered;
  }
  @HostBinding('class.sic-card--elevated') get isElevated() {
    return this.elevated;
  }
}
