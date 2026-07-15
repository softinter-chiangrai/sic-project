import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, inject } from '@angular/core';
import { SicToastPosition, SicToastService } from './sic-toast.service';

@Component({
  selector: 'sic-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-toast.component.html',
  styleUrl: './sic-toast.component.css',
})
export class SicToastComponent {
  @Input() position: SicToastPosition = 'top-right';

  readonly toastService = inject(SicToastService);

  @HostBinding('class') get hostClasses() {
    return `sic-toast-host sic-toast--${this.position}`;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
