import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Approval } from '../../../feature/pm/dt/pmdt03/approval.model';
import { SicDatePipe } from '../../pipes/sic-date.pipe';

@Component({
  selector: 'app-pending-approval-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SicDatePipe],
  templateUrl: './pending-approval-widget.component.html',
  styleUrl: './pending-approval-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingApprovalWidgetComponent {
  readonly approvals = input<Approval[]>([]);
  readonly totalPending = input<number>(0);

  readonly pendingList = computed(() => {
    return this.approvals().slice(0, 5);
  });

  readonly count = computed(() => {
    const total = this.totalPending();
    if (total && total > 0) return total;
    return this.approvals().length;
  });

  getDocumentIcon(type: string): string {
    const map: Record<string, string> = {
      REQUIREMENT: 'bi-clipboard-check',
      SPECIFICATION: 'bi-file-text',
      DIAGRAM: 'bi-diagram-3',
      DFD: 'bi-diagram-3',
      ER: 'bi-table',
      DESIGN_REVIEW: 'bi-palette2',
      CHANGE_REQUEST: 'bi-arrow-left-right',
      TEST_PLAN: 'bi-clipboard-data',
      UAT: 'bi-check2-all',
      DELIVERY: 'bi-box-seam',
      INVOICE: 'bi-receipt',
      MA_RENEWAL: 'bi-clock-history',
      CONTRACT: 'bi-file-earmark-text',
      PROJECT: 'bi-briefcase',
    };
    return map[type] || 'bi-file-earmark-check';
  }

  getDocumentTypeBadge(type: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      REQUIREMENT: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
      SPECIFICATION: { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
      DESIGN_REVIEW: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
      DELIVERY: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
      INVOICE: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
      CONTRACT: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
      CHANGE_REQUEST: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
    };
    return map[type] || { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-600 dark:text-slate-400' };
  }
}
