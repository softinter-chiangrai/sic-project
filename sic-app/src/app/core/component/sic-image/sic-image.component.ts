import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-image.component.html',
  styleUrl: './sic-image.component.css',
})
export class SicImageComponent {
  @Input({ required: true }) src!: string;
  @Input() alt = '';
  @Input() fallback = '';
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'none';

  @HostBinding('class.sic-image-host') readonly hostClass = true;

  errored = false;

  get resolvedSrc(): string {
    return this.errored && this.fallback ? this.fallback : this.src;
  }

  handleError(): void {
    this.errored = true;
  }
}
