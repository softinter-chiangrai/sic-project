// src/app/core/component/sic-gantt/sic-gantt.component.ts

import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicCalendarTimelineComponent, SicCalendarTimelineRow } from 'sic-ng';
import { DialogService } from '../../services/dialog.service';
import { NavigationService } from '../../services/navigation.service';
import { CustomerStateService } from '../../services/customer-state.service';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';
import { buildTimelineItems } from '../../../feature/pm/dt/pmdt02/pmdt02.utils';
import { PhaseService } from '../../../feature/pm/dt/pmdt02/phase.service';

@Component({
  selector: 'app-sic-gantt',
  standalone: true,
  imports: [CommonModule, RouterModule, SicCalendarTimelineComponent],
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
            (phaseClick)="onPhaseClick($event)"
          />
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
  private phaseService = inject(PhaseService);
  private dialog = inject(DialogService);

  isLoading = signal(false);
  projectId = signal<string | null>(null);
  phaseId = signal<string | null>(null);
  pageTitle = signal('Loading...');
  phaseName = signal<string | null>(null);
  timelineItems = signal<SicCalendarTimelineRow[]>([]);
  startDate = signal('');
  endDate = signal('');
  viewMode = signal<'day' | 'week' | 'month'>('week');

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
        const items = buildTimelineItems(phase);
        this.timelineItems.set(items);
        this.isLoading.set(false);
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
            const allItems: SicCalendarTimelineRow[] = [];
            phases.forEach((phase) => {
              const items = buildTimelineItems(phase);
              allItems.push(...items);
            });
            this.timelineItems.set(allItems);
            this.isLoading.set(false);
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

  onRowClick(row: SicCalendarTimelineRow) {
    const data = row.data as any;
    if (!data) return;
    this.navigateToEntity(data.type, data.id, data.phaseId, data.milestoneId, data.workPackageId);
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