import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  SicCalendarTimelineComponent,
  SicCalendarTimelineRow,
  SicAvatarComponent,
} from 'sic-ng';

import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';
import { Pmdt02Service } from '../../../feature/pm/dt/pmdt02/pmdt02.service';
import type { PhaseResponse } from '../../../feature/pm/dt/pmdt02/pmdt02.model';
import type { MilestoneResponse } from '../../../feature/pm/dt/pmdt02/pmdt02A/pmdt02A.model';
import type { WorkPackageResponse } from '../../../feature/pm/dt/pmdt02/pmdt02B/pmdt02B.model';
import type { TaskResponse } from '../../../feature/pm/dt/pmdt02/pmdt02C/pmdt02C.model';
import dayjs from '../../dayjs';
import type { Dayjs } from 'dayjs';

export interface PortfolioRowData {
  type: 'customer' | 'project' | 'phase' | 'milestone' | 'workpackage' | 'task';
  id: string;
  title: string;
  level: number; // 0 = Customer, 1 = Project, 2 = Phase, 3 = Milestone, 4 = WorkPackage, 5 = Task
  parentId?: string;
  hasChildren: boolean;
  color: string;
  icon?: string;
  projectCode?: string;
  status?: string;
  projectManager?: string;
  budgetManday?: number;
  usedManday?: number;
  projectCount?: number;
  startDate?: string;
  plannedEndDate?: string;
  progressPercent?: number;
  assignedTo?: string;
  assignees?: any[];
  projectId?: string;
  phaseId?: string;
  milestoneId?: string;
  workPackageId?: string;
}

