import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardDeadlineItem, DashboardOrgSummary } from '../../../feature/dashboard/dashboard.model';
import { TeamMember } from '../../../feature/bu/rt/burt04/burt04.model';
import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';

export interface RealMemberWorkload {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
  maxCapacity: number;
  status: 'OPTIMAL' | 'BUSY' | 'OVERLOADED';
}

@Component({
  selector: 'app-team-workload-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './team-workload-widget.component.html',
  styleUrl: './team-workload-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamWorkloadWidgetComponent {
  private readonly translate = inject(TranslateService);

  readonly summary = input<DashboardOrgSummary | null>(null);
  readonly members = input<TeamMember[]>([]);
  readonly deadlines = input<DashboardDeadlineItem[]>([]);
  readonly projects = input<PmCustomerProject[]>([]);

  readonly teamMembers = computed<RealMemberWorkload[]>(() => {
    const list = this.members();
    const allDeadlines = this.deadlines();
    const allProjects = this.projects();

    if (!list || list.length === 0) {
      return [];
    }

    return list.map((m) => {
      const name = m.userName || m.userEmail || this.translate.instant('TEAM_WORKLOAD_WIDGET_DEFAULT_MEMBER_NAME');
      const role = m.roleNames?.length ? m.roleNames.join(', ') : this.translate.instant('TEAM_WORKLOAD_WIDGET_DEFAULT_MEMBER_ROLE');

      // Count tasks or projects associated with this user
      const assignedDeadlines = allDeadlines.filter(
        (d) => d.taskName?.toLowerCase().includes(name.toLowerCase())
      ).length;

      const managedProjects = allProjects.filter(
        (p) => p.projectManager && p.projectManager.toLowerCase().includes(name.toLowerCase())
      ).length;

      const activeTasks = Math.max(assignedDeadlines + managedProjects, 0);
      const maxCapacity = 8;
      const status: 'OPTIMAL' | 'BUSY' | 'OVERLOADED' =
        activeTasks > maxCapacity ? 'OVERLOADED' : activeTasks >= 5 ? 'BUSY' : 'OPTIMAL';

      let avatar = 'bi-person-circle';
      const lowerRole = role.toLowerCase();
      if (lowerRole.includes('admin') || lowerRole.includes('ผู้ดูแล')) avatar = 'bi-shield-lock-fill';
      else if (lowerRole.includes('pm') || lowerRole.includes('project') || lowerRole.includes('manager')) avatar = 'bi-kanban-fill';
      else if (lowerRole.includes('dev') || lowerRole.includes('engineer') || lowerRole.includes('โปรแกรม')) avatar = 'bi-code-slash';
      else if (lowerRole.includes('qa') || lowerRole.includes('test')) avatar = 'bi-shield-check';
      else if (lowerRole.includes('sa') || lowerRole.includes('architect') || lowerRole.includes('analyst')) avatar = 'bi-diagram-3';

      return {
        id: m.id || m.userId,
        name,
        role,
        avatar,
        activeTasks,
        maxCapacity,
        status,
      };
    });
  });

  // Calculate resolution efficiency % from 100% Real API data
  readonly resolvedRate = computed<number>(() => {
    const s = this.summary();
    const total = s?.totalBugs || 0;
    const closed = s?.closedBugs || 0;
    if (total === 0) return 100;
    return Math.round((closed / total) * 100);
  });

  getStatusClass(status: string): { bg: string; text: string; label: string } {
    switch (status) {
      case 'OVERLOADED':
        return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', label: this.translate.instant('TEAM_WORKLOAD_WIDGET_STATUS_OVERLOADED') };
      case 'BUSY':
        return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-500', label: this.translate.instant('TEAM_WORKLOAD_WIDGET_STATUS_BUSY') };
      default:
        return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500', label: this.translate.instant('TEAM_WORKLOAD_WIDGET_STATUS_OPTIMAL') };
    }
  }
}
