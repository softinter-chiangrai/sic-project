// src/app/core/component/sic-copy-link/sic-copy-link.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SicToastService } from '../sic-toast/sic-toast.service';

@Component({
  selector: 'sic-copy-link',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <button
      type="button"
      (click)="copyLink()"
      class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-active)] cursor-pointer"
      [title]="'COPY_LINK_BUTTON_TITLE' | translate"
    >
      <i class="bi" [class.bi-link-45deg]="!copied()" [class.bi-check-lg]="copied()"></i>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicCopyLinkComponent {
  private readonly toast = inject(SicToastService);
  private readonly translate = inject(TranslateService);
  readonly copied = signal(false);

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copied.set(true);
      this.toast.show(this.translate.instant('COPY_LINK_SUCCESS_MSG'), {
        type: 'success',
        title: this.translate.instant('COPY_LINK_SUCCESS_TITLE'),
      });
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.toast.show(this.translate.instant('COPY_LINK_ERROR_MSG'), {
        type: 'danger',
        title: this.translate.instant('COPY_LINK_ERROR_TITLE'),
      });
    }
  }
}
