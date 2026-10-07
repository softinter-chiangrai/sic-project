// src/app/core/component/sic-cr-history-panel/sic-cr-history-panel.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { PaginationResponse } from '../../model/pagination.model';

interface CrHistoryRow {
  id: string;
  crCode: string;
  title: string;
  targetVersion?: string;
  status: string;
  createdDate: string;
}

// ประวัติ Change Request ของเอกสารหนึ่งฉบับ (กรองด้วย targetType + targetId) — ซ่อนตัวเองเมื่อไม่มี CR
@Component({
  selector: 'sic-cr-history-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (rows().length > 0) {
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--sidebar)] p-4">
        <h3 class="text-sm font-bold text-[var(--text-active)] flex items-center gap-2 mb-3">
          <i class="bi bi-arrow-repeat text-[var(--crm-primary)]"></i>
          {{ 'CR_HISTORY_TITLE' | translate }} ({{ rows().length }})
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[var(--text-muted)]">
              <tr>
                <th class="py-1.5 pr-3 font-semibold">{{ 'PMDT06_COL_CODE' | translate }}</th>
                <th class="py-1.5 pr-3 font-semibold">{{ 'PMDT06_COL_TITLE' | translate }}</th>
                <th class="py-1.5 pr-3 font-semibold">{{ 'PMDT06_COL_TARGET_VERSION' | translate }}</th>
                <th class="py-1.5 pr-3 font-semibold">{{ 'CR_HISTORY_COL_DATE' | translate }}</th>
                <th class="py-1.5 font-semibold">{{ 'PMDT06_COL_STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.id) {
                <tr class="border-t border-[var(--border)] cursor-pointer hover:bg-[var(--sidebar-hover)]"
                    [routerLink]="['/feature/pm/change-request', r.id, 'view']">
                  <td class="py-2 pr-3 font-mono font-semibold text-[var(--text-active)]">{{ r.crCode }}</td>
                  <td class="py-2 pr-3 text-[var(--text)]">{{ r.title }}</td>
                  <td class="py-2 pr-3 text-[var(--text)]">{{ r.targetVersion || '-' }}</td>
                  <td class="py-2 pr-3 text-[var(--text)]">{{ r.createdDate | date: 'dd/MM/yyyy' }}</td>
                  <td class="py-2 text-[var(--text)]">{{ statusLabel(r.status) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class SicCrHistoryPanelComponent implements OnChanges {
  @Input({ required: true }) targetType!: string;
  @Input() targetId?: string | null;

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  rows = signal<CrHistoryRow[]>([]);

  ngOnChanges(): void {
    if (!this.targetType || !this.targetId) {
      this.rows.set([]);
      return;
    }
    const params = new HttpParams().set('targetType', this.targetType).set('targetId', this.targetId).set('size', 100);
    this.http
      .get<PaginationResponse<CrHistoryRow>>(`${environment.apiBaseUrl}/api/pm/change-requests`, { params })
      .subscribe({ next: (res) => this.rows.set(res.data ?? []), error: () => this.rows.set([]) });
  }

  statusLabel(status: string): string {
    const key = 'PMDT06_STATUS_' + (status || '').toUpperCase();
    const t = this.translate.instant(key);
    return t === key ? status : t;
  }
}
