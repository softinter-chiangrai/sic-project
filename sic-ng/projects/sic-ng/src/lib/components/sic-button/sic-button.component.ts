import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

export type SicButtonVariant = 'solid' | 'outline' | 'ghost';
export type SicButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'sic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-button.component.html',
  styleUrl: './sic-button.component.css',
})
export class SicButtonComponent {
  @Input() variant: SicButtonVariant = 'solid';
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() size: SicButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;

  @HostBinding('class.sic-button-host') readonly hostClass = true;
  @HostBinding('class.sic-button--block') get isBlock() {
    return this.block;
  }
}
