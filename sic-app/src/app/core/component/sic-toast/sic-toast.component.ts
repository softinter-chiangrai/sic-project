import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SicToast, SicToastPosition, SicToastService } from './sic-toast.service';

@Component({
  selector: 'sic-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-toast.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-toast.component.css',
})
export class SicToastComponent {
  @Input() position: SicToastPosition = 'top-right';

  readonly toastService = inject(SicToastService);
  private readonly router = inject(Router);

  @HostBinding('class') get hostClasses() {
    return `sic-toast-host sic-toast--${this.position}`;
  }

  onToastClick(toast: SicToast): void {
    if (toast.onClick) {
      toast.onClick();
    } else if (toast.linkUrl) {
      let url = toast.linkUrl.trim();
      if (!url.startsWith('/feature/') && !url.startsWith('/management/') && !url.startsWith('/tutorial')) {
        url = '/feature' + (url.startsWith('/') ? url : '/' + url);
      }
      this.router.navigateByUrl(url);
    }
    this.toastService.dismiss(toast.id);
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
