import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-progress-bar.component.html',
  styleUrl: './sic-progress-bar.component.css',
})
export class SicProgressBarComponent {
  @Input() value = 0;
  @Input() indeterminate = false;
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' = 'primary';

  @HostBinding('class.sic-progress-bar-host') readonly hostClass = true;
  @HostBinding('attr.role') readonly role = 'progressbar';
  @HostBinding('attr.aria-valuenow') get ariaValueNow() {
    return this.indeterminate ? null : this.value;
  }

  get clampedValue(): number {
    return Math.min(100, Math.max(0, this.value));
  }
}
