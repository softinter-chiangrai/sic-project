import { Component, Input } from '@angular/core';

@Component({
  selector: 'sic-button',
  standalone: true,
  imports: [],
  templateUrl: './sic-button.html',
  styleUrl: './sic-button.css',
})
export class SicButton {
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'ghost'
    | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() iconOnly = false;

  get buttonClass(): string {
    const classes = [
      'sic-button',
      `sic-button--${this.variant}`,
      `sic-button--${this.size}`,
    ];

    if (this.fullWidth) {
      classes.push('sic-button--full-width');
    }

    if (this.iconOnly) {
      classes.push('sic-button--icon-only');
    }

    return classes.join(' ');
  }
}
