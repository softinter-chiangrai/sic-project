// src/app/core/component/sic-table-actions/sic-table-actions.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'sic-table-actions',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex items-center justify-center gap-1">
            @if (showView) {
                <button
                    type="button"
                    (click)="onView.emit()"
                    [disabled]="disabled"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    [title]="viewTitle">
                    <i class="bi bi-eye"></i>
                </button>
            }

            @if (showPrint) {
                <button
                    type="button"
                    (click)="onPrint.emit()"
                    [disabled]="disabled"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    [title]="printTitle">
                    <i class="bi bi-printer"></i>
                </button>
            }

            @if (showEdit) {
                <button
                    type="button"
                    (click)="onEdit.emit()"
                    [disabled]="disabled"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    [title]="editTitle">
                    <i class="bi bi-pencil"></i>
                </button>
            }

            @if (showDelete) {
                <button
                    type="button"
                    (click)="onDelete.emit()"
                    [disabled]="disabled"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    [title]="deleteTitle">
                    <i class="bi bi-trash"></i>
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SicTableActionsComponent {
    @Input() showView = true;
    @Input() showPrint = true;
    @Input() showEdit = true;
    @Input() showDelete = true;

    @Input() viewTitle = 'ดูข้อมูล';
    @Input() printTitle = 'พิมพ์เอกสาร';
    @Input() editTitle = 'แก้ไข';
    @Input() deleteTitle = 'ลบ';

    @Input() disabled = false;

    @Output() onView = new EventEmitter<void>();
    @Output() onPrint = new EventEmitter<void>();
    @Output() onEdit = new EventEmitter<void>();
    @Output() onDelete = new EventEmitter<void>();
}
