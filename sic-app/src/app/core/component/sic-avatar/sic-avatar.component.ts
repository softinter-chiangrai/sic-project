import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sic-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-avatar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-avatar.component.css',
})
export class SicAvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @HostBinding('class.sic-avatar-host') readonly hostClass = true;
  @HostBinding('class.sic-size-sm') get isSm() {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-size-lg') get isLg() {
    return this.size === 'lg';
  }

  errored = false;

  get initials(): string {
    if (!this.name || this.name.trim() === '' || this.name === 'undefined' || this.name === 'null') {
      return '?';
    }
    const cleanName = this.name.trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const second = parts[1][0] || '';
      return (first + second).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  handleError(): void {
    this.errored = true;
  }
}
