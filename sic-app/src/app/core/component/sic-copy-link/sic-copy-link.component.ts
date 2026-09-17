// src/app/core/component/sic-copy-link/sic-copy-link.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SicToastService } from '../sic-toast/sic-toast.service';

@Component({
  selector: 'sic-copy-link',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="copyLink()"
      class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-active)] cursor-pointer"
      title="คัดลอกลิงก์หน้านี้"
    >
      <i class="bi" [class.bi-link-45deg]="!copied()" [class.bi-check-lg]="copied()"></i>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicCopyLinkComponent {
  private readonly toast = inject(SicToastService);
  readonly copied = signal(false);

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copied.set(true);
      this.toast.show('วางลิงก์เพื่อแชร์หน้านี้ได้เลย', { type: 'success', title: 'คัดลอกลิงก์แล้ว' });
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.toast.show('ไม่สามารถเข้าถึง Clipboard ได้', { type: 'danger', title: 'คัดลอกไม่สำเร็จ' });
    }
  }
}
