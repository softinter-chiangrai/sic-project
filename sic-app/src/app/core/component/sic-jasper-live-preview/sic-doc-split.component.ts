// src/app/core/component/sic-jasper-live-preview/sic-doc-split.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, model } from '@angular/core';
import { SicJasperLivePreviewComponent } from './sic-jasper-live-preview.component';
import { DocViewMode } from './sic-doc-view-toggle.component';

/**
 * Wraps a document form: edit (form only) / split (form + live Jasper PDF) / pdf (PDF only); the mode comes from a
 * sic-doc-view-toggle in the form's header via [(mode)]. The form stays in the DOM in every mode, so switching never loses
 * what was typed; no PDF is asked for in edit mode.
 */
@Component({
  selector: 'sic-doc-split',
  standalone: true,
  imports: [CommonModule, SicJasperLivePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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

  mode = model<DocViewMode>('edit');
}
