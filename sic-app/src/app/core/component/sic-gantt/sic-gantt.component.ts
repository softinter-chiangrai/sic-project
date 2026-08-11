// src/app/core/component/sic-gantt/sic-gantt.component.ts

import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicAvatarComponent, SicCalendarTimelineComponent, SicCalendarTimelineRow } from 'sic-ng';
import { DialogService } from '../../services/dialog.service';
import { NavigationService } from '../../services/navigation.service';
import { CustomerStateService } from '../../services/customer-state.service';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';
import { buildTimelineItems } from '../../../feature/pm/dt/pmdt02/pmdt02.utils';
import { Pmdt02AService } from '../../../feature/pm/dt/pmdt02/pmdt02A/pmdt02A.service';
import { Pmdt02BService } from '../../../feature/pm/dt/pmdt02/pmdt02B/pmdt02B.service';
import { Pmdt02CService } from '../../../feature/pm/dt/pmdt02/pmdt02C/pmdt02C.service';
import { Pmdt02Service } from '../../../feature/pm/dt/pmdt02/pmdt02.service';

@Component({
  selector: 'app-sic-gantt',
  standalone: true,
  imports: [CommonModule, RouterModule, SicAvatarComponent, SicCalendarTimelineComponent],
  template: `
    <div class="p-4 h-screen flex flex-col bg-[var(--bg)]">
      <div class="flex items-center gap-3 mb-4 flex-shrink-0">
        <button
          (click)="goBack()"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--crm-primary)] hover:bg-[var(--crm-primary)]/10 transition-all"
        >
          <i class="bi bi-arrow-left text-xl"></i>
        </button>
        <h1 class="text-xl font-bold text-[var(--text-active)]">
          Gantt Chart: {{ pageTitle() }}
        </h1>
        @if (phaseName()) {
          <span class="text-sm text-[var(--text-muted)] ml-2">(Phase: {{ phaseName() }})</span>
        }
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-full">
          <div class="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--crm-primary)] rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="flex-1 min-h-0 bg-[var(--sidebar)] rounded-xl border border-[var(--border)] p-4 overflow-hidden">
          <sic-calendar-timeline
            [items]="timelineItems()"
            [startDate]="startDate()"
            [endDate]="endDate()"
            [(viewMode)]="viewMode"
            [showLabelColumn]="true"
            [maxHeight]="'calc(100vh - 200px)'"
            locale="th"
            era="BE"
            (rowClick)="onRowClick($event)"
            (phaseClick)="onPhaseClick($event)">
            <ng-template #labelTemplate let-row>
              <div
                class="flex items-center gap-1.5 w-full py-1 pr-2 select-none"
                [style.padding-left.px]="((row.data?.level || 0) * 16) + 4">
                @if (row.data?.hasChildren) {
                  <button
                    type="button"
                    (click)="toggleTimelineRow(row.id, $event)"
                    class="w-5 h-5 flex items-center justify-center rounded-md bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] hover:bg-[var(--crm-primary)] hover:text-white transition-all flex-shrink-0 shadow-sm"
                    title="คลิกเพื่อพับ/ขยาย">
                    <i
                      class="bi bi-chevron-right text-[0.7rem] font-bold transition-transform duration-200"
                      [class.rotate-90]="isTimelineRowExpanded(row.id)"></i>
                  </button>
                } @else {
                  <span class="w-5 flex-shrink-0"></span>
                }
                <span class="text-sm flex-shrink-0">{{ row.data?.icon || '📌' }}</span>
                <span class="text-xs font-medium text-[var(--text-active)] truncate flex-1" [title]="row.data?.title || row.label">
                  {{ row.data?.title || row.label }}
                </span>
              </div>
            </ng-template>
            <ng-template #phaseTemplate let-phase let-row="row">
              <div
                class="h-full rounded-md flex items-center justify-between px-2 text-white text-[0.7rem] font-medium shadow-sm transition-all overflow-hidden"
                [style.background-color]="phase.color || row.data?.color || '#3b82f6'"
                [title]="(phase.label || row.label) + (row.data?.assignees?.length ? (' | ผู้รับผิดชอบ: ' + row.data.assignees.join(', ')) : '')">
                <span class="truncate mr-1 flex-1">{{ phase.label || row.label }}</span>
                @if (row.data?.assignees && row.data?.assignees.length > 0) {
                  <div class="flex items-center -space-x-1 flex-shrink-0">
                    @for (person of row.data?.assignees.slice(0, 2); track person) {
                      <sic-avatar
                        [name]="person"
                        [src]="person.startsWith('http') || person.startsWith('assets') ? person : undefined"
                        size="sm"
                        class="!w-4 !h-4 text-[0.55rem] ring-1 ring-white/30 rounded-full flex-shrink-0">
                      </sic-avatar>
                    }
                  </div>
                }
              </div>
            </ng-template>
          </sic-calendar-timeline>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicGanttComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);
  private projectService = inject(Pmrt02Service);
  private phaseService = inject(Pmdt02Service);
  private milestoneService = inject(Pmdt02AService);
  private wpService = inject(Pmdt02BService);
  private taskService = inject(Pmdt02CService);
  private dialog = inject(DialogService);

  isLoading = signal(false);
  projectId = signal<string | null>(null);
  phaseId = signal<string | null>(null);
  pageTitle = signal('Loading...');
  phaseName = signal<string | null>(null);
  allTimelineItems = signal<SicCalendarTimelineRow[]>([]);
  expandedTimelineRowIds = signal<Set<string>>(new Set());
  startDate = signal('');
  endDate = signal('');
  viewMode = signal<'day' | 'week' | 'month'>('week');

  toggleTimelineRow(rowId: string, event?: Event): void {
    if (event) event.stopPropagation();
    const current = new Set(this.expandedTimelineRowIds());
    if (current.has(rowId)) {
      current.delete(rowId);
    } else {
      current.add(rowId);
    }
    this.expandedTimelineRowIds.set(current);
  }

  isTimelineRowExpanded(rowId: string): boolean {
    return this.expandedTimelineRowIds().has(rowId);
  }

  timelineItems = computed<SicCalendarTimelineRow[]>(() => {
    const all = this.allTimelineItems();
    if (all.length === 0) return [];

    const expanded = this.expandedTimelineRowIds();
    if (expanded.size === 0 && all.length > 0) {
      const initialSet = new Set<string>();
      all.forEach((item) => {
        const data = item.data as any;
        if (data?.hasChildren) {
          initialSet.add(String(item.id));
        }
      });
      setTimeout(() => this.expandedTimelineRowIds.set(initialSet));
    }

    return all.filter((item) => {
      const data = item.data as any;
      if (!data || data.level === 0) return true;

      let currentParentId = data.parentId;
      while (currentParentId) {
        if (!expanded.has(currentParentId)) {
          return false;
        }
        const parentRow = all.find((r) => String(r.id) === currentParentId);
        const parentData = parentRow?.data as any;
        currentParentId = parentData?.parentId;
      }
      return true;
    });
  });

  ngOnInit() {
    // ตรวจสอบว่าเป็น route แบบ phase/:id/gantt หรือ gantt (มี projectId ใน query)
    this.route.paramMap.subscribe((params) => {
      const phaseId = params.get('id');
      if (phaseId) {
        this.phaseId.set(phaseId);
        this.loadPhase(phaseId);
      } else {
        // ไม่มี phaseId -> ต้องมี projectId ใน queryParams หรือจาก customerState
        this.route.queryParams.subscribe((qParams) => {
          const pid = qParams['projectId'] || this.customerState.getProjectId();
          if (!pid) {
            this.dialog.warn('กรุณาเลือกโครงการ', 'ไม่พบรหัสโครงการ');
            this.navigation.navigate(['/feature/pm/pmrt02']);
            return;
          }
          this.projectId.set(pid);
          this.loadProject(pid);
        });
      }
    });
  }

  loadPhase(phaseId: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (phase) => {
        this.phaseName.set(phase.phaseName);
        this.pageTitle.set(phase.phaseName);
        this.startDate.set(phase.startDate);
        this.endDate.set(phase.endDate);

        // Fetch full milestone/workpackage/task hierarchy for full-screen view
        this.milestoneService.getMilestonesByPhaseId(phaseId).subscribe({
          next: (milestones) => {
            phase.milestones = milestones;
            if (!milestones || milestones.length === 0) {
              this.allTimelineItems.set(buildTimelineItems(phase));
              this.isLoading.set(false);
              return;
            }
            let loadedWps = 0;
            let totalWps = 0;

            // Count total work packages
            milestones.forEach((ms) => {
              this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
                next: (wps) => {
                  ms.workPackages = wps;
                  loadedWps++;

                  if (wps && wps.length > 0) {
                    totalWps += wps.length;
                    let loadedTasks = 0;
                    wps.forEach((wp) => {
                      this.taskService.getTasksByWorkPackageId(wp.id).subscribe({
                        next: (tasks) => {
                          wp.tasks = tasks;
                          loadedTasks++;
                          this.allTimelineItems.set(buildTimelineItems(phase));
                        },
                        error: () => {
                          loadedTasks++;
                          this.allTimelineItems.set(buildTimelineItems(phase));
                        }
                      });
                    });
                  } else {
                    this.allTimelineItems.set(buildTimelineItems(phase));
                  }

                  if (loadedWps === milestones.length) {
                    this.isLoading.set(false);
                  }
                },
                error: () => {
                  loadedWps++;
                  if (loadedWps === milestones.length) this.isLoading.set(false);
                }
              });
            });
          },
          error: () => {
            this.allTimelineItems.set(buildTimelineItems(phase));
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message);
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  loadProject(pid: string) {
    this.isLoading.set(true);
    this.projectService.getProject(pid).subscribe({
      next: (project) => {
        this.pageTitle.set(project.projectName);
        this.startDate.set(project.startDate);
        this.endDate.set(project.plannedEndDate);

        this.phaseService.getPhases(pid).subscribe({
          next: (phases) => {
            if (!phases || phases.length === 0) {
              this.allTimelineItems.set([]);
              this.isLoading.set(false);
              return;
            }
            let loadedPhases = 0;
            phases.forEach((phase) => {
              this.milestoneService.getMilestonesByPhaseId(phase.id).subscribe({
                next: (milestones) => {
                  phase.milestones = milestones;
                  milestones.forEach((ms) => {
                    this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
                      next: (wps) => {
                        ms.workPackages = wps;
                        wps.forEach((wp) => {
                          this.taskService.getTasksByWorkPackageId(wp.id).subscribe({
                            next: (tasks) => {
                              wp.tasks = tasks;
                              this.rebuildAllProjectTimeline(phases);
                            }
                          });
                        });
                        this.rebuildAllProjectTimeline(phases);
                      }
                    });
                  });
                  loadedPhases++;
                  this.rebuildAllProjectTimeline(phases);
                  if (loadedPhases === phases.length) this.isLoading.set(false);
                },
                error: () => {
                  loadedPhases++;
                  if (loadedPhases === phases.length) this.isLoading.set(false);
                }
              });
            });
          },
          error: (err) => {
            this.dialog.error('โหลด Phase ไม่สำเร็จ', err.message);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.dialog.error('โหลดโครงการไม่สำเร็จ', err.message);
        this.isLoading.set(false);
        this.navigation.navigate(['/feature/pm/pmrt02']);
      }
    });
  }

  private rebuildAllProjectTimeline(phases: any[]) {
    const allItems: SicCalendarTimelineRow[] = [];
    phases.forEach((phase) => {
      const items = buildTimelineItems(phase);
      allItems.push(...items);
    });
    this.allTimelineItems.set(allItems);
  }

  onRowClick(row: SicCalendarTimelineRow) {
    const data = row.data as any;
    if (!data) return;
    if (data.hasChildren) {
      this.toggleTimelineRow(String(row.id));
    } else {
      this.navigateToEntity(data.type, data.id, data.phaseId, data.milestoneId, data.workPackageId);
    }
  }

  onPhaseClick(event: { row: SicCalendarTimelineRow; phase: any }) {
    const row = event.row;
    const data = row.data as any;
    if (!data) return;
    this.navigateToEntity(data.type, data.id, data.phaseId, data.milestoneId, data.workPackageId);
  }

  private navigateToEntity(
    type: string,
    id: string,
    phaseId?: string,
    milestoneId?: string,
    workPackageId?: string
  ) {
    const projectId = this.projectId();
    const queryParams: any = { projectId };
    if (phaseId) queryParams.phaseId = phaseId;
    if (milestoneId) queryParams.milestoneId = milestoneId;
    if (workPackageId) queryParams.workPackageId = workPackageId;

    let route: string;
    switch (type) {
      case 'phase':
        route = `/feature/pm/phase/${id}/edit`;
        break;
      case 'milestone':
        route = `/feature/pm/milestone/${id}/edit`;
        break;
      case 'workpackage':
        route = `/feature/pm/work-package/${id}/edit`;
        break;
      case 'task':
        route = `/feature/pm/task/${id}/edit`;
        break;
      default:
        return;
    }
    this.router.navigate([route], { queryParams });
  }

  goBack() {
    // ถ้ามี phaseId -> กลับไปหน้า phase detail
    if (this.phaseId()) {
      const projectId = this.projectId() || this.customerState.getProjectId();
      this.router.navigate(['/feature/pm/phase', this.phaseId()], { queryParams: { projectId } });
    } else {
      // กลับไปหน้า project list หรือ dashboard
      this.navigation.navigate(['/feature/pm/pmrt02']);
    }
  }
}