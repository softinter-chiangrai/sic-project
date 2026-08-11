// src/app/feature/pm/dt/pmdt02/pmdt02.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import dayjs from '../../../../core/dayjs';
import { DialogService } from '../../../../core/services/dialog.service';

import type { PhaseResponse, CalendarItemDetail } from './pmdt02.model';
import type { MilestoneResponse } from './pmdt02A/pmdt02A.model';
import type { WorkPackageResponse } from './pmdt02B/pmdt02B.model';
import type { TaskResponse } from './pmdt02C/pmdt02C.model';
import { Pmdt02AService } from './pmdt02A/pmdt02A.service';
import { Pmdt02Service } from './pmdt02.service';
import { Pmdt02CService } from './pmdt02C/pmdt02C.service';
import { Pmdt02BService } from './pmdt02B/pmdt02B.service';
import 'dayjs/locale/th';
import {
  SicAvatarComponent,
  SicCalendarComponent,
  SicCalendarEvent,
  SicCalendarHoliday,
  SicCalendarTimelineComponent,
  SicCalendarTimelineRow,
  SicCalendarTimelineViewMode,
  SicCalendarEra,
  SicCalendarView,
  SicDatepickerComponent,
} from 'sic-ng';
import { buildCalendarEvents, buildCalendarHolidays, buildTimelineItems } from './pmdt02.utils';

import { FormsModule } from '@angular/forms';

export type { CalendarItemDetail };

