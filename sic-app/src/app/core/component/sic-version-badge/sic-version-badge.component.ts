import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sic-version-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-version-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicVersionBadgeComponent {
  @Input() version: string | null | undefined = null;
  @Input() status: string | null | undefined = null;
  @Input() isLocked: boolean | null | undefined = false;
  @Input() crCode: string | null | undefined = null;

  get displayVersion(): string {
    if (!this.version) return '';
    const v = String(this.version).trim();
    return /^v/i.test(v) ? v : `v${v}`;
  }

  get isChanged(): boolean {
    return !!this.status && String(this.status).toUpperCase().includes('CHANGE');
  }

  get displayLabel(): string {
    if (this.isLocked) return 'Approved';
    if (this.isChanged) return this.crCode ? `Changed (${this.crCode})` : 'Changed';
    return this.status || 'Draft';
  }

  get badgeClass(): string {
    if (this.isLocked) return 'sic-version-badge--approved';
    if (this.isChanged) return 'sic-version-badge--changed';
    return 'sic-version-badge--draft';
  }
}
