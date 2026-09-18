// src/app/core/component/sic-drawer/sic-drawer.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type SicDrawerSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'sic-drawer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sic-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicDrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: SicDrawerSize = 'md';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  readonly sizeClass: Record<SicDrawerSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }
}
