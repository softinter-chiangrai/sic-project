import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-avatar.component.html',
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
    return this.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  handleError(): void {
    this.errored = true;
  }
}
