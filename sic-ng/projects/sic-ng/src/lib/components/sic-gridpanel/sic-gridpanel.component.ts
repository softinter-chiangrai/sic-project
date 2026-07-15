import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export interface SicGridColumn<T = any> {
  field: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string;
}

export type SicSortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'sic-gridpanel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-gridpanel.component.html',
  styleUrl: './sic-gridpanel.component.css',
})
export class SicGridpanelComponent<T = any> {
  @Input() columns: SicGridColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() trackByField?: keyof T & string;
  @Input() loading = false;
  @Input() emptyText = 'No data';

  @Output() rowClick = new EventEmitter<T>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: SicSortDirection }>();

  @HostBinding('class.sic-gridpanel-host') readonly hostClass = true;

  sortField: string | null = null;
  sortDirection: SicSortDirection = null;

  get sortedRows(): T[] {
    if (!this.sortField || !this.sortDirection) {
      return this.rows;
    }

    const field = this.sortField;
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    return [...this.rows].sort((a, b) => {
      const av = a[field as keyof T];
      const bv = b[field as keyof T];
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }

  toggleSort(column: SicGridColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortField !== column.field) {
      this.sortField = column.field;
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortField = null;
      this.sortDirection = null;
    }

    this.sortChange.emit({ field: column.field, direction: this.sortDirection });
  }

  cellValue(row: T, column: SicGridColumn<T>): unknown {
    return row[column.field];
  }

  rowKey(row: T, index: number): unknown {
    return this.trackByField ? row[this.trackByField] : index;
  }
}
