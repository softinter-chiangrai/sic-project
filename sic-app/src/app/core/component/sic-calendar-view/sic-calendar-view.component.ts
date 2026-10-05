// src/app/core/component/sic-calendar-view/sic-calendar-view.component.ts
import { Component, inject, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import dayjs from '../../dayjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';
import type { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';
import {
  SicCalendarComponent,
  SicCalendarEra,
  SicCalendarView,
  SicCalendarEvent,
  SicCalendarHoliday,
  SicDatepickerComponent,
} from 'sic-ng';

import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { SicStripHtmlPipe } from '../../pipes/sic-strip-html.pipe';
import { DialogService } from '../../services/dialog.service';
import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../auth/auth.service';
import { SicSidebarService } from '../sic-sidebar/sic-sidebar.service';
import { CustomerStateService } from '../../services/customer-state.service';
import { HolidayService, UserLeave } from '../../services/holiday.service';
import { environment } from '../../../../environments/environment';

import type { PhaseResponse, CalendarItemDetail } from '../../../feature/pm/dt/pmdt02/pmdt02.model';
import { Pmdt02Service } from '../../../feature/pm/dt/pmdt02/pmdt02.service';
import { Pmdt02AService } from '../../../feature/pm/dt/pmdt02/pmdt02A/pmdt02A.service';
import { Pmdt02BService } from '../../../feature/pm/dt/pmdt02/pmdt02B/pmdt02B.service';
import { Pmdt02CService } from '../../../feature/pm/dt/pmdt02/pmdt02C/pmdt02C.service';
import type { MilestoneResponse } from '../../../feature/pm/dt/pmdt02/pmdt02A/pmdt02A.model';
import type { WorkPackageResponse } from '../../../feature/pm/dt/pmdt02/pmdt02B/pmdt02B.model';
import type { TaskResponse } from '../../../feature/pm/dt/pmdt02/pmdt02C/pmdt02C.model';
import { buildCalendarEvents } from '../../../feature/pm/dt/pmdt02/pmdt02.utils';

@Component({
  selector: 'app-sic-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SicCalendarComponent,
    SicDatepickerComponent,
    SicComboboxComponent,
    SicStripHtmlPipe,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './sic-calendar-view.component.html',
  styles: [`
    ::ng-deep .sic-calendar__sidebar,
    ::ng-deep .sic-calendar__sidebar-backdrop {
      display: none !important;
    }
  `],
})
export class SicCalendarViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private phaseService = inject(Pmdt02Service);
  private milestoneService = inject(Pmdt02AService);
  private wpService = inject(Pmdt02BService);
  private taskService = inject(Pmdt02CService);
  private holidayService = inject(HolidayService);
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);
  private sidebarService = inject(SicSidebarService);
  private customerState = inject(CustomerStateService);
  private projectService = inject(Pmrt02Service);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  private sub?: Subscription;

  allProjects = signal<PmCustomerProject[]>([]);
  selectedProjectId = signal<string>('ALL');
  selectedPhaseId = signal<string>('ALL');
  allLoadedPhases = signal<PhaseResponse[]>([]);

  phaseId = signal<string>('');
  projectId = signal<string>('');
  phase = signal<PhaseResponse | null>(null);
  availablePhases = signal<PhaseResponse[]>([]);
  isLoading = signal<boolean>(false);

  calendarEra = signal<SicCalendarEra>('BE');
  calendarView = signal<SicCalendarView>('grid');
  selectedCalendarDate = signal<string>(dayjs().format('YYYY-MM-DD'));
  isSidebarOpen = signal<boolean>(true);

  // Custom Items / Holidays / Leaves
  rawCustomItems = signal<any[]>([]);
  customHolidays = signal<SicCalendarHoliday[]>([]);
  customEvents = signal<SicCalendarEvent[]>([]);

  showCustomItemModal = signal<boolean>(false);
  customItemForm = {
    id: '',
    type: 'holiday' as 'holiday' | 'leave',
    date: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    title: '',
    description: '',
    icon: '📌',
    color: '#8b5cf6',
    leaveType: 'vacation' as 'vacation' | 'sick' | 'personal' | 'other',
    userId: '',
    userName: '',
  };

  memberApiUrl = '';
  currentUserId = '';
  currentUserName = '';
  memberOptions: { value: string; text: string }[] = [];

  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;

  filteredProjects = computed<PmCustomerProject[]>(() => {
    const all = this.allProjects();
    const ids = this.selectedProjectIds();
    if (!ids || ids.length === 0) return all;
    const idSet = new Set(ids);
    return all.filter((p) => idSet.has(p.id));
  });

  phasesToDisplay = computed<PhaseResponse[]>(() => {
    const selPhId = this.selectedPhaseId();
    const selProjId = this.selectedProjectId();
    const all = this.allLoadedPhases();
    const contextIds = this.selectedProjectIds();
    const hasContext = contextIds && contextIds.length > 0;
    const contextIdSet = hasContext ? new Set(contextIds) : null;

    if (selPhId !== 'ALL') {
      const found = all.find((p) => p.id === selPhId);
      if (found) return [found];
      const cur = this.phase();
      if (cur && cur.id === selPhId) return [cur];
      return [];
    }

    if (selProjId !== 'ALL') {
      const filtered = all.filter((p) => p.projectId === selProjId);
      if (filtered.length > 0) return filtered;
      const cur = this.phase();
      if (cur && cur.projectId === selProjId) return [cur];
      return [];
    }

    // When selProjId === 'ALL':
    if (contextIdSet) {
      const filtered = all.filter((p) => contextIdSet.has(p.projectId));
      if (filtered.length > 0) return filtered;
      const cur = this.phase();
      if (cur && contextIdSet.has(cur.projectId)) return [cur];
      return [];
    }

    if (all.length > 0) return all;
    const cur = this.phase();
    return cur ? [cur] : [];
  });

  pageTitle = computed(() => {
    const selPhId = this.selectedPhaseId();
    const selProjId = this.selectedProjectId();
    const contextIds = this.selectedProjectIds();

    if (selPhId !== 'ALL') {
      const ph = this.phasesToDisplay()[0] || this.phase();
      return ph?.phaseName || this.translate.instant('PMDT02_CALENDAR_HEADING') || 'Task Calendar';
    }

    if (selProjId !== 'ALL') {
      const proj = this.allProjects().find((p) => p.id === selProjId);
      return proj ? proj.projectName : 'Project Calendar';
    }

    if (contextIds && contextIds.length === 1) {
      const proj = this.allProjects().find((p) => p.id === contextIds[0]);
      if (proj) return proj.projectName;
    } else if (contextIds && contextIds.length > 1) {
      return `ปฏิทินงาน (${contextIds.length} โครงการที่เลือก)`;
    }

    return 'ปฏิทินงานทุกโครงการ (All Projects)';
  });

  constructor() {
    effect(() => {
      const contextIds = this.selectedProjectIds();
      const current = this.selectedProjectId();
      if (contextIds.length > 0 && current !== 'ALL' && !contextIds.includes(current)) {
        this.selectedProjectId.set('ALL');
        this.selectedPhaseId.set('ALL');
      }

      if (contextIds.length === 1) {
        const singleId = contextIds[0];
        const cached = this.allLoadedPhases().filter((p) => p.projectId === singleId);
        if (cached.length > 0) {
          this.availablePhases.set(cached);
        } else {
          this.phaseService.getPhases(singleId).subscribe((phases) => {
            this.availablePhases.set(phases || []);
          });
        }
      } else if (contextIds.length === 0 && current === 'ALL') {
        this.availablePhases.set([]);
      }
    });
  }

  updateCurrentMemberOption(): void {
    if (this.currentUserId && this.currentUserName) {
      const existing = this.memberOptions.find((m) => m.value === this.currentUserId);
      if (existing) {
        existing.text = this.currentUserName;
      } else {
        this.memberOptions = [{ value: this.currentUserId, text: this.currentUserName }, ...this.memberOptions];
      }
    }
  }

  ngOnInit(): void {
    const businessId = this.businessService.getCurrentBusinessId();
    this.memberApiUrl = businessId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;

    this.currentUserId = this.authService.getUserId() || '';
    const claims = this.authService.getIdentityClaims();
    if (claims?.name || claims?.preferred_username) {
      this.currentUserName = claims.name || claims.preferred_username;
      this.updateCurrentMemberOption();
    }
    this.sidebarService.getProfile().subscribe({
      next: (prof) => {
        if (prof?.id) this.currentUserId = prof.id;
        if (prof?.name) this.currentUserName = prof.name;
        this.updateCurrentMemberOption();
      },
      error: () => {},
    });

    this.loadAllProjects();

    this.sub = this.route.paramMap.subscribe((params) => {
      const pId = params.get('id') || '';
      this.phaseId.set(pId);
      this.route.queryParams.subscribe((qParams) => {
        const projId = qParams['projectId'] || '';
        this.projectId.set(projId);

        if (pId) {
          // Approach A: Started from specific phase
          this.selectedPhaseId.set(pId);
          this.loadPhaseDetail(pId);
          this.loadCustomItems();
          if (projId) {
            this.selectedProjectId.set(projId);
            this.phaseService.getPhases(projId).subscribe((phases) => {
              this.availablePhases.set(phases || []);
              this.cdr.markForCheck();
            });
          }
        } else {
          // Approach A: Opened from Sidebar -> View All Projects by default!
          this.selectedProjectId.set('ALL');
          this.selectedPhaseId.set('ALL');
          this.loadAllProjectsPhasesAndTasks();
          this.loadCustomItems();
        }
      });
    });
  }

  loadAllProjects(): void {
    const pageData = this.route.snapshot.data['pageData'];
    if (pageData?.projects && pageData.projects.length > 0) {
      this.allProjects.set(pageData.projects);
    } else {
      this.projectService.getProjects({ size: 200 }).subscribe({
        next: (res) => this.allProjects.set(res?.data || []),
        error: () => {},
      });
    }
  }

  loadAllProjectsPhasesAndTasks(): void {
    this.isLoading.set(true);
    this.projectService.getProjects({ size: 200 }).subscribe({
      next: (res) => {
        const projs = res?.data || [];
        this.allProjects.set(projs);
        if (projs.length === 0) {
          this.isLoading.set(false);
          this.cdr.markForCheck();
          return;
        }

        const requests = projs.map((p) =>
          this.phaseService.getPhases(p.id).pipe(
            catchError(() => of([] as PhaseResponse[]))
          )
        );

        forkJoin(requests).subscribe({
          next: (results) => {
            const allPhases = results.flat();
            this.allLoadedPhases.set(allPhases);
            this.isLoading.set(false);
            this.cdr.markForCheck();

            allPhases.forEach((ph) => {
              this.loadPhaseTree(ph);
            });
          },
          error: () => {
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadPhasesForProject(projectId: string): void {
    this.isLoading.set(true);
    this.phaseService.getPhases(projectId).subscribe({
      next: (phases) => {
        this.availablePhases.set(phases || []);
        phases?.forEach((ph) => this.loadPhaseTree(ph));
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onProjectFilterChange(projId: string): void {
    this.selectedProjectId.set(projId);
    this.selectedPhaseId.set('ALL');

    if (projId === 'ALL') {
      this.availablePhases.set([]);
      this.loadAllProjectsPhasesAndTasks();
    } else {
      this.loadPhasesForProject(projId);
    }
  }

  onPhaseFilterChange(phId: string): void {
    this.selectedPhaseId.set(phId);
    if (phId !== 'ALL') {
      const ph = this.allLoadedPhases().find((p) => p.id === phId);
      if (ph) {
        this.phase.set(ph);
        this.loadPhaseTree(ph);
      } else {
        this.loadPhaseDetail(phId);
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadPhaseDetail(phaseId: string): void {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (data: PhaseResponse) => {
        this.phase.set(data);
        this.updateLoadedPhase(data);
        if (data.projectId && this.selectedProjectId() === 'ALL') {
          this.selectedProjectId.set(data.projectId);
          this.phaseService.getPhases(data.projectId).subscribe((phases) => {
            this.availablePhases.set(phases || []);
            this.cdr.markForCheck();
          });
        }
        this.loadMilestones(phaseId);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private loadPhaseTree(ph: PhaseResponse): void {
    this.milestoneService.getMilestonesByPhaseId(ph.id).subscribe({
      next: (milestones) => {
        ph.milestones = milestones;
        this.updateLoadedPhase(ph);
        if (!milestones || milestones.length === 0) return;

        milestones.forEach((ms) => {
          this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
            next: (wps) => {
              ms.workPackages = wps;
              this.updateLoadedPhase(ph);
              if (!wps || wps.length === 0) return;

              wps.forEach((wp) => {
                this.taskService.getTasksByWorkPackageId(wp.id).subscribe({
                  next: (tasks) => {
                    wp.tasks = tasks;
                    this.updateLoadedPhase(ph);
                  },
                  error: () => {},
                });
              });
            },
            error: () => {},
          });
        });
      },
      error: () => {},
    });
  }

  private updateLoadedPhase(ph: PhaseResponse): void {
    const current = this.allLoadedPhases();
    const idx = current.findIndex((p) => p.id === ph.id);
    if (idx >= 0) {
      current[idx] = { ...ph };
      this.allLoadedPhases.set([...current]);
    } else {
      this.allLoadedPhases.set([...current, { ...ph }]);
    }
    if (this.phase()?.id === ph.id) {
      this.phase.set({ ...ph });
    }
    this.cdr.markForCheck();
  }

  loadMilestones(phaseId: string): void {
    this.milestoneService.getMilestonesByPhaseId(phaseId).subscribe({
      next: (milestones) => {
        const current = this.phase();
        if (current) {
          const updated = { ...current, milestones };
          this.phase.set(updated);
          this.updateLoadedPhase(updated);
          this.loadWorkPackagesForMilestones(milestones);
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error(err),
    });
  }

  private loadWorkPackagesForMilestones(milestones: MilestoneResponse[]): void {
    if (!milestones || milestones.length === 0) return;
    milestones.forEach((ms) => {
      this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
        next: (workPackages) => {
          const current = this.phase();
          if (current?.milestones) {
            const updatedMilestones = current.milestones.map((m) =>
              m.id === ms.id ? { ...m, workPackages: [...workPackages] } : m
            );
            const updated = { ...current, milestones: updatedMilestones };
            this.phase.set(updated);
            this.updateLoadedPhase(updated);
            this.cdr.markForCheck();
            workPackages.forEach((wp) => {
              this.loadTasksForWorkPackage(wp.id);
            });
          }
        },
        error: (err) => console.error(`Failed to load WPs for milestone ${ms.id}`, err),
      });
    });
  }

  private loadTasksForWorkPackage(wpId: string): void {
    const current = this.phase();
    if (!current?.milestones) return;
    this.taskService.getTasksByWorkPackageId(wpId).subscribe({
      next: (tasks) => {
        const latest = this.phase();
        if (!latest?.milestones) return;
        const updatedMilestones = latest.milestones.map((m) => {
          if (!m.workPackages) return m;
          const updatedWps = m.workPackages.map((wp) =>
            wp.id === wpId ? { ...wp, tasks: [...tasks] } : wp
          );
          return { ...m, workPackages: updatedWps };
        });
        const updated = { ...latest, milestones: updatedMilestones };
        this.phase.set(updated);
        this.updateLoadedPhase(updated);
        this.cdr.markForCheck();
      },
      error: (err) => console.error(`Failed to load tasks for WP ${wpId}`, err),
    });
  }

  goBack(): void {
    const pid = this.phaseId();
    const projId = this.projectId();
    if (pid) {
      this.router.navigate(['/feature/pm/phase', pid], {
        queryParams: { projectId: projId }
      });
    } else {
      this.location.back();
    }
  }

  // ===== CALENDAR DATA =====
  calendarTasks = computed<SicCalendarEvent[]>(() => {
    const phases = this.phasesToDisplay();
    const events: SicCalendarEvent[] = [];
    phases.forEach((p) => {
      events.push(...buildCalendarEvents(p));
    });
    return [...events, ...this.customEvents()];
  });

  calendarVisible = signal(true);

  triggerCalendarRefresh(): void {
    this.calendarVisible.set(false);
    setTimeout(() => {
      this.calendarVisible.set(true);
      this.cdr.markForCheck();
    });
  }

  calendarHolidays = computed<SicCalendarHoliday[]>(() => {
    this.holidayService.leavesChanged();
    const pId = this.phaseId() || '';
    const allSystemHolidays = this.holidayService.getAllCalendarHolidays(pId);

    const userLeavesAsHolidays: SicCalendarHoliday[] = this.holidayService.getUserLeaves().map((l) => ({
      id: `leave-${l.id}`,
      date: l.startDate,
      title: `🏖️ ลา: ${l.userName}`,
      source: 'office',
      color: '#ec4899',
      icon: '🏖️',
    }));

    const combined = [...allSystemHolidays, ...this.customHolidays(), ...userLeavesAsHolidays];
    const seen = new Set<string>();
    return combined.filter((h) => {
      const key = `${h.date}_${h.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  selectedDateItems = computed<CalendarItemDetail[]>(() => {
    const selDate = this.selectedCalendarDate();
    if (!selDate) return [];

    const items: CalendarItemDetail[] = [];
    const phases = this.phasesToDisplay();

    phases.forEach((p) => {
      if (p.startDate) {
        const start = this.toDateString(p.startDate);
        const end = this.toDateString(p.endDate) || start;
        if (selDate >= start && selDate <= end) {
          items.push({
            id: p.id,
            type: 'phase',
            title: `Phase: ${p.phaseName}`,
            subtitle: p.description || p.projectName || 'Phase หลัก',
            description: `${p.startDate} - ${p.endDate || ''}`,
            color: p.color || '#3b82f6',
            icon: '🚩',
            rawObject: p,
          });
        }
      }

      p.milestones?.forEach((ms) => {
        if (ms.dueDate) {
          const msDue = this.toDateString(ms.dueDate);
          if (selDate === msDue) {
            items.push({
              id: ms.id,
              type: 'milestone',
              title: ms.milestoneName,
              subtitle: ms.description || `Milestone กำหนดส่ง: ${ms.dueDate} (${p.phaseName})`,
              description: `สถานะ: ${ms.status || '-'}`,
              color: ms.color || '#eab308',
              icon: '📌',
              rawObject: ms,
            });
          }
        }

        ms.workPackages?.forEach((wp) => {
          if (wp.startDate) {
            const start = this.toDateString(wp.startDate);
            const end = this.toDateString(wp.endDate) || start;
            if (selDate >= start && selDate <= end) {
              items.push({
                id: wp.id,
                type: 'workpackage',
                title: wp.packageName,
                subtitle: wp.description || `Work Package (${wp.startDate} ถึง ${wp.endDate})`,
                description: `Milestone: ${ms.milestoneName} | สถานะ: ${wp.status || '-'}`,
                color: wp.color || '#a855f7',
                icon: '📦',
                rawObject: wp,
              });
            }
          }

          wp.tasks?.forEach((task) => {
            if (task.startDate) {
              const start = this.toDateString(task.startDate);
              const end = this.toDateString(task.endDate) || start;
              if (selDate >= start && selDate <= end) {
                items.push({
                  id: task.id,
                  type: 'task',
                  title: task.taskName,
                  subtitle: `WP: ${wp.packageName} | ผู้รับผิดชอบ: ${task.assignedTo || '-'}`,
                  description: task.description || `สถานะ: ${task.status || '-'}`,
                  color: task.color || '#3b82f6',
                  icon: '📝',
                  rawObject: { ...task, workPackageId: wp.id },
                });
              }
            }
          });
        });
      });
    });

    // Custom items on selected date
    this.rawCustomItems().forEach((cItem) => {
      const cStart = cItem.startDate || cItem.date;
      const cEnd = cItem.endDate || cStart;
      if (selDate >= cStart && selDate <= cEnd) {
        items.push({
          id: cItem.id,
          type: 'holiday',
          title: cItem.title,
          subtitle: cItem.description || 'กิจกรรม / วันหยุดกำหนดเอง',
          color: cItem.color || '#8b5cf6',
          icon: cItem.icon || '📌',
          isCustom: true,
          rawObject: cItem,
        });
      }
    });

    // Public Holidays & Leaves on selected date
    const holidayCheck = this.holidayService.checkHoliday(selDate, this.phaseId());
    if (holidayCheck.isHoliday && holidayCheck.type === 'public') {
      items.push({
        id: `pub-hol-${selDate}`,
        type: 'holiday',
        title: holidayCheck.name || 'วันหยุดนักขัตฤกษ์',
        subtitle: 'วันหยุดนักขัตฤกษ์ / ประเพณีไทย',
        color: '#ef4444',
        icon: '🎉',
        isCustom: false,
      });
    }

    const leaves = this.holidayService.getUserLeaves();
    leaves.forEach((l) => {
      const lStart = l.startDate;
      const lEnd = l.endDate || l.startDate;
      if (selDate >= lStart && selDate <= lEnd) {
        items.push({
          id: `leave-${l.id}`,
          type: 'holiday',
          title: `วันลา: ${l.userName}`,
          subtitle: `${l.leaveType.toUpperCase()} - ${l.remark || 'ลางาน'} (${l.startDate} ถึง ${l.endDate})`,
          color: '#ec4899',
          icon: '🏖️',
          isCustom: true,
          rawObject: l,
        });
      }
    });

    return items;
  });

  private toDateString(d: any): string {
    if (!d) return '';
    return typeof d === 'string' ? d.split('T')[0] : dayjs(d).format('YYYY-MM-DD');
  }

  // ===== STORAGE & CUSTOM ITEMS =====
  private getStorageKey(): string {
    return `sic_custom_calendar_items_${this.phaseId()}`;
  }

  loadCustomItems(): void {
    const key = this.getStorageKey();
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.rawCustomItems.set(parsed);
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
          this.cdr.markForCheck();
          return;
        }
      }
      this.rawCustomItems.set([]);
      this.customHolidays.set([]);
      this.customEvents.set([]);
      this.cdr.markForCheck();
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
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Failed to save custom calendar items', e);
    }
  }

  // ===== CALENDAR EVENT HANDLERS =====
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
      this.cdr.markForCheck();
    }
  }

  handleCalendarEventClick(event: any): void {
    const e = event.event || event;
    const date = e.date ? dayjs(e.date).format('YYYY-MM-DD') : this.selectedCalendarDate();
    this.selectedCalendarDate.set(date);
    this.isSidebarOpen.set(true);
    if (e.extra) {
      this.onSelectItem({
        id: e.extra.id || e.id,
        type: e.extra.type || 'task',
        title: e.title,
        color: e.color,
        icon: e.icon,
        rawObject: e.extra.raw || e.extra,
        isCustom: e.extra.isCustom,
      });
    }
  }

  handleCalendarHolidayClick(holiday: any): void {
    const h = holiday.holiday || holiday;
    const date = h.date ? dayjs(h.date).format('YYYY-MM-DD') : this.selectedCalendarDate();
    this.selectedCalendarDate.set(date);
    this.isSidebarOpen.set(true);
  }

  formatSelectedDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const d = dayjs(dateStr);
    return `${d.date()} ${d.locale('th').format('MMMM')} ${d.year() + 543}`;
  }

  closeDateSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  toggleDateSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  onSelectItem(item: CalendarItemDetail): void {
    const projectId = this.projectId();
    const phaseId = this.phaseId();

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
        this.router.navigate(['/feature/pm/workpackage', item.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        this.router.navigate(['/feature/pm/task', item.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: item.rawObject?.workPackageId || '' },
        });
        break;
      case 'holiday':
        if (item.isCustom && item.rawObject) {
          const isLeave = Boolean(item.rawObject.leaveType || item.id.startsWith('leave_') || item.id.startsWith('leave-'));
          this.customItemForm = {
            id: item.rawObject.id || '',
            type: isLeave ? 'leave' : 'holiday',
            date: item.rawObject.startDate || item.rawObject.date || this.selectedCalendarDate(),
            endDate: item.rawObject.endDate || item.rawObject.date || this.selectedCalendarDate(),
            title: item.rawObject.title || item.rawObject.userName || '',
            description: item.rawObject.description || item.rawObject.remark || '',
            icon: item.rawObject.icon || (isLeave ? '🏖️' : '📌'),
            color: item.rawObject.color || (isLeave ? '#ec4899' : '#8b5cf6'),
            leaveType: item.rawObject.leaveType || 'vacation',
            userId: item.rawObject.userId || (isLeave ? this.currentUserId : ''),
            userName: item.rawObject.userName || item.rawObject.title || (isLeave ? this.currentUserName : ''),
          };
          this.showCustomItemModal.set(true);
        }
        break;
    }
  }

  deleteCustomItem(id: string, event: Event): void {
    event.stopPropagation();
    if (id.startsWith('leave-') || id.startsWith('leave_')) {
      const rawId = id.replace('leave-', '');
      this.dialog.confirm(
        this.translate.instant('PMDT02_CONFIRM_DELETE_TITLE') || 'ยืนยันการลบ',
        'ต้องการลบรายการวันลานี้ใช่หรือไม่?'
      ).then((confirmed: boolean) => {
        if (confirmed) {
          this.holidayService.deleteUserLeave(rawId);
          this.loadCustomItems();
          this.triggerCalendarRefresh();
        }
      });
      return;
    }

    this.dialog.confirm(
      this.translate.instant('PMDT02_CONFIRM_DELETE_TITLE') || 'ยืนยันการลบ',
      this.translate.instant('PMDT02_CONFIRM_DELETE_ITEM') || 'ต้องการลบกิจกรรมนี้ใช่หรือไม่?'
    ).then((confirmed: boolean) => {
      if (confirmed) {
        const updated = this.rawCustomItems().filter((item) => item.id !== id);
        this.saveCustomItems(updated);
        this.triggerCalendarRefresh();
      }
    });
  }

  openAddCustomItemModal(dateStr?: string | null): void {
    const targetDate = dateStr || this.selectedCalendarDate() || dayjs().format('YYYY-MM-DD');
    this.customItemForm = {
      id: '',
      type: 'holiday',
      date: targetDate,
      endDate: targetDate,
      title: '',
      description: '',
      icon: '📌',
      color: '#8b5cf6',
      leaveType: 'vacation',
      userId: this.currentUserId,
      userName: this.currentUserName,
    };
    this.showCustomItemModal.set(true);
  }

  selectCustomItemType(type: 'holiday' | 'leave'): void {
    this.customItemForm.type = type;
    if (type === 'leave' && !this.customItemForm.userId) {
      this.customItemForm.userId = this.currentUserId;
      this.customItemForm.userName = this.currentUserName;
    }
  }

  onLeaveMemberChanged(item: any): void {
    if (item) {
      this.customItemForm.userId = item.value || '';
      this.customItemForm.userName = item.text || item.label || '';
    } else {
      this.customItemForm.userId = '';
      this.customItemForm.userName = '';
    }
  }

  closeCustomItemModal(): void {
    this.showCustomItemModal.set(false);
  }

  saveCustomItem(): void {
    if (this.customItemForm.type === 'leave') {
      const uName = (this.customItemForm.userName || this.customItemForm.title).trim();
      if (!uName && !this.customItemForm.userId) return;
      const newLeave: UserLeave = {
        id: this.customItemForm.id || `leave_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: this.customItemForm.userId || this.currentUserId || `user_${Date.now()}`,
        userName: uName || this.currentUserName || 'Team Member',
        startDate: this.customItemForm.date,
        endDate: this.customItemForm.endDate || this.customItemForm.date,
        leaveType: this.customItemForm.leaveType,
        remark: this.customItemForm.description,
      };
      this.holidayService.saveUserLeave(newLeave);
      this.loadCustomItems();
      this.selectedCalendarDate.set(this.customItemForm.date);
      this.isSidebarOpen.set(true);
      this.closeCustomItemModal();
      this.triggerCalendarRefresh();
      return;
    }

    if (!this.customItemForm.title.trim()) return;
    const currentItems = this.rawCustomItems();
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
    this.triggerCalendarRefresh();
  }
}
