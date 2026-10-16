// src/app/core/component/sic-jasper-live-preview/sic-doc-view-toggle.component.ts
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type DocViewMode = 'edit' | 'split' | 'pdf';

/** Edit / split / PDF switch for a form header, same look as the requirement form's; pairs with sic-doc-split via [(mode)]. */
@Component({
  selector: 'sic-doc-view-toggle',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: flex; gap: 0.25rem; background: var(--bg); border-radius: 0.5rem; padding: 0.25rem; border: 1px solid var(--border); }
    button { padding: 0.25rem 0.75rem; border: none; border-radius: 0.375rem; background: transparent; color: var(--text-muted);
             font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
    button.active { background: var(--crm-primary); color: white; }
    button:hover:not(.active) { background: var(--sidebar-hover); }
  `,
  template: `
    <button type="button" (click)="mode.set('edit')" [class.active]="mode() === 'edit'" [title]="'DOC_VIEW_EDIT' | translate"><i class="bi bi-pencil"></i></button>
    <button type="button" (click)="mode.set('split')" [class.active]="mode() === 'split'" [title]="'DOC_VIEW_SPLIT' | translate"><i class="bi bi-layout-split"></i></button>
    <button type="button" (click)="mode.set('pdf')" [class.active]="mode() === 'pdf'" [title]="'DOC_VIEW_PDF' | translate"><i class="bi bi-eye"></i></button>
  `,
})
export class SicDocViewToggleComponent {
  mode = model<DocViewMode>('edit');
}
