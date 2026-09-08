import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'sic-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-pagination.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sic-pagination.component.css',
})
export class SicPaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  /** How many numbered page buttons to show around the current page */
  @Input() windowSize = 5;

  @Output() pageChange = new EventEmitter<number>();

  jumpValue: number | null = null;

  get totalPages(): number {
    return Math.max(Math.ceil(this.totalItems / (this.pageSize || 1)), 1);
  }

  get hasPrevious(): boolean {
    return this.currentPage > 1;
  }

  get hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const half = Math.floor(this.windowSize / 2);
    let start = Math.max(this.currentPage - half, 1);
    let end = Math.min(start + this.windowSize - 1, total);
    start = Math.max(Math.min(start, end - this.windowSize + 1), 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }

  goToPage(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages);
    if (clamped !== this.currentPage) {
      this.pageChange.emit(clamped);
    }
  }

  onJumpSubmit(): void {
    if (this.jumpValue == null || Number.isNaN(this.jumpValue)) {
      return;
    }
    this.goToPage(Math.trunc(this.jumpValue));
    this.jumpValue = null;
  }
}
