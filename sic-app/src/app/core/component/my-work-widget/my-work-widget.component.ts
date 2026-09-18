import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DesignReview } from '../../../feature/pm/dt/pmdt09/pmdt09.model';
import { Approval } from '../../../feature/pm/dt/pmdt03/approval.model';
import { DashboardDeadlineItem } from '../../../feature/dashboard/dashboard.model';
import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';

export type WorkTab = 'ASSIGNED' | 'REVIEWS' | 'APPROVALS' | 'DEADLINES';

export interface MyWorkItem {
  id: string;
  code: string;
  title: string;
  project?: string;
  type: 'TASK' | 'REVIEW' | 'APPROVAL' | 'DEADLINE';
  status: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  link: string;
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-my-work-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-work-widget.component.html',
  styleUrl: './my-work-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkWidgetComponent {
  readonly projects = input<PmCustomerProject[]>([]);
  readonly designReviews = input<DesignReview[]>([]);
  readonly approvals = input<Approval[]>([]);
  readonly deadlines = input<DashboardDeadlineItem[]>([]);
  readonly activeTab = signal<WorkTab>('ASSIGNED');

  readonly selectItem = output<MyWorkItem>();

  readonly allWorkItems = computed<MyWorkItem[]>(() => {
    const list: MyWorkItem[] = [];

    // 1. Deadlines / Assigned Tasks
    for (const d of this.deadlines()) {
      list.push({
        id: d.taskId,
        code: d.taskCode || 'TASK',
        title: d.taskName,
        project: d.projectName || undefined,
        type: 'TASK',
        status: d.status || (d.overdue ? 'OVERDUE' : 'IN_PROGRESS'),
        priority: d.overdue ? 'CRITICAL' : d.daysLeft <= 2 ? 'HIGH' : 'MEDIUM',
        dueDate: d.endDate,
        link: '/feature/pm/task-board',
        queryParams: d.projectId ? { projectId: d.projectId } : undefined,
      });
    }

    return list;
  });

  readonly reviewItems = computed<MyWorkItem[]>(() => {
    return this.designReviews().map((r, idx) => ({
      id: r.id || String(idx),
      code: r.reviewCode || `REV-${idx + 1}`,
      title: r.title || 'Design Review Request',
      project: r.projectName || undefined,
      type: 'REVIEW' as const,
      status: r.status || 'PENDING',
      priority: r.status === 'REJECTED' || r.status === 'REVISION' ? 'HIGH' : 'MEDIUM',
      link: '/feature/pm/design-review',
      queryParams: r.id ? { id: r.id } : undefined,
    }));
  });

  readonly approvalItems = computed<MyWorkItem[]>(() => {
    return this.approvals().map((a, idx) => ({
      id: a.id || String(idx),
      code: a.documentCode || `APP-${idx + 1}`,
      title: a.documentTitle || a.documentType || 'รายการขออนุมัติ',
      project: a.projectName || undefined,
      type: 'APPROVAL' as const,
      status: a.status || 'PENDING',
      priority: 'CRITICAL' as const,
      link: '/feature/pm/approval',
      queryParams: a.id ? { id: a.id } : undefined,
    }));
  });

  readonly filteredItems = computed<MyWorkItem[]>(() => {
    const tab = this.activeTab();
    switch (tab) {
      case 'ASSIGNED':
        return this.allWorkItems();
      case 'REVIEWS':
        return this.reviewItems();
      case 'APPROVALS':
        return this.approvalItems();
      case 'DEADLINES':
        return this.allWorkItems().filter((item) => item.priority === 'CRITICAL' || item.priority === 'HIGH');
      default:
        return this.allWorkItems();
    }
  });

  setTab(tab: WorkTab): void {
    this.activeTab.set(tab);
  }

  getPriorityBadge(priority: string): { bg: string; text: string; icon: string; label: string } {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-500',
          icon: 'bi-exclamation-octagon-fill',
          label: 'เร่งด่วนสูงสุด',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10 border-orange-500/20',
          text: 'text-orange-500',
          icon: 'bi-arrow-up-circle-fill',
          label: 'สำคัญสูง',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-500',
          icon: 'bi-dash-circle-fill',
          label: 'ปกติ',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-500',
          icon: 'bi-arrow-down-circle-fill',
          label: 'ทั่วไป',
        };
    }
  }

  getStatusBadge(status: string): { bg: string; text: string } {
    const s = (status || '').toUpperCase();
    if (s.includes('DONE') || s.includes('COMPLETED') || s.includes('APPROVED')) {
      return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500' };
    }
    if (s.includes('PROGRESS') || s.includes('ACTIVE') || s.includes('REVIEW')) {
      return { bg: 'bg-[var(--crm-primary)]/10 border-[var(--crm-primary)]/20', text: 'text-[var(--crm-primary)]' };
    }
    if (s.includes('REJECT') || s.includes('OVERDUE') || s.includes('BLOCK')) {
      return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500' };
    }
    return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-500' };
  }
}