@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SicAvatarComponent,
    SicCalendarComponent,
    SicCalendarTimelineComponent,
    SicDatepickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt02.component.html',
  styles: [`
    ::ng-deep .sic-calendar__sidebar,
    ::ng-deep .sic-calendar__sidebar-backdrop {
      display: none !important;
    }
  `],
})
export class Pmdt02Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(Pmdt02Service);
  private milestoneService = inject(Pmdt02AService);
  private wpService = inject(Pmdt02BService);
  private taskService = inject(Pmdt02CService);
  private dialog = inject(DialogService);

  // ===== SIGNALS =====
  phase = signal<PhaseResponse | null>(null);
  isLoading = signal(false);
  projectId = signal('');
  currentPhaseId = signal('');
  expandedMilestone = signal<string | null>(null);
  expandedWorkPackage = signal<string | null>(null);

  rightTab = signal<'list' | 'calendar' | 'gantt'>('list');
  calendarEra = signal<SicCalendarEra>('BE');
  calendarView = signal<SicCalendarView>('grid');
  timelineViewMode = signal<SicCalendarTimelineViewMode>('week');

  // ===== CUSTOM CALENDAR SIGNALS & SIDEBAR =====
  customHolidays = signal<SicCalendarHoliday[]>([]);
  customEvents = signal<SicCalendarEvent[]>([]);
  selectedCalendarDate = signal<string>(dayjs().format('YYYY-MM-DD'));
  isSidebarOpen = signal<boolean>(false);

  showCustomItemModal = signal<boolean>(false);
  customItemForm = {
    id: '',
    date: dayjs().format('YYYY-MM-DD'),
    title: '',
    description: '',
    icon: '📌',
    color: '#8b5cf6',
  };

  switchTab(tab: 'list' | 'calendar' | 'gantt'): void {
    this.rightTab.set(tab);
  }

  // ===== HELPER: convert string | Date to YYYY-MM-DD =====
  private toDateString(value: string | Date | undefined | null): string {
    if (!value) return '';
    if (typeof value === 'string') {
      const parts = value.split('T');
      if (parts.length > 0) return parts[0];
      return value;
    }
    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD');
    }
    return '';
  }

  // ===== CALENDAR & TIMELINE DATA =====
  calendarTasks = computed<SicCalendarEvent[]>(() => {
    const p = this.phase();
    const events = p ? buildCalendarEvents(p) : [];
    return [...events, ...this.customEvents()];
  });

  calendarHolidays = computed<SicCalendarHoliday[]>(() => {
    const p = this.phase();
    const phaseHolidays = p ? buildCalendarHolidays(p) : [];
    return [...phaseHolidays, ...this.customHolidays()];
  });

  selectedDateItems = computed<CalendarItemDetail[]>(() => {
    const selDate = this.selectedCalendarDate();
    if (!selDate) return [];

    const items: CalendarItemDetail[] = [];
    const p = this.phase();

    if (p) {
      // 1. Phase
      if (p.startDate) {
        const start = this.toDateString(p.startDate);
        const end = this.toDateString(p.endDate) || start;
        if (selDate >= start && selDate <= end) {
          items.push({
            id: p.id,
            type: 'phase',
            title: `Phase: ${p.phaseName}`,
            subtitle: p.description || 'Phase หลัก',
            description: `ระยะเวลา: ${this.formatDate(p.startDate)} - ${this.formatDate(p.endDate)}`,
            color: p.color || '#3b82f6',
            icon: '🚩',
            rawObject: p,
          });
        }
      }

      // 2. Milestones
      p.milestones?.forEach((ms) => {
        const due = this.toDateString(ms.dueDate);
        if (due && due === selDate) {
          items.push({
            id: ms.id,
            type: 'milestone',
            title: `Milestone: ${ms.milestoneName}`,
            subtitle: ms.description || 'วันกำหนด Milestone',
            color: ms.color || '#eab308',
            icon: '📌',
            rawObject: ms,
          });
        }

        // 3. Work Packages
        ms.workPackages?.forEach((wp) => {
          if (wp.startDate) {
            const start = this.toDateString(wp.startDate);
            const end = this.toDateString(wp.endDate) || start;
            if (selDate >= start && selDate <= end) {
              items.push({
                id: wp.id,
                type: 'workpackage',
                title: `Work Package: ${wp.packageName}`,
                subtitle: wp.description || `Milestone: ${ms.milestoneName}`,
                color: wp.color || '#a855f7',
                icon: '📦',
                rawObject: { ...wp, milestoneId: ms.id },
              });
            }

            // 4. Tasks
            wp.tasks?.forEach((task) => {
              if (task.startDate) {
                const tStart = this.toDateString(task.startDate);
                const tEnd = this.toDateString(task.endDate) || tStart;
                if (selDate >= tStart && selDate <= tEnd) {
                  const visuals = this.getTaskVisuals(task);
                  items.push({
                    id: task.id,
                    type: 'task',
                    title: `Task: ${task.taskName}`,
                    subtitle: `ผู้รับผิดชอบ: ${task.assignedTo || '-'} | สถานะ: ${this.getStatusText(task.status)}`,
                    description: task.description,
                    color: task.color || visuals.color,
                    icon: visuals.icon,
                    rawObject: { ...task, workPackageId: wp.id, milestoneId: ms.id },
                  });
                }
              }
            });
          }
        });
      });
    }

    // 5. Custom Items
    const rawCustom = this.getRawCustomItems();
    rawCustom.forEach((cItem) => {
      if (cItem.date === selDate) {
        items.push({
          id: cItem.id,
          type: 'holiday',
          title: cItem.title,
          subtitle: cItem.description || 'วันหยุด / Event ที่เพิ่มเอง',
          color: cItem.color || '#8b5cf6',
          icon: cItem.icon || '📌',
          isCustom: true,
          rawObject: cItem,
        });
      }
    });

    return items;
  });

  // ===== TIMELINE COLLAPSIBLE STATE =====
  expandedTimelineRowIds = signal<Set<string>>(new Set());

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

  allTimelineItems = computed(() => {
    const p = this.phase();
    if (!p) return [];
    return buildTimelineItems(p);
  });

  timelineItems = computed<SicCalendarTimelineRow[]>(() => {
    const all = this.allTimelineItems();
    if (all.length === 0) return [];

    const expanded = this.expandedTimelineRowIds();
    // Initialize expanded set if empty on first load (default Phase and Milestones expanded)
    if (expanded.size === 0 && all.length > 0) {
      const initialSet = new Set<string>();
      all.forEach((item) => {
        const data = item.data as any;
        if (data?.hasChildren) {
          initialSet.add(String(item.id));
        }
      });
      // Update asynchronously or on demand
      setTimeout(() => this.expandedTimelineRowIds.set(initialSet));
    }

    return all.filter((item) => {
      const data = item.data as any;
      if (!data || data.level === 0) return true; // Top level phase is always visible

      // Check if all parent ancestors are expanded
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

  onTimelineRowClick(row: SicCalendarTimelineRow): void {
    const data = row.data as any;
    if (!data) return;
    if (data.hasChildren) {
      this.toggleTimelineRow(String(row.id));
    } else {
      this.onSelectItem({
        id: data.id,
        type: data.type,
        title: data.title,
        color: data.color,
        icon: data.icon,
        rawObject: data,
      });
    }
  }

  onTimelinePhaseClick(event: { row: SicCalendarTimelineRow; phase: any }): void {
    const data = event.row.data as any;
    if (!data) return;
    this.onSelectItem({
      id: data.id,
      type: data.type,
      title: data.title,
      color: data.color,
      icon: data.icon,
      rawObject: data,
    });
  }

  timelineStartDate = computed(() => {
    const p = this.phase();
    if (p?.startDate) return this.toDateString(p.startDate);
    return dayjs().format('YYYY-MM-DD');
  });

  timelineEndDate = computed(() => {
    const p = this.phase();
    if (p?.endDate) return this.toDateString(p.endDate);
    return dayjs().add(30, 'day').format('YYYY-MM-DD');
  });

  // ===== LIFECYCLE =====
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const phaseId = params.get('id');
      this.route.queryParams.subscribe((qParams) => {
        const pid = qParams['projectId'];
        if (phaseId && pid) {
          this.currentPhaseId.set(phaseId);
          this.projectId.set(pid);
          this.loadPhaseDetail(phaseId);
        } else {
          this.router.navigate(['/feature/pm/pmdt01'], {
            queryParams: { projectId: this.projectId() },
          });
        }
      });
    });
  }

  loadPhaseDetail(phaseId: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (data) => {
        this.phase.set(data);
        this.loadCustomItems();
        this.loadMilestones(phaseId);
      },
      error: (err) => {
        console.error(err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายละเอียด Phase ได้');
        this.router.navigate(['/feature/pm/pmdt01'], {
          queryParams: { projectId: this.projectId() },
        });
      },
      complete: () => this.isLoading.set(false),
    });
  }

  loadMilestones(phaseId: string) {
    this.milestoneService.getMilestonesByPhaseId(phaseId).subscribe({
      next: (milestones) => {
        const current = this.phase();
        if (current) {
          this.phase.set({
            ...current,
            milestones: milestones,
          });
          this.loadWorkPackagesForMilestones(milestones);
        }
      },
      error: (err) => console.error(err),
    });
  }

  private loadWorkPackagesForMilestones(milestones: MilestoneResponse[]) {
    if (!milestones || milestones.length === 0) return;
    milestones.forEach((ms) => {
      this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
        next: (workPackages) => {
          const current = this.phase();
          if (current?.milestones) {
            const target = current.milestones.find((m) => m.id === ms.id);
            if (target) {
              target.workPackages = workPackages;
              this.phase.set({ ...current });
              // Automatically load tasks for each workpackage so Gantt chart has full tree
              workPackages.forEach((wp) => {
                this.loadTasksForWorkPackage(wp.id);
              });
            }
          }
        },
        error: (err) => console.error(`Failed to load WPs for milestone ${ms.id}`, err),
      });
    });
  }

  private loadTasksForWorkPackage(wpId: string) {
    const current = this.phase();
    if (!current) return;
    let targetWp: WorkPackageResponse | null = null;
    for (const ms of current.milestones || []) {
      const found = ms.workPackages?.find((w) => w.id === wpId);
      if (found) {
        targetWp = found;
        break;
      }
    }
    if (!targetWp) return;
    if (!targetWp.tasks || targetWp.tasks.length === 0) {
      this.taskService.getTasksByWorkPackageId(wpId).subscribe({
        next: (tasks) => {
          targetWp!.tasks = tasks;
          this.phase.set({ ...current });
        },
        error: (err) => console.error(`Failed to load tasks for WP ${wpId}`, err),
      });
    }
  }

  // ===== TOGGLE =====
  toggleMilestone(msId: string) {
    this.expandedMilestone.set(this.expandedMilestone() === msId ? null : msId);
  }

  toggleWorkPackage(wpId: string) {
    if (this.expandedWorkPackage() !== wpId) {
      this.loadTasksForWorkPackage(wpId);
    }
    this.expandedWorkPackage.set(this.expandedWorkPackage() === wpId ? null : wpId);
  }

  getTotalWorkPackages(phase: PhaseResponse): number {
    let count = 0;
    phase.milestones?.forEach((ms) => {
      count += ms.workPackages?.length || 0;
    });
    return count;
  }

  // ===== CRUD =====
  openCreateMilestone() {
    const phaseId = this.currentPhaseId();
    if (!phaseId) return;
    this.router.navigate(['/feature/pm/milestone/new'], {
      queryParams: { phaseId, projectId: this.projectId() },
    });
  }

  editMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/milestone', ms.id, 'edit'], {
      queryParams: { projectId: this.projectId() },
    });
  }

  deleteMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Milestone "${ms.milestoneName}"?`).then((confirmed) => {
      if (confirmed) {
        this.milestoneService.deleteMilestone(ms.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.filter((m) => m.id !== ms.id);
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  openCreateWorkPackage(milestoneId: string) {
    this.router.navigate(['/feature/pm/work-package/new'], {
      queryParams: {
        milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  openCreateWorkPackageForPhase() {
    const p = this.phase();
    if (!p || !p.milestones || p.milestones.length === 0) {
      this.dialog.error('ไม่มี Milestone', 'กรุณาสร้าง Milestone ก่อน');
      return;
    }
    this.openCreateWorkPackage(p.milestones[0].id);
  }

  editWorkPackage(wp: WorkPackageResponse, milestoneId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/work-package', wp.id, 'edit'], {
      queryParams: {
        milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  deleteWorkPackage(wp: WorkPackageResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Work Package "${wp.packageName}"?`).then((confirmed) => {
      if (confirmed) {
        this.wpService.deleteWorkPackage(wp.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.map((m) => ({
                ...m,
                workPackages: m.workPackages?.filter((w) => w.id !== wp.id) || [],
              }));
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  openCreateTask(workPackageId: string) {
    this.router.navigate(['/feature/pm/task/new'], {
      queryParams: {
        workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  editTask(task: TaskResponse, workPackageId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/task', task.id, 'edit'], {
      queryParams: {
        workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  deleteTask(task: TaskResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Task "${task.taskName}"?`).then((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.map((m) => ({
                ...m,
                workPackages:
                  m.workPackages?.map((wp) => ({
                    ...wp,
                    tasks: wp.tasks?.filter((t) => t.id !== task.id) || [],
                  })) || [],
              }));
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  // ===== NAVIGATION TO FULLSCREEN GANTT =====
  goToGanttFullscreen() {
    const phaseId = this.currentPhaseId();
    const projectId = this.projectId();
    if (phaseId) {
      this.router.navigate(['/feature/pm/phase', phaseId, 'gantt'], {
        queryParams: { projectId }
      });
    }
  }

  // ===== CUSTOM CALENDAR STORAGE & LOGIC =====
  private getStorageKey(): string {
    return `sic_custom_calendar_items_${this.currentPhaseId()}`;
  }

  loadCustomItems(): void {
    const key = this.getStorageKey();
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const hList: SicCalendarHoliday[] = [];
          const eList: SicCalendarEvent[] = [];
          parsed.forEach((item: any) => {
            hList.push({
              id: item.id,
              date: item.date,
              title: item.title,
              source: 'office',
              color: item.color || '#8b5cf6',
              icon: item.icon || '📌',
            });
            eList.push({
              id: item.id,
              date: item.date,
              title: item.title,
              color: item.color || '#8b5cf6',
              icon: item.icon || '📌',
              description: item.description || '',
              extra: { type: 'holiday', id: item.id, isCustom: true, raw: item },
            } as any);
          });
          this.customHolidays.set(hList);
          this.customEvents.set(eList);
        }
      }
    } catch (e) {
      console.error('Failed to load custom calendar items', e);
    }
  }

  saveCustomItems(items: any[]): void {
    const key = this.getStorageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
      this.loadCustomItems();
    } catch (e) {
      console.error('Failed to save custom calendar items', e);
    }
  }

  private getRawCustomItems(): any[] {
    const key = this.getStorageKey();
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // ===== CALENDAR & TIMELINE EVENT HANDLERS =====
  onDateClick(event: any): void {
    let dateStr = '';
    if (event && event.date) {
      if (typeof event.date.format === 'function') {
        dateStr = event.date.format('YYYY-MM-DD');
      } else if (event.date instanceof Date) {
        dateStr = dayjs(event.date).format('YYYY-MM-DD');
      } else if (typeof event.date === 'string') {
        dateStr = event.date.split('T')[0];
      }
    } else if (event instanceof Date) {
      dateStr = dayjs(event).format('YYYY-MM-DD');
    } else if (typeof event === 'string') {
      dateStr = event.split('T')[0];
    }

    if (dateStr) {
      this.selectedCalendarDate.set(dateStr);
      this.isSidebarOpen.set(true);
    }
  }

  handleCalendarEventClick(event: SicCalendarEvent): void {
    if (event && event.date) {
      const dateStr = this.toDateString(event.date);
      if (dateStr) {
        this.selectedCalendarDate.set(dateStr);
        this.isSidebarOpen.set(true);
      }
    }
  }

  handleCalendarHolidayClick(holiday: SicCalendarHoliday): void {
    if (holiday && holiday.date) {
      const dateStr = this.toDateString(holiday.date);
      if (dateStr) {
        this.selectedCalendarDate.set(dateStr);
        this.isSidebarOpen.set(true);
      }
    }
  }

  closeDateSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onSelectItem(item: CalendarItemDetail): void {
    const projectId = this.projectId();
    const phaseId = this.currentPhaseId();

    switch (item.type) {
      case 'phase':
        this.router.navigate(['/feature/pm/phase', item.id, 'edit'], {
          queryParams: { projectId },
        });
        break;
      case 'milestone':
        this.router.navigate(['/feature/pm/milestone', item.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'workpackage':
        this.router.navigate(['/feature/pm/work-package', item.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        this.router.navigate(['/feature/pm/task', item.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: item.rawObject?.workPackageId || '' },
        });
        break;
      case 'holiday':
      case 'event':
        if (item.isCustom && item.rawObject) {
          this.customItemForm = {
            id: item.rawObject.id || '',
            date: item.rawObject.date || this.selectedCalendarDate(),
            title: item.rawObject.title || '',
            description: item.rawObject.description || '',
            icon: item.rawObject.icon || '📌',
            color: item.rawObject.color || '#8b5cf6',
          };
          this.showCustomItemModal.set(true);
        }
        break;
    }
  }

  openAddCustomItemModal(dateStr?: string | null): void {
    const targetDate = dateStr || this.selectedCalendarDate() || dayjs().format('YYYY-MM-DD');
    this.customItemForm = {
      id: '',
      date: targetDate,
      title: '',
      description: '',
      icon: '📌',
      color: '#8b5cf6',
    };
    this.showCustomItemModal.set(true);
  }

  closeCustomItemModal(): void {
    this.showCustomItemModal.set(false);
  }

  saveCustomItem(): void {
    if (!this.customItemForm.title.trim()) return;
    const currentItems = this.getRawCustomItems();
    if (this.customItemForm.id) {
      const updated = currentItems.map((item) =>
        item.id === this.customItemForm.id ? { ...this.customItemForm } : item
      );
      this.saveCustomItems(updated);
    } else {
      const newItem = {
        ...this.customItemForm,
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      };
      this.saveCustomItems([...currentItems, newItem]);
    }
    this.selectedCalendarDate.set(this.customItemForm.date);
    this.isSidebarOpen.set(true);
    this.closeCustomItemModal();
  }

  deleteCustomItem(itemId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบข้อมูลนี้หรือไม่?').then((confirmed) => {
      if (confirmed) {
        const currentItems = this.getRawCustomItems();
        const updated = currentItems.filter((i) => i.id !== itemId);
        this.saveCustomItems(updated);
      }
    });
  }

  openCreateMilestoneForDate(dateStr?: string | null): void {
    const phaseId = this.currentPhaseId();
    if (!phaseId) return;
    this.router.navigate(['/feature/pm/milestone/new'], {
      queryParams: {
        phaseId,
        projectId: this.projectId(),
        dueDate: dateStr || undefined,
      },
    });
  }

  openCreateWorkPackageForDate(dateStr?: string | null): void {
    const p = this.phase();
    if (!p || !p.milestones || p.milestones.length === 0) {
      this.dialog.error('ไม่มี Milestone', 'กรุณาสร้าง Milestone ก่อน');
      return;
    }
    this.router.navigate(['/feature/pm/work-package/new'], {
      queryParams: {
        milestoneId: p.milestones[0].id,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        startDate: dateStr || undefined,
      },
    });
  }

  openCreateTaskForDate(dateStr?: string | null): void {
    const p = this.phase();
    if (!p || !p.milestones) return;
    let wpId = '';
    for (const ms of p.milestones) {
      if (ms.workPackages && ms.workPackages.length > 0) {
        wpId = ms.workPackages[0].id;
        break;
      }
    }
    if (!wpId) {
      this.dialog.error('ไม่มี Work Package', 'กรุณาสร้าง Work Package ก่อน');
      return;
    }
    this.router.navigate(['/feature/pm/task/new'], {
      queryParams: {
        workPackageId: wpId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        startDate: dateStr || undefined,
      },
    });
  }

  formatSelectedDateLabel(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = dayjs(dateStr);
    if (!d.isValid()) return dateStr;
    const monthNamesTh = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = d.date();
    const month = monthNamesTh[d.month()];
    const yearBE = d.year() + 543;
    return `${day} ${month} ${yearBE}`;
  }

  private getTaskVisuals(task: TaskResponse): { icon: string; color: string } {
    if (task.color) {
      return { icon: '🔹', color: task.color };
    }
    switch (task.status) {
      case 'Done':
      case 'Closed':
        return { icon: '✅', color: '#22c55e' };
      case 'In Progress':
        return { icon: '👥', color: '#3b82f6' };
      case 'Waiting Review':
        return { icon: '🔍', color: '#06b6d4' };
      case 'Waiting Fix':
        return { icon: '🛠️', color: '#f59e0b' };
      case 'Blocked':
        return { icon: '⛔', color: '#ef4444' };
      default:
        return { icon: '📝', color: '#8b5cf6' };
    }
  }

  private navigateFromTimelineData(data: any): void {
    if (!data) return;
    const projectId = this.projectId();
    const phaseId = this.currentPhaseId();

    switch (data.type) {
      case 'phase':
        this.router.navigate(['/feature/pm/phase', data.id, 'edit'], {
          queryParams: { projectId },
        });
        break;
      case 'milestone':
        this.router.navigate(['/feature/pm/milestone', data.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'workpackage':
        this.router.navigate(['/feature/pm/work-package', data.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        this.router.navigate(['/feature/pm/task', data.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: data.workPackageId || '' },
        });
        break;
    }
  }

  // ===== NAVIGATION =====
  goBack() {
    this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
  }

  // ===== UTILITIES =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-700',
      Done: 'bg-emerald-100 text-emerald-700',
      Delayed: 'bg-red-100 text-red-700',
      Todo: 'bg-gray-100 text-gray-600',
      'Waiting Review': 'bg-purple-100 text-purple-700',
      'Waiting Fix': 'bg-orange-100 text-orange-700',
      Blocked: 'bg-rose-100 text-rose-700',
      Cancelled: 'bg-gray-300 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
      Todo: 'รอเริ่ม',
      'Waiting Review': 'รอ Review',
      'Waiting Fix': 'รอแก้ไข',
      Blocked: 'ติดปัญหา',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}