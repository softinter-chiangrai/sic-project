// src/app/core/component/sic-bulk-export-bar/sic-bulk-export-bar.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type { SicGridPanelComponent } from 'sic-ng';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../services/dialog.service';
import { openPdfWindow } from '../../utils/pdf-window.util';

/**
 * Bar that appears once documents are ticked, in a list grid ([grid], selectable: true) or any card list ([ids] + (cleared)).
 * Like every Jasper print button: a new tab opens at once ("generating..."), then shows the PDF of the selected documents:
 * one as it prints alone, several as one book with a table of contents and running page numbers.
 * POST /api/pm/export/bulk {kind, ids}. Eager change detection on purpose (v22 default is OnPush): it reads the grid's selection.
 */
@Component({
  selector: 'sic-bulk-export-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (count() > 0) {
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3 px-4 py-2.5 rounded-xl border border-[var(--crm-primary)]/40 bg-[var(--crm-primary)]/10 text-sm">
        <span class="font-semibold text-[var(--text-active)] flex items-center gap-2">
          <i class="bi bi-check2-square text-[var(--crm-primary)]"></i>
          {{ 'BULK_EXPORT_SELECTED' | translate: { count: count() } }}
        </span>
        <div class="flex items-center gap-2">
          <button type="button" (click)="print()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--crm-primary)] text-white text-xs font-semibold">
            <i class="bi bi-printer"></i> {{ 'BULK_EXPORT_PRINT' | translate }}
          </button>
          <button type="button" (click)="clear()" class="px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)]">
            {{ 'BULK_EXPORT_CLEAR' | translate }}
          </button>
        </div>
      </div>
    }
  `,
})
export class SicBulkExportBarComponent {
  /** a list grid with selectable: true ... */
  @Input() grid?: SicGridPanelComponent;
  /** ... or the ids ticked in a card list (then handle (cleared)) */
  @Input() ids?: string[] | null;
  /** project, contract, requirement, specification, design-review, change-request, ma-ticket, delivery, user-manual, invoice, test-scenario */
  @Input({ required: true }) kind!: string;
  @Output() readonly cleared = new EventEmitter<void>();

  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private dialog = inject(DialogService);

  count(): number {
    return this.selectedIds().length;
  }

  private selectedIds(): string[] {
    if (this.ids) return this.ids;
    return (this.grid?.selectedRows ?? []).map((r: any) => r.id).filter(Boolean);
  }

  clear(): void {
    this.grid?.selectAllControl.setValue(false);
    this.cleared.emit();
  }

  print(): void {
    const ids = this.selectedIds();
    if (!ids.length) return;
    const pdfWindow = openPdfWindow(); // opened by the click itself, or the browser blocks it
    this.http
      .post(`${environment.apiBaseUrl}/api/pm/export/bulk`, { kind: this.kind, ids }, {
        params: { lang: this.translate.currentLang || 'th' },
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => pdfWindow.show(blob, `${this.kind}-${ids.length}`),
        error: async (err) => {
          pdfWindow.close();
          let message = '';
          try {
            message = JSON.parse(await (err?.error as Blob).text())?.message ?? '';
          } catch {}
          this.dialog.error(this.translate.instant('BULK_EXPORT_FAILED'), message || err?.message || '');
        },
      });
  }
}