export type TimelineViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-portfolio-gantt-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    SicCalendarTimelineComponent,
    SicAvatarComponent,
  ],
  templateUrl: './portfolio-gantt-widget.component.html',
  styleUrl: './portfolio-gantt-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGanttWidgetComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly pmdt02Service = inject(Pmdt02Service);

  readonly projects = input<PmCustomerProject[]>([]);

  // Filter & Search Controls
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('ALL');
  readonly customerFilter = signal<string>('ALL');
  readonly viewMode = signal<TimelineViewMode>('month');

  // Hierarchy State: Set of Row IDs that are expanded
  readonly expandedTimelineRowIds = signal<Set<string>>(new Set());

  // Store phases for each project
  readonly projectPhasesMap = signal<Map<string, PhaseResponse[]>>(new Map());
  readonly isLoadingPhases = signal<boolean>(false);

  constructor() {
    effect(() => {
      const projs = this.projects();
      if (!projs || projs.length === 0) {
        this.projectPhasesMap.set(new Map());
        return;
      }

      const requests = projs.map((p) =>
        this.pmdt02Service.getPhases(p.id).pipe(
          map((phases) => ({ projectId: p.id, phases: phases || [] })),
          catchError(() => of({ projectId: p.id, phases: [] as PhaseResponse[] }))
        )
      );

      this.isLoadingPhases.set(true);
      forkJoin(requests).subscribe((results) => {
        const map = new Map<string, PhaseResponse[]>();
        results.forEach((r) => {
          map.set(r.projectId, r.phases);
        });
        this.projectPhasesMap.set(map);
        this.isLoadingPhases.set(false);

        // Auto expand customer and project rows on initial load
        if (this.expandedTimelineRowIds().size === 0) {
          const initial = new Set<string>();
          this.allTimelineItems().forEach((item) => {
            if (item.data?.level === 0 || item.data?.level === 1) {
              initial.add(String(item.id));
            }
          });
          this.expandedTimelineRowIds.set(initial);
        }
      });
    });
  }

  // Quick stats computed
  readonly totalCustomers = computed(() => {
    const set = new Set<string>();
    this.projects().forEach((p) => {
      const c = p.customerName?.trim() || 'General';
      set.add(c);
    });
    return set.size;
  });

  readonly customerList = computed(() => {
    const map = new Map<string, string>();
    this.projects().forEach((p) => {
      const name = p.customerName?.trim() || 'General';
      const id = p.customerId || name;
      if (!map.has(id)) {
        map.set(id, name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });

  readonly stats = computed(() => {
    const projs = this.projects();
    const today = dayjs();
    let active = 0;
    let delayed = 0;
    let completed = 0;

    projs.forEach((p) => {
      const s = (p.status || '').toUpperCase();
      const isDone = s === 'COMPLETED' || s === 'CLOSED' || s === 'DONE';
      if (isDone) {
        completed++;
      } else {
        active++;
        const end = p.plannedEndDate ? dayjs(p.plannedEndDate) : null;
        if (s === 'DELAYED' || (end && today.isAfter(end, 'day'))) {
          delayed++;
        }
      }
    });

    return {
      total: projs.length,
      active,
      delayed,
      completed,
    };
  });

  // Calculate project progress %
  calcProgress(proj: PmCustomerProject): number {
    if (proj.budgetManday && proj.budgetManday > 0) {
      const pct = Math.round(((proj.usedManday || 0) / proj.budgetManday) * 100);
      return Math.min(100, Math.max(0, pct));
    }
    const s = (proj.status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'CLOSED' || s === 'DONE') return 100;
    if (s === 'IN_PROGRESS' || s === 'ACTIVE') return 50;
    if (s === 'PLANNING' || s === 'DRAFT') return 15;
    return 0;
  }

  calcTaskProgress(task: TaskResponse): number {
    const status = (task.status || '').toLowerCase();
    if (status === 'done' || status === 'closed' || status === 'completed') return 100;
    if (status === 'in progress' || status === 'waiting review' || status === 'waiting fix' || status === 'review') return 50;
    return 0;
  }

  calcWpProgress(wp: WorkPackageResponse): number {
    if (!wp.tasks || wp.tasks.length === 0) {
      const s = (wp.status || '').toLowerCase();
      return s === 'done' || s === 'completed' ? 100 : s === 'in progress' ? 50 : 0;
    }
    const sum = wp.tasks.reduce((acc, t) => acc + this.calcTaskProgress(t), 0);
    return Math.round(sum / wp.tasks.length);
  }

  // Determine Project Bar Color
  getProjectColor(proj: PmCustomerProject): string {
    const s = (proj.status || '').toUpperCase();
    const isDone = s === 'COMPLETED' || s === 'CLOSED' || s === 'DONE';
    if (isDone) return '#10b981'; // Green

    const end = proj.plannedEndDate ? dayjs(proj.plannedEndDate) : null;
    const isDelayed = s === 'DELAYED' || (end && dayjs().isAfter(end, 'day'));
    if (isDelayed) return '#ef4444'; // Red

    if (s === 'PLANNING' || s === 'DRAFT') return '#f59e0b'; // Amber

    return '#3b82f6'; // Blue (In Progress / Default)
  }

  getTaskColor(task: TaskResponse): string {
    if (task.color) return task.color;
    const s = (task.status || '').toLowerCase();
    if (s === 'done' || s === 'closed' || s === 'completed') return '#10b981';
    if (s === 'in progress') return '#3b82f6';
    if (s === 'waiting review') return '#06b6d4';
    if (s === 'waiting fix') return '#f59e0b';
    if (s === 'blocked') return '#ef4444';
    return '#8b5cf6';
  }

  // All grouped timeline rows (Customer -> Project -> Phase -> Milestone -> Work Package -> Task)
  readonly allTimelineItems = computed<SicCalendarTimelineRow<PortfolioRowData>[]>(() => {
    const allProjects = this.projects();
    if (!allProjects || allProjects.length === 0) return [];

    const search = this.searchQuery().trim().toLowerCase();
    const statusF = this.statusFilter();
    const custF = this.customerFilter();
    const today = dayjs();
    const phasesMap = this.projectPhasesMap();

    // Filter projects
    const filtered = allProjects.filter((p) => {
      // Customer filter
      if (custF !== 'ALL') {
        const cId = p.customerId || p.customerName?.trim() || 'General';
        if (cId !== custF && p.customerName !== custF) return false;
      }

      // Status filter
      if (statusF !== 'ALL') {
        const s = (p.status || '').toUpperCase();
        const isDone = s === 'COMPLETED' || s === 'CLOSED' || s === 'DONE';
        const end = p.plannedEndDate ? dayjs(p.plannedEndDate) : null;
        const isDelayed = s === 'DELAYED' || (!isDone && end && today.isAfter(end, 'day'));

        if (statusF === 'ACTIVE' && isDone) return false;
        if (statusF === 'DELAYED' && !isDelayed) return false;
        if (statusF === 'COMPLETED' && !isDone) return false;
      }

      // Search query
      if (search) {
        const matchesName = (p.projectName || '').toLowerCase().includes(search);
        const matchesCode = (p.projectCode || '').toLowerCase().includes(search);
        const matchesCust = (p.customerName || '').toLowerCase().includes(search);
        const matchesPm = (p.projectManager || '').toLowerCase().includes(search);
        if (!matchesName && !matchesCode && !matchesCust && !matchesPm) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) return [];

    // Group by customer
    const grouped = new Map<string, { customerName: string; customerId: string; projects: PmCustomerProject[] }>();

    filtered.forEach((p) => {
      const cName = p.customerName?.trim() || 'General Customer';
      const cId = p.customerId?.trim() || cName;
      if (!grouped.has(cId)) {
        grouped.set(cId, { customerName: cName, customerId: cId, projects: [] });
      }
      grouped.get(cId)!.projects.push(p);
    });

    const rows: SicCalendarTimelineRow<PortfolioRowData>[] = [];

    grouped.forEach(({ customerName, customerId, projects }) => {
      const custRowId = `cust-${customerId}`;

      // Calculate boundary dates for customer
      let earliestStart: Dayjs | null = null;
      let latestEnd: Dayjs | null = null;
      let totalProgress = 0;

      for (const p of projects) {
        const pStart = p.startDate ? dayjs(p.startDate) : null;
        const pEnd = p.plannedEndDate ? dayjs(p.plannedEndDate) : p.actualEndDate ? dayjs(p.actualEndDate) : null;

        if (pStart && pStart.isValid()) {
          if (!earliestStart || pStart.isBefore(earliestStart)) earliestStart = pStart;
        }
        if (pEnd && pEnd.isValid()) {
          if (!latestEnd || pEnd.isAfter(latestEnd)) latestEnd = pEnd;
        }
        totalProgress += this.calcProgress(p);
      }

      const avgProgress = Math.round(totalProgress / (projects.length || 1));
      const validStart = earliestStart ? earliestStart.format('YYYY-MM-DD') : dayjs().startOf('year').format('YYYY-MM-DD');
      const validEnd = latestEnd ? latestEnd.format('YYYY-MM-DD') : dayjs().add(6, 'month').format('YYYY-MM-DD');

      // 1. Customer Parent Row (Level 0)
      rows.push({
        id: custRowId,
        label: customerName,
        progress: avgProgress,
        phases: [
          {
            id: `phase-${custRowId}`,
            label: `${customerName} (${projects.length})`,
            start: validStart,
            end: validEnd,
            color: '#6366f1', // Indigo for Customer Summary Bar
          },
        ],
        data: {
          type: 'customer',
          id: customerId,
          title: customerName,
          level: 0,
          hasChildren: true,
          color: '#6366f1',
          projectCount: projects.length,
          startDate: validStart,
          plannedEndDate: validEnd,
          progressPercent: avgProgress,
        },
      });

      // 2. Projects (Level 1)
      projects.forEach((p) => {
        const projRowId = `proj-${p.id}`;
        const pStart = p.startDate && dayjs(p.startDate).isValid()
          ? dayjs(p.startDate).format('YYYY-MM-DD')
          : validStart;
        const pEnd = p.plannedEndDate && dayjs(p.plannedEndDate).isValid()
          ? dayjs(p.plannedEndDate).format('YYYY-MM-DD')
          : dayjs(pStart).add(30, 'day').format('YYYY-MM-DD');

        const color = this.getProjectColor(p);
        const progress = this.calcProgress(p);
        const projectPhases = phasesMap.get(p.id) || [];
        const hasPhases = projectPhases.length > 0;

        rows.push({
          id: projRowId,
          label: `${p.projectCode ? '[' + p.projectCode + '] ' : ''}${p.projectName}`,
          progress: progress,
          phases: [
            {
              id: `phase-${projRowId}`,
              label: p.projectName,
              start: pStart,
              end: pEnd,
              color: color,
            },
          ],
          data: {
            type: 'project',
            id: p.id,
            projectId: p.id,
            projectCode: p.projectCode,
            title: p.projectName,
            level: 1,
            parentId: custRowId,
            hasChildren: hasPhases,
            color: color,
            status: p.status,
            projectManager: p.projectManager,
            budgetManday: p.budgetManday,
            usedManday: p.usedManday,
            startDate: pStart,
            plannedEndDate: pEnd,
            progressPercent: progress,
          },
        });

        // 3. Phases (Level 2)
        projectPhases.forEach((ph) => {
          const phRowId = `phase-${ph.id}`;
          const phStart = ph.startDate && dayjs(ph.startDate).isValid() ? dayjs(ph.startDate).format('YYYY-MM-DD') : pStart;
          const phEnd = ph.endDate && dayjs(ph.endDate).isValid() ? dayjs(ph.endDate).format('YYYY-MM-DD') : phStart;
          const phColor = ph.color || '#0284c7';
          const milestones = ph.milestones || [];
          const hasMilestones = milestones.length > 0;

          rows.push({
            id: phRowId,
            label: ph.phaseName,
            progress: ph.progress || 0,
            phases: [
              {
                id: `bar-${phRowId}`,
                label: `🚩 ${ph.phaseName}`,
                start: phStart,
                end: phEnd,
                color: phColor,
              },
            ],
            data: {
              type: 'phase',
              id: ph.id,
              projectId: p.id,
              phaseId: ph.id,
              title: ph.phaseName,
              level: 2,
              parentId: projRowId,
              hasChildren: hasMilestones,
              color: phColor,
              icon: '🚩',
              status: ph.status,
              startDate: phStart,
              plannedEndDate: phEnd,
              progressPercent: ph.progress || 0,
            },
          });

          // 4. Milestones (Level 3)
          milestones.forEach((ms) => {
            const msRowId = `ms-${ms.id}`;
            const msDate = ms.dueDate && dayjs(ms.dueDate).isValid() ? dayjs(ms.dueDate).format('YYYY-MM-DD') : phStart;
            const msColor = ms.color || '#f59e0b';
            const workPackages = ms.workPackages || [];
            const hasWorkPackages = workPackages.length > 0;
            const msProgress = (ms.status || '').toLowerCase() === 'done' ? 100 : 0;

            rows.push({
              id: msRowId,
              label: ms.milestoneName,
              progress: msProgress,
              phases: [
                {
                  id: `bar-${msRowId}`,
                  label: `📌 ${ms.milestoneName}`,
                  start: msDate,
                  end: msDate,
                  color: msColor,
                },
              ],
              data: {
                type: 'milestone',
                id: ms.id,
                projectId: p.id,
                phaseId: ph.id,
                milestoneId: ms.id,
                title: ms.milestoneName,
                level: 3,
                parentId: phRowId,
                hasChildren: hasWorkPackages,
                color: msColor,
                icon: '📌',
                status: ms.status,
                startDate: msDate,
                plannedEndDate: msDate,
                progressPercent: msProgress,
              },
            });

            // 5. Work Packages (Level 4)
            workPackages.forEach((wp) => {
              const wpRowId = `wp-${wp.id}`;
              const wpStart = wp.startDate && dayjs(wp.startDate).isValid() ? dayjs(wp.startDate).format('YYYY-MM-DD') : msDate;
              const wpEnd = wp.endDate && dayjs(wp.endDate).isValid() ? dayjs(wp.endDate).format('YYYY-MM-DD') : wpStart;
              const wpColor = wp.color || '#8b5cf6';
              const tasks = wp.tasks || [];
              const hasTasks = tasks.length > 0;
              const wpProgress = this.calcWpProgress(wp);

              rows.push({
                id: wpRowId,
                label: wp.packageName,
                progress: wpProgress,
                phases: [
                  {
                    id: `bar-${wpRowId}`,
                    label: `📦 ${wp.packageName}`,
                    start: wpStart,
                    end: wpEnd,
                    color: wpColor,
                  },
                ],
                data: {
                  type: 'workpackage',
                  id: wp.id,
                  projectId: p.id,
                  phaseId: ph.id,
                  milestoneId: ms.id,
                  workPackageId: wp.id,
                  title: wp.packageName,
                  level: 4,
                  parentId: msRowId,
                  hasChildren: hasTasks,
                  color: wpColor,
                  icon: '📦',
                  status: wp.status,
                  startDate: wpStart,
                  plannedEndDate: wpEnd,
                  progressPercent: wpProgress,
                },
              });

              // 6. Tasks (Level 5)
              tasks.forEach((task) => {
                const taskRowId = `task-${task.id}`;
                const taskStart = task.startDate && dayjs(task.startDate).isValid() ? dayjs(task.startDate).format('YYYY-MM-DD') : wpStart;
                const taskEnd = task.endDate && dayjs(task.endDate).isValid() ? dayjs(task.endDate).format('YYYY-MM-DD') : taskStart;
                const taskColor = this.getTaskColor(task);
                const taskProgress = this.calcTaskProgress(task);

                rows.push({
                  id: taskRowId,
                  label: task.taskName,
                  progress: taskProgress,
                  phases: [
                    {
                      id: `bar-${taskRowId}`,
                      label: `${task.taskCode ? '[' + task.taskCode + '] ' : ''}${task.taskName}`,
                      start: taskStart,
                      end: taskEnd,
                      color: taskColor,
                    },
                  ],
                  data: {
                    type: 'task',
                    id: task.id,
                    projectId: p.id,
                    phaseId: ph.id,
                    milestoneId: ms.id,
                    workPackageId: wp.id,
                    title: task.taskName,
                    level: 5,
                    parentId: wpRowId,
                    hasChildren: false,
                    color: taskColor,
                    icon: '📋',
                    status: task.status,
                    assignedTo: task.assignedTo,
                    startDate: taskStart,
                    plannedEndDate: taskEnd,
                    progressPercent: taskProgress,
                  },
                });
              });
            });
          });
        });
      });
    });

    return rows;
  });

  // Filtered rows visible in timeline according to expanded ancestor tree
  readonly timelineItems = computed<SicCalendarTimelineRow<PortfolioRowData>[]>(() => {
    const all = this.allTimelineItems();
    if (all.length === 0) return [];

    const expanded = this.expandedTimelineRowIds();

    const parentMap = new Map<string, string | undefined>();
    all.forEach((item) => {
      parentMap.set(String(item.id), item.data?.parentId);
    });

    return all.filter((item) => {
      let curr = item.data?.parentId;
      while (curr) {
        if (!expanded.has(curr)) {
          return false;
        }
        curr = parentMap.get(curr);
      }
      return true;
    });
  });

  // Global Start & End Date for Timeline viewport
  readonly minStartDate = computed(() => {
    const all = this.allTimelineItems();
    if (all.length === 0) return dayjs().startOf('year').format('YYYY-MM-DD');
    let minD: Dayjs | null = null;
    for (const row of all) {
      for (const ph of row.phases) {
        const d = dayjs(ph.start);
        if (d.isValid() && (!minD || d.isBefore(minD))) {
          minD = d;
        }
      }
    }
    return minD ? minD.subtract(15, 'day').format('YYYY-MM-DD') : dayjs().startOf('year').format('YYYY-MM-DD');
  });

  readonly maxEndDate = computed(() => {
    const all = this.allTimelineItems();
    if (all.length === 0) return dayjs().endOf('year').format('YYYY-MM-DD');
    let maxD: Dayjs | null = null;
    for (const row of all) {
      for (const ph of row.phases) {
        const d = dayjs(ph.end);
        if (d.isValid() && (!maxD || d.isAfter(maxD))) {
          maxD = d;
        }
      }
    }
    return maxD ? maxD.add(30, 'day').format('YYYY-MM-DD') : dayjs().endOf('year').format('YYYY-MM-DD');
  });

  // Locale and Era
  readonly currentLocale = computed(() => {
    const lang = this.translate.currentLang || 'th';
    return lang.startsWith('th') ? 'th' : 'en';
  });

  readonly currentEra = computed<'BE' | 'CE'>(() => {
    return this.currentLocale() === 'th' ? 'BE' : 'CE';
  });

  // Toggle single row expand/collapse
  toggleRow(rowId: string, event?: Event): void {
    if (event) event.stopPropagation();
    const current = new Set(this.expandedTimelineRowIds());
    if (current.has(rowId)) {
      current.delete(rowId);
    } else {
      current.add(rowId);
    }
    this.expandedTimelineRowIds.set(current);
  }

  isRowExpanded(rowId: string): boolean {
    return this.expandedTimelineRowIds().has(rowId);
  }

  expandAll(): void {
    const all = this.allTimelineItems();
    const set = new Set<string>();
    all.forEach((item) => {
      if (item.data?.hasChildren) {
        set.add(String(item.id));
      }
    });
    this.expandedTimelineRowIds.set(set);
  }

  collapseAll(): void {
    this.expandedTimelineRowIds.set(new Set());
  }

  // Row and Phase clicks
  onRowClick(row: SicCalendarTimelineRow<PortfolioRowData>): void {
    const data = row.data;
    if (!data) return;
    if (data.hasChildren) {
      this.toggleRow(String(row.id));
    } else if (data.projectId) {
      this.navigateToProject(data.projectId);
    } else if (data.type === 'project') {
      this.navigateToProject(data.id);
    }
  }

  onPhaseClick(event: { row: SicCalendarTimelineRow<PortfolioRowData>; phase: any }): void {
    const data = event.row.data;
    if (!data) return;
    if (data.hasChildren) {
      this.toggleRow(String(event.row.id));
    } else if (data.projectId) {
      this.navigateToProject(data.projectId);
    } else if (data.type === 'project') {
      this.navigateToProject(data.id);
    }
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/feature/pm/dt/pmdt02'], {
      queryParams: { projectId },
    });
  }

  navigateToProjectEdit(projectId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/rt/pmrt02']);
  }
}
