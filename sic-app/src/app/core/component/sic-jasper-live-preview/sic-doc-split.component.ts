// src/app/core/component/sic-jasper-live-preview/sic-doc-split.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SicJasperLivePreviewComponent } from './sic-jasper-live-preview.component';

type Mode = 'edit' | 'split' | 'pdf';

/**
 * Wraps a document form: edit (form only) / split (form + live Jasper PDF) / PDF only. The form stays in the DOM in every
 * mode, so switching never loses what was typed. Starts in edit: wide forms (tables) keep their full width until asked.
 */
@Component({
  selector: 'sic-doc-split',
  standalone: true,
  imports: [CommonModule, TranslateModule, SicJasperLivePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-end mb-3">
      <div class="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] text-xs">
        @for (m of modes; track m.mode) {
          <button type="button" (click)="mode.set(m.mode)" [title]="m.label | translate"
                  class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                  [class]="mode() === m.mode ? 'bg-[var(--crm-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-active)]'">
            <i class="bi" [class]="m.icon"></i> <span class="hidden sm:inline">{{ m.label | translate }}</span>
          </button>
        }
      </div>
    </div>
    <div class="grid gap-4" [ngClass]="{ 'lg:grid-cols-2': mode() === 'split' }">
      <div class="min-w-0" [class.hidden]="mode() === 'pdf'">
        <ng-content />
      </div>
      @if (mode() !== 'edit') {
        <div class="min-w-0 lg:sticky lg:top-4 lg:self-start h-[calc(100vh-7rem)]">
          <sic-jasper-live-preview [kind]="kind" [body]="body"></sic-jasper-live-preview>
        </div>
      }
    </div>
  `,
})
export class SicDocSplitComponent {
  /** live-preview kind: contract, design-review, change-request, ma-ticket, delivery, user-manual, invoice, ... */
  @Input({ required: true }) kind!: string;
  /** the form as it would be saved */
  @Input() body: unknown;

  mode = signal<Mode>('edit');
  readonly modes: { mode: Mode; icon: string; label: string }[] = [
    { mode: 'edit', icon: 'bi-pencil', label: 'DOC_VIEW_EDIT' },
    { mode: 'split', icon: 'bi-layout-split', label: 'DOC_VIEW_SPLIT' },
    { mode: 'pdf', icon: 'bi-filetype-pdf', label: 'DOC_VIEW_PDF' },
  ];
}
