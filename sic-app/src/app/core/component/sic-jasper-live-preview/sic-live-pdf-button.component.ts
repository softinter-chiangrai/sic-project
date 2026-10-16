// src/app/core/component/sic-jasper-live-preview/sic-live-pdf-button.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SicJasperLivePreviewComponent } from './sic-jasper-live-preview.component';

/**
 * For forms without a preview pane: a "real PDF" button that opens a panel on the right with the live Jasper PDF of the
 * form (sic-jasper-live-preview). The form stays usable on the left while the panel is open.
 */
@Component({
  selector: 'sic-live-pdf-button',
  standalone: true,
  imports: [CommonModule, TranslateModule, SicJasperLivePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="open.set(!open())"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            [class]="open() ? 'border-[var(--crm-primary)] text-[var(--crm-primary)] bg-[var(--crm-primary)]/10' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-active)]'">
      <i class="bi bi-filetype-pdf"></i> {{ 'LIVE_PDF_TAB_JASPER' | translate }}
    </button>
    @if (open()) {
      <div class="fixed top-16 right-0 bottom-0 z-40 w-full sm:w-[min(640px,48vw)] flex flex-col bg-[var(--sidebar)] border-l border-[var(--border)] shadow-[-8px_0_24px_rgba(0,0,0,0.18)] p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-[var(--text-active)] flex items-center gap-2">
            <i class="bi bi-filetype-pdf text-[var(--crm-primary)]"></i> {{ 'LIVE_PDF_TAB_JASPER' | translate }}
          </span>
          <button type="button" (click)="open.set(false)" class="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)]">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <sic-jasper-live-preview [kind]="kind" [body]="body"></sic-jasper-live-preview>
        </div>
      </div>
    }
  `,
})
export class SicLivePdfButtonComponent {
  @Input({ required: true }) kind!: string;
  @Input() body: unknown;

  open = signal(false);
}
