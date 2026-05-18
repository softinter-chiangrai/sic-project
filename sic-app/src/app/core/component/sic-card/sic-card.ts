import { CommonModule } from '@angular/common';
import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'sic-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-card.html',
  styleUrl: './sic-card.css',
})
export class SicCard {
  @Input() padding: string = '1.5rem';
  @Input() shadow: boolean = true;
  @Input() rounded: boolean = true;

  @HostBinding('class.sic-card-host') readonly hostClass = true;

  get cardClass(): string {
    return [
      'sic-card',
      this.shadow ? 'sic-card--shadow' : '',
      this.rounded ? 'sic-card--rounded' : '',
    ].filter(Boolean).join(' ');
  }

  get cardStyle(): Record<string, string> {
    return {
      padding: this.padding,
    };
  }
}
