import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sic-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-container.html',
  styleUrl: './sic-container.css',
})
export class SicContainer {
  @Input() margin?: string | number = 15;
  @Input() customClass?: string;

  get containerStyle(): { [key: string]: string | number } {
    const style: { [key: string]: string | number } = {};

    if (this.margin !== undefined) {
      style['margin'] = this.formatValue(this.margin);
    }

    return style;
  }

  private formatValue(value: string | number): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }
}
