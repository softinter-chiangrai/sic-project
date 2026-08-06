import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'sic-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-dialog.component.html',
  styleUrl: './sic-dialog.component.css',
})
export class SicDialogComponent {
  @Input() open = false;
  @Input() title?: string;
  @Input() disableClose = false;
  @Input() width = '32rem';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  @HostBinding('class.sic-dialog-host') readonly hostClass = true;

  close(): void {
    if (this.disableClose) {
      return;
    }

    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }

  handleBackdropClick(): void {
    this.close();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open) {
      this.close();
    }
  }
}
