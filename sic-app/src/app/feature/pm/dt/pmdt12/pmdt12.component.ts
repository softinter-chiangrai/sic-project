// src/app/feature/pm/dt/pmdt13/pmdt13.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, finalize, forkJoin, interval, Subject, takeUntil } from 'rxjs';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { resolveProjectId } from '../../../../core/utils/resolve-context.util';
import { PmTestCaseModel, PmTestScenarioModel } from './pmdt12.model';
import { Pmdt12Service } from './pmdt12.service';

export interface ScenarioGroup {
  scenario: PmTestScenarioModel | null; // null for unassigned / general test cases
  testCases: PmTestCaseModel[];
}

import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SicAiBatchModalComponent, AiBatchFieldDef } from '../../../../core/component/sic-ai-batch-modal/sic-ai-batch-modal.component';

@Component({
  selector: 'app-pmdt12',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, TranslateModule, SicAiBatchModalComponent],
  templateUrl: './pmdt12.component.html',
  styleUrls: ['./pmdt12.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt12Component implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt12Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private translate = inject(TranslateService);

  private destroy$ = new Subject<void>();
  private initialized = false;
  protected isSilentRefreshing = signal(false);

  constructor() {
    // Auto-reload when project selection in navbar changes
    effect(() => {
      this.selectedProjectIds(); // track signal dependency
      untracked(() => {
        if (this.initialized) {
          this.loadData(true);
        }
      });
    });
  }

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterTaskStatus = signal('all');
  protected filterTestType = signal<'All' | 'SIT' | 'UAT'>('All');
  protected isLoading = signal(false);
  protected isExportingUat = signal(false);
  protected showExportDropdown = signal(false);

  protected exportReportOptions = [
    {
      value: 'UAT',
      title: this.translate.instant('PMDT12_RPT_UAT_TITLE'),
      desc: this.translate.instant('PMDT12_RPT_UAT_DESC'),
      icon: 'bi-clipboard-check text-purple-600 dark:text-purple-400',
    },
    {
      value: 'SIT',
      title: this.translate.instant('PMDT12_RPT_SIT_TITLE'),
      desc: this.translate.instant('PMDT12_RPT_SIT_DESC'),
      icon: 'bi-flask text-sky-600 dark:text-sky-400',
    },
    {
      value: 'ALL',
      title: this.translate.instant('PMDT12_RPT_ALL_TITLE'),
      desc: this.translate.instant('PMDT12_RPT_ALL_DESC'),
      icon: 'bi-file-earmark-text text-indigo-600 dark:text-indigo-400',
    },
  ];

  // ===== Data =====
  protected scenarios = signal<PmTestScenarioModel[]>([]);
  protected testCases = signal<PmTestCaseModel[]>([]);
  protected projectTasks = signal<any[]>([]);

  // ===== Navbar context filter (client-side) =====
  // Always load ALL test cases/scenarios of ALL projects; the navbar project-context selection filters what's shown.
  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;
  protected filteredScenarios = computed(() => {
    const ids = this.selectedProjectIds();
    const all = this.scenarios();
    if (!ids || ids.length === 0) return all;
    const idSet = new Set(ids);
    return all.filter((s) => s.projectId != null && idSet.has(s.projectId));
  });
  protected filteredTestCases = computed(() => {
    const ids = this.selectedProjectIds();
    const all = this.testCases();
    if (!ids || ids.length === 0) return all;
    const idSet = new Set(ids);
    return all.filter((tc) => tc.projectId != null && idSet.has(tc.projectId));
  });

  // ===== AI Batch Create State =====
  protected showAiBatchModal = signal(false);
  protected aiBatchSaving = signal(false);
  protected aiBatchInitialPrompt = signal('');
  protected aiBatchAutoGenerate = signal(false);
  protected readonly aiBatchFields: AiBatchFieldDef[] = [
    { key: 'title', label: this.translate.instant('PMDT12_AI_FIELD_TITLE'), type: 'text' },
    { key: 'testStep', label: this.translate.instant('PMDT12_AI_FIELD_TEST_STEP'), type: 'textarea' },
    { key: 'expectedResult', label: this.translate.instant('PMDT12_AI_FIELD_EXPECTED_RESULT'), type: 'textarea' },
    { key: 'priority', label: this.translate.instant('PMDT12_AI_FIELD_PRIORITY'), type: 'text' },
    { key: 'testType', label: this.translate.instant('PMDT12_AI_FIELD_TEST_TYPE'), type: 'text' },
  ];

  // ===== Bug Modal State =====
  protected showBugModal = signal(false);
  protected isSubmittingBug = signal(false);
  protected bugTestCase = signal<PmTestCaseModel | null>(null);
  protected bugParentTask = signal<any | null>(null);
  protected bugForm = signal<{
    taskCode: string;
    taskName: string;
    priority: string;
    description: string;
    assignedTo: string | null;
    estimateManday: number;
    startDate: string;
    endDate: string;
  }>({
    taskCode: '',
    taskName: '',
    priority: 'High',
    description: '',
    assignedTo: null,
    estimateManday: 1,
    startDate: '',
    endDate: '',
  });

  // Business Member Combobox
  protected businessId = signal<string | null>(null);
  protected memberApiUrl = computed(() => {
    const bId = this.businessId();
    return bId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${bId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;
  });
  protected priorityApiUrl = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=PRIORITY`;

  // Track expanded accordion IDs ('unassigned' for null scenario)
  protected expandedScenarioIds = signal<Set<string>>(new Set());

  // Pagination for each scenario test case table (scenarioId -> pageNumber 1-based)
  protected scenarioPageMap = signal<Map<string, number>>(new Map());
  protected readonly pageSize = 10;

  // ===== Options =====
  readonly statusSelectOptions = [
    { value: 'Pass', text: this.translate.instant('PMDT12_STATUS_PASS') },
    { value: 'Fail', text: this.translate.instant('PMDT12_STATUS_FAIL') },
    { value: 'Blocked', text: this.translate.instant('PMDT12_STATUS_BLOCKED') },
    { value: 'Pending', text: this.translate.instant('PMDT12_STATUS_PENDING') },
  ];

  readonly prioritySelectOptions = [
    { value: 'High', text: this.translate.instant('PMDT12_PRIORITY_HIGH') },
    { value: 'Medium', text: this.translate.instant('PMDT12_PRIORITY_MEDIUM') },
    { value: 'Low', text: this.translate.instant('PMDT12_PRIORITY_LOW') },
  ];

  readonly taskStatusSelectOptions = [
    { value: 'Testing', text: '🧪 ' + this.translate.instant('PMDT12_TASK_STATUS_TESTING_OPT') },
    { value: 'In Progress', text: '🛠️ ' + this.translate.instant('PMDT12_TASK_STATUS_DEV_OPT') },
    { value: 'bugfix', text: '🚨 Bugfix' },
    { value: 'complete', text: '✅ ' + this.translate.instant('PMDT12_TASK_STATUS_COMPLETE_OPT') },
    { value: 'To Do', text: '📝 ' + this.translate.instant('PMDT12_TASK_STATUS_TODO_OPT') },
    { value: 'on hold', text: '⏸️ ' + this.translate.instant('PMDT12_TASK_STATUS_ONHOLD_OPT') },
  ];

  statusOptions = ['Pass', 'Fail', 'Blocked', 'Pending'];
  priorityOptions = ['High', 'Medium', 'Low'];

  // ===== Computed Counts for Test Types =====
  protected sitCount = computed(() => {
    return this.filteredTestCases().filter((tc) => (tc.testType || 'SIT').toUpperCase() === 'SIT').length;
  });

  protected uatCount = computed(() => {
    return this.filteredTestCases().filter((tc) => (tc.testType || 'SIT').toUpperCase() === 'UAT').length;
  });

  // ===== Computed Groups =====
  protected scenarioGroups = computed(() => {
    const rawScenarios = this.filteredScenarios();
    const rawTestCases = this.filteredTestCases();
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();
    const priority = this.filterPriority();
    const taskStatus = this.filterTaskStatus();
    const testTypeFilter = this.filterTestType();

    // 1. Filter test cases
    const filteredCases = rawTestCases.filter((tc) => {
      // Filter testType
      if (testTypeFilter !== 'All') {
        const tcType = (tc.testType || 'SIT').toUpperCase();
        if (tcType !== testTypeFilter) return false;
      }
      // Filter status
      if (status !== 'all' && (tc.testStatus || '').toLowerCase() !== status.toLowerCase()) {
        return false;
      }
      // Filter priority
      if (priority !== 'all' && (tc.priority || '').toLowerCase() !== priority.toLowerCase()) {
        return false;
      }
      // Filter taskStatus
      if (taskStatus === 'ready' || taskStatus === 'testing') {
        const ts = (this.getEffectiveTaskStatus(tc) || '').toLowerCase();
        if (ts !== 'testing' && ts !== 'ready') return false;
      } else if (taskStatus !== 'all') {
        if ((this.getEffectiveTaskStatus(tc) || '').toLowerCase() !== taskStatus.toLowerCase()) return false;
      }
      // Search keyword
      if (search) {
        const matchCode = (tc.testCaseCode || '').toLowerCase().includes(search);
        const matchTitle = (tc.title || '').toLowerCase().includes(search);
        const matchTester = (tc.tester || '').toLowerCase().includes(search);
        const matchStep = (tc.testStep || '').toLowerCase().includes(search);
        const matchScenario = (tc.scenarioName || '').toLowerCase().includes(search);
        if (!matchCode && !matchTitle && !matchTester && !matchStep && !matchScenario) {
          return false;
        }
      }
      return true;
    });

    // 2. Map test cases to scenario groups
    const map = new Map<string, PmTestCaseModel[]>();
    const unassigned: PmTestCaseModel[] = [];

    filteredCases.forEach((tc) => {
      if (tc.scenarioId) {
        if (!map.has(tc.scenarioId)) {
          map.set(tc.scenarioId, []);
        }
        map.get(tc.scenarioId)!.push(tc);
      } else {
        unassigned.push(tc);
      }
    });

    // 3. Build group list
    const groups: ScenarioGroup[] = [];

    // Filter scenarios matching search or containing filtered test cases
    rawScenarios.forEach((sc) => {
      const scId = sc.id!;
      const scType = (sc.testType || 'SIT').toUpperCase();

      // If testType filter active and scenario doesn't match and has no matched cases, skip
      if (testTypeFilter !== 'All' && scType !== testTypeFilter) {
        return;
      }

      const casesForThisSc = map.get(scId) || [];
      const matchScKeyword = search && (
        (sc.scenarioCode || '').toLowerCase().includes(search) ||
        (sc.scenarioName || '').toLowerCase().includes(search) ||
        (sc.id || '').toLowerCase().includes(search) ||
        (sc.description || '').toLowerCase().includes(search)
      );

      // Include scenario if it has matching test cases OR if scenario itself matches search (without status/priority filter active)
      if (casesForThisSc.length > 0 || (matchScKeyword && status === 'all' && priority === 'all') || (!search && status === 'all' && priority === 'all')) {
        groups.push({
          scenario: sc,
          testCases: casesForThisSc,
        });
      }
    });

    // Add unassigned group if there are test cases without scenario
    if (unassigned.length > 0) {
      groups.push({
        scenario: null,
        testCases: unassigned,
      });
    }

    return groups;
  });

  protected totalTestCases = computed(() => {
    return this.scenarioGroups().reduce((acc, g) => acc + g.testCases.length, 0);
  });

  protected totalScenarios = computed(() => {
    return this.scenarioGroups().filter((g) => g.scenario !== null).length;
  });

  // ===== Lifecycle =====
  ngOnInit() {
    this.initialized = true;
    const bId = localStorage.getItem('businessId');
    if (bId) {
      this.businessId.set(bId);
    }

    // อ่านสถานะ filter จาก query params เพื่อคงค่าไว้เมื่อ refresh หน้า
    const qp = this.route.snapshot.queryParams;
    if (qp['q'] !== undefined) this.searchTerm.set(qp['q']);
    if (qp['status'] !== undefined) this.filterStatus.set(qp['status']);
    if (qp['priority'] !== undefined) this.filterPriority.set(qp['priority']);
    if (qp['taskStatus'] !== undefined) this.filterTaskStatus.set(qp['taskStatus']);
    if (qp['type'] !== undefined) this.filterTestType.set(qp['type'] as 'All' | 'SIT' | 'UAT');

    // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Batch Create ทันที
    if (qp['aiAutoOpen'] === '1' && qp['aiModuleType'] === 'TEST_CASE') {
      this.aiBatchInitialPrompt.set(qp['aiPrompt'] || '');
      this.aiBatchAutoGenerate.set(true);
      this.showAiBatchModal.set(true);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { aiAutoOpen: null, aiModuleType: null, aiPrompt: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    this.loadData();

    // 1. Auto-refresh when navigating back to test management from other routes
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((e) => {
        if (e.urlAfterRedirects.includes('/feature/pm/test-management')) {
          this.loadData(true);
        }
      });

    // 2. Background live polling (every 8 seconds when active tab)
    interval(8000)
      .pipe(
        filter(
          () =>
            typeof document !== 'undefined' &&
            document.visibilityState === 'visible' &&
            !this.isLoading() &&
            !this.isSilentRefreshing()
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadData(true);
      });
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadData(true);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.loadData(true);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    this.loadData(false);
  }

  // ===== AI Batch Create =====
  onAiBatchSaved(rows: Record<string, any>[]): void {
    if (!rows.length) return;
    const projectId = resolveProjectId(this.route, this.customerState);

    this.aiBatchSaving.set(true);
    const saveRequests = rows.map((row) =>
      this.service.saveTestCase({
        projectId: projectId || undefined,
        title: row['title'],
        testStep: row['testStep'],
        expectedResult: row['expectedResult'],
        priority: row['priority'],
        testType: row['testType'],
        tester: row['tester'],
        testDate: row['testDate'],
        testStatus: 'Pending',
      }),
    );

    forkJoin(saveRequests)
      .pipe(finalize(() => this.aiBatchSaving.set(false)))
      .subscribe({
        next: () => {
          this.showAiBatchModal.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error('AI batch save failed', err);
        },
      });
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        priority: this.filterPriority() !== 'all' ? this.filterPriority() : null,
        taskStatus: this.filterTaskStatus() !== 'all' ? this.filterTaskStatus() : null,
        type: this.filterTestType() !== 'All' ? this.filterTestType() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  loadData(silent = false) {
    if (!silent) {
      this.isLoading.set(true);
    } else {
      this.isSilentRefreshing.set(true);
    }

    const projectId = resolveProjectId(this.route, this.customerState);

    const requests: any = {
      scenarios: this.service.getTestScenarios(),
      testCasesRes: this.service.getTestCases(undefined, null, 1, 1000, 'testCaseCode', 'ASC'),
    };

    if (projectId) {
      requests.tasks = this.service.getTasksByProjectId(projectId);
    } else {
      requests.tasks = this.service.getTasksByBusiness();
    }

    forkJoin(requests)
      .pipe(
        finalize(() => {
          if (!silent) this.isLoading.set(false);
          this.isSilentRefreshing.set(false);
        })
      )
      .subscribe({
        next: ({ scenarios, testCasesRes, tasks }: any) => {
          this.scenarios.set(scenarios || []);
          this.projectTasks.set(tasks || []);

          let tcs: PmTestCaseModel[] = [];
          if (testCasesRes && testCasesRes.data) {
            tcs = testCasesRes.data;
          } else if (Array.isArray(testCasesRes)) {
            tcs = testCasesRes;
          }

          // Synchronize task status:
          // A task should ONLY move to 'complete' if ALL test cases in the test scenario linked to that task have passed.
          const taskMap = new Map<string, PmTestCaseModel[]>();
          tcs.forEach((tc) => {
            if (tc.taskId) {
              const key = tc.taskId;
              if (!taskMap.has(key)) {
                taskMap.set(key, []);
              }
              taskMap.get(key)!.push(tc);
            }
          });

          taskMap.forEach((cases, taskId) => {
            const allPassed =
              cases.length > 0 &&
              cases.every((c) => {
                const st = (c.testStatus || '').toLowerCase();
                return (st === 'pass' || st === 'passed') && !this.hasActiveBug(c);
              });
            const anyFailed = cases.some((c) => {
              const st = (c.testStatus || '').toLowerCase();
              return st === 'fail' || st === 'failed' || this.hasActiveBug(c);
            });

            const targetStatus = allPassed ? 'complete' : anyFailed ? 'waiting fix' : 'testing';

            // Sync test cases taskStatus
            cases.forEach((tc) => {
              if (tc.id && (tc.taskStatus || '').toLowerCase() !== targetStatus) {
                tc.taskStatus = targetStatus;
                this.service.saveTestCase({ id: tc.id, taskStatus: targetStatus }).subscribe();
              }
            });

            // Sync parent Task in backend if needed
            this.service.getTaskById(taskId).subscribe({
              next: (taskRecord) => {
                if (taskRecord && taskRecord.id) {
                  const currentStatus = (taskRecord.status || '').toLowerCase();
                  if (currentStatus !== targetStatus) {
                    const isPrematureComplete =
                      (currentStatus === 'complete' || currentStatus === 'completed' || currentStatus === 'done') &&
                      !allPassed;
                    const shouldMoveToComplete = allPassed && currentStatus !== 'complete';
                    const shouldMoveToWaitingFix =
                      anyFailed && currentStatus !== 'waiting fix' && currentStatus !== 'bugfix';

                    if (isPrematureComplete || shouldMoveToComplete || shouldMoveToWaitingFix) {
                      this.service.updateTask(taskRecord.id, { ...taskRecord, status: targetStatus }).subscribe({
                        next: () => {
                          const currentTasks = this.projectTasks();
                          const idx = currentTasks.findIndex((t: any) => t.id === taskId);
                          if (idx !== -1) {
                            const updated = [...currentTasks];
                            updated[idx] = { ...updated[idx], status: targetStatus };
                            this.projectTasks.set(updated);
                          }
                        },
                      });
                    }
                  }
                }
              },
            });
          });

          this.testCases.set(tcs);

          // Expand all by default on first load
          if (this.expandedScenarioIds().size === 0) {
            const allIds = new Set<string>();
            (scenarios || []).forEach((s: any) => {
              if (s.id) allIds.add(s.id);
            });
            allIds.add('unassigned');
            this.expandedScenarioIds.set(allIds);
          }
        },
        error: (err) => {
          if (!silent) {
            console.error('Failed to load scenarios/test cases:', err);
            this.scenarios.set([]);
            this.testCases.set([]);
            this.projectTasks.set([]);
            this.dialog.error(
              this.translate.instant('PMDT12_LOAD_FAIL_TITLE'),
              err.error?.message || this.translate.instant('PMDT12_LOAD_FAIL_MSG')
            );
          }
        },
      });
  }

  getBugsForTestCase(testCase: PmTestCaseModel): any[] {
    const tcCode = (testCase.testCaseCode || '').trim().toUpperCase();
    if (!tcCode) return [];

    const tasks = this.projectTasks();
    return tasks.filter((t: any) => {
      if (t.isDelete) return false;
      const code = (t.taskCode || '').toUpperCase();
      const name = (t.taskName || '').toUpperCase();
      const desc = (t.description || '').toUpperCase();
      return (
        (name.includes(tcCode) || desc.includes(tcCode)) &&
        (code.startsWith('BUG-') || code.startsWith('BUG') || name.startsWith('[BUG]'))
      );
    });
  }

  getActiveBugsForTestCase(testCase: PmTestCaseModel): any[] {
    const bugs = this.getBugsForTestCase(testCase);
    return bugs.filter((t: any) => {
      const status = (t.status || '').toLowerCase();
      return status !== 'complete' && status !== 'completed';
    });
  }

  hasActiveBug(testCase: PmTestCaseModel): boolean {
    const tcCode = (testCase.testCaseCode || '').trim();
    if (!tcCode) return false;

    // Check if task status is currently bugfix
    const ts = (testCase.taskStatus || '').toLowerCase();
    if (ts === 'bugfix') return true;

    return this.getActiveBugsForTestCase(testCase).length > 0;
  }

  isPassedTest(testCase: PmTestCaseModel): boolean {
    const s = (testCase.testStatus || '').toLowerCase();
    return s === 'pass' || s === 'passed';
  }

  canExecuteTest(testCase: PmTestCaseModel): boolean {
    if (this.isPassedTest(testCase)) {
      return false;
    }
    if (this.hasActiveBug(testCase)) {
      return false;
    }
    // If testCase has a linked task, allow execution if in 'testing' or 'waiting fix'
    if (testCase.taskId) {
      const status = (this.getEffectiveTaskStatus(testCase) || testCase.taskStatus || '').toLowerCase();
      return status === 'testing' || status === 'waiting fix';
    }
    // If no task is linked, allow execution (general / regression test)
    return true;
  }

  getExecuteButtonDisabledTitle(testCase: PmTestCaseModel): string {
    if (this.hasActiveBug(testCase)) {
      return this.translate.instant('PMDT12_CANNOT_TEST_BUG_MSG');
    }
    const status = (this.getEffectiveTaskStatus(testCase) || testCase.taskStatus || '').toLowerCase();
    if (testCase.taskId && status !== 'testing' && status !== 'waiting fix') {
      return this.translate.instant('PMDT12_TASK_NOT_READY_MSG');
    }
    return this.translate.instant('PMDT12_SAVE_TEST_RESULT_TT');
  }

  // ===== Accordion Toggle =====
  isExpanded(scenarioId?: string | null): boolean {
    const key = scenarioId || 'unassigned';
    return this.expandedScenarioIds().has(key);
  }

  toggleAccordion(scenarioId?: string | null, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const key = scenarioId || 'unassigned';
    const current = new Set(this.expandedScenarioIds());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.expandedScenarioIds.set(current);
  }

  expandAll() {
    const all = new Set<string>();
    this.scenarios().forEach((s) => {
      if (s.id) all.add(s.id);
    });
    all.add('unassigned');
    this.expandedScenarioIds.set(all);
  }

  collapseAll() {
    this.expandedScenarioIds.set(new Set());
  }

  // ===== Scenario Pagination Helpers =====
  getScenarioPage(scenarioId?: string | null): number {
    const key = scenarioId || 'unassigned';
    return this.scenarioPageMap().get(key) || 1;
  }

  getScenarioTotalPages(totalItems: number): number {
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  setScenarioPage(scenarioId: string | null | undefined, page: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const key = scenarioId || 'unassigned';
    const current = new Map(this.scenarioPageMap());
    current.set(key, page);
    this.scenarioPageMap.set(current);
  }

  getPagedTestCases(testCases: PmTestCaseModel[], scenarioId?: string | null): PmTestCaseModel[] {
    const page = this.getScenarioPage(scenarioId);
    const startIndex = (page - 1) * this.pageSize;
    return testCases.slice(startIndex, startIndex + this.pageSize);
  }

  // ===== Filters =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  onFilterStatusChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  onFilterPriorityChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterPriority.set(val || 'all');
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  onFilterTaskStatusChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterTaskStatus.set(val || 'all');
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  setQuickFilterReady() {
    if (this.filterTaskStatus() === 'ready') {
      this.filterTaskStatus.set('all');
    } else {
      this.filterTaskStatus.set('ready');
    }
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  setFilterTestType(type: 'All' | 'SIT' | 'UAT') {
    this.filterTestType.set(type);
    this.scenarioPageMap.set(new Map());
    this.syncFiltersToUrl();
  }

  toggleExportDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showExportDropdown.update((v) => !v);
  }

  closeExportDropdown(): void {
    this.showExportDropdown.set(false);
  }

  onSelectExportType(type: string): void {
    this.closeExportDropdown();
    this.exportUatReport(type);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showExportDropdown()) {
      this.closeExportDropdown();
    }
  }

  private getResolvedProjectId(): string | null {
    if (this.customerState.getProjectId()) {
      return this.customerState.getProjectId();
    }
    const qProjectId = this.route.snapshot.queryParams['projectId'];
    if (qProjectId) {
      return qProjectId;
    }
    const selectedIds = this.selectedProjectIds();
    if (selectedIds && selectedIds.length === 1) {
      return selectedIds[0];
    }
    const visibleCases = this.filteredTestCases();
    if (visibleCases.length > 0) {
      const firstProjectId = visibleCases[0].projectId;
      if (firstProjectId && visibleCases.every((c) => !c.projectId || c.projectId === firstProjectId)) {
        return firstProjectId;
      }
    }
    const visibleScenarios = this.filteredScenarios();
    if (visibleScenarios.length > 0) {
      const firstProjectId = visibleScenarios[0].projectId;
      if (firstProjectId && visibleScenarios.every((s) => !s.projectId || s.projectId === firstProjectId)) {
        return firstProjectId;
      }
    }
    return null;
  }

  exportUatReport(testType: string = 'UAT') {
    const projectId = this.getResolvedProjectId();
    if (!projectId) {
      this.dialog.warn(this.translate.instant('PMDT12_NO_PROJECT_TITLE'), this.translate.instant('PMDT12_SELECT_PROJECT_FIRST_MSG'));
      return;
    }

    this.isExportingUat.set(true);
    this.service.exportUatReport(projectId, testType)
      .pipe(finalize(() => this.isExportingUat.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            // Fallback กรณีถูกบล็อก Popup
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Error exporting UAT report:', err);
          this.dialog.error(this.translate.instant('PMDT12_PRINT_FAILED_TITLE'), this.translate.instant('PMDT12_PRINT_FAILED_MSG'));
        }
      });
  }

  readyToTestCount = computed(() => {
    return this.filteredTestCases().filter((tc) => {
      const ts = (tc.taskStatus || '').toLowerCase();
      return ts === 'testing' || ts === 'ready';
    }).length;
  });

  // ===== Actions: Test Scenario =====
  goToAddScenario() {
    this.router.navigate(['/feature/pm/test-scenario/new']);
  }

  goToViewScenario(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.router.navigate(['/feature/pm/test-scenario', id, 'view']);
  }

  goToEditScenario(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.router.navigate(['/feature/pm/test-scenario', id, 'edit']);
  }

  exportScenarioReport(scenario: PmTestScenarioModel, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const projectId = scenario.projectId || this.getResolvedProjectId();
    if (!projectId) {
      this.dialog.warn(this.translate.instant('PMDT12_NO_PROJECT_TITLE'), this.translate.instant('PMDT12_SELECT_PROJECT_FIRST_MSG'));
      return;
    }

    const testType = scenario.testType || 'UAT';
    this.isExportingUat.set(true);
    this.service.exportUatReport(projectId, testType, scenario.id)
      .pipe(finalize(() => this.isExportingUat.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            // Fallback กรณีถูกบล็อก Popup
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Error exporting Scenario report:', err);
          this.dialog.error(this.translate.instant('PMDT12_PRINT_FAILED_TITLE'), this.translate.instant('PMDT12_PRINT_FAILED_MSG'));
        }
      });
  }

  deleteScenario(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.dialog
      .confirm(
        this.translate.instant('PMDT12_CONFIRM_DELETE_SCENARIO_TITLE'),
        this.translate.instant('PMDT12_CONFIRM_DELETE_SCENARIO_MSG')
      )
      .then((ok) => {
        if (ok) {
          this.service.deleteTestScenario(id).subscribe({
            next: () => {
              this.dialog.success(this.translate.instant('PMDT12_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT12_DELETE_SCENARIO_SUCCESS_MSG'));
              this.loadData();
            },
            error: (err) => {
              this.dialog.error(this.translate.instant('PMDT12_DELETE_FAILED_TITLE'), err.message || this.translate.instant('PMDT12_DELETE_ERROR_MSG'));
            },
          });
        }
      });
  }

  // ===== Actions: Test Case =====
  goToAddTestCase(scenarioId?: string, event?: MouseEvent) {
    if (event) event.stopPropagation();

    if (this.scenarios().length === 0) {
      this.dialog
        .confirm(
          this.translate.instant('PMDT12_NO_SCENARIO_YET_TITLE'),
          this.translate.instant('PMDT12_CREATE_SCENARIO_FIRST_MSG')
        )
        .then((ok) => {
          if (ok) {
            this.goToAddScenario();
          }
        });
      return;
    }

    if (scenarioId) {
      this.router.navigate(['/feature/pm/test-case/new'], {
        queryParams: { scenarioId },
      });
    } else {
      this.router.navigate(['/feature/pm/test-case/new']);
    }
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/test-case', id, 'edit']);
  }

  goToExecute(id: string) {
    this.router.navigate(['/feature/pm/test-execution', id]);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/test-case', id, 'view']);
  }

  goToTaskBoard(testCase: PmTestCaseModel, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const queryParams: Record<string, any> = {};
    let projectId = testCase.projectId;
    let taskId = testCase.taskId;
    let taskCode = testCase.taskCode;

    // Look up in loaded projectTasks if missing details
    const pTasks = this.projectTasks();
    if (pTasks && pTasks.length > 0) {
      const match = pTasks.find((t: any) =>
        (taskId && t.id === taskId) ||
        (taskCode && t.taskCode && t.taskCode.trim().toLowerCase() === taskCode.trim().toLowerCase())
      );
      if (match) {
        if (!projectId && match.projectId) projectId = match.projectId;
        if (!taskId && match.id) taskId = match.id;
        if (!taskCode && match.taskCode) taskCode = match.taskCode;
      }
    }

    if (!projectId && testCase.scenarioId) {
      const parentScenario = this.scenarios().find((s) => s.id === testCase.scenarioId);
      if (parentScenario?.projectId) {
        projectId = parentScenario.projectId;
      }
    }
    if (!projectId) {
      projectId = this.getResolvedProjectId() || undefined;
    }
    if (projectId) {
      queryParams['projectId'] = projectId;
    }
    if (taskId) {
      queryParams['taskId'] = taskId;
    }
    if (taskCode) {
      queryParams['taskCode'] = taskCode;
    }
    this.router.navigate(['/feature/pm/task-board'], { queryParams });
  }

  deleteTestCase(id: string) {
    this.dialog.confirm(this.translate.instant('PMDT12_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT12_CONFIRM_DELETE_TC_MSG')).then((ok) => {
      if (ok) {
        this.service.deleteTestCase(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT12_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT12_DELETE_TC_SUCCESS_MSG'));
            this.loadData();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT12_DELETE_FAILED_TITLE'), err.message || this.translate.instant('PMDT12_DELETE_ERROR_MSG'));
          },
        });
      }
    });
  }

  goToCreateBug(testCase: PmTestCaseModel, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const queryParams: Record<string, any> = {};
    const projectId = testCase.projectId || this.getResolvedProjectId();
    if (projectId) queryParams['projectId'] = projectId;
    if (testCase.id) queryParams['testCaseId'] = testCase.id;
    if (testCase.testCaseCode) queryParams['testCaseCode'] = testCase.testCaseCode;
    if (testCase.scenarioId) queryParams['scenarioId'] = testCase.scenarioId;
    if (testCase.taskId) queryParams['taskId'] = testCase.taskId;
    queryParams['returnUrl'] = '/feature/pm/test-management';

    this.router.navigate(['/feature/pm/bug/new'], { queryParams });
  }

  openBugModal(testCase: PmTestCaseModel, event?: Event): void {
    this.goToCreateBug(testCase, event);
  }

  // ===== Badges & Utilities =====
  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-800';
      case 'blocked':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
    }
  }

  getStatusText(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return this.translate.instant('PMDT12_STATUS_PASS');
      case 'fail':
      case 'failed':
        return this.translate.instant('PMDT12_STATUS_FAIL');
      case 'blocked':
        return this.translate.instant('PMDT12_STATUS_BLOCKED');
      case 'pending':
      default:
        return this.translate.instant('PMDT12_STATUS_WAITING_TEST');
    }
  }

  getStatusIcon(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return 'bi-check2-circle text-emerald-500';
      case 'fail':
      case 'failed':
        return 'bi-x-circle text-red-500';
      case 'blocked':
        return 'bi-exclamation-triangle text-amber-500';
      case 'pending':
      default:
        return 'bi-clock text-gray-400';
    }
  }

  getPriorityClass(priority?: string): string {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'high':
      case 'critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  formatDate(dateStr?: string): string {
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

  getEffectiveTaskStatus(testCase: PmTestCaseModel): string {
    const tcs = this.testCases();
    const taskCases = tcs.filter((c) => {
      const matchTask =
        (testCase.taskId && c.taskId === testCase.taskId) ||
        (testCase.taskCode &&
          c.taskCode &&
          c.taskCode.trim().toLowerCase() === testCase.taskCode.trim().toLowerCase());
      if (!matchTask) return false;

      // Group within the same test scenario if scenarioId is present
      if (testCase.scenarioId && c.scenarioId) {
        return c.scenarioId === testCase.scenarioId;
      }
      return true;
    });

    const relevantCases = taskCases.length > 0 ? taskCases : [testCase];

    // Check if ALL test cases for this task in the scenario have passed (and have no active bug)
    const allPassed =
      relevantCases.length > 0 &&
      relevantCases.every((c) => {
        const st = (c.testStatus || '').toLowerCase();
        return (st === 'pass' || st === 'passed') && !this.hasActiveBug(c);
      });

    // Check if ANY test case has failed or has an active bug
    const anyFailedOrBug = relevantCases.some((c) => {
      const st = (c.testStatus || '').toLowerCase();
      return st === 'fail' || st === 'failed' || this.hasActiveBug(c);
    });

    // 1. If any test case failed or has an active bug, task status MUST be waiting fix
    if (anyFailedOrBug) {
      return 'waiting fix';
    }

    // 2. If ALL test cases in the scenario linked to this task have passed, task status is complete
    if (allPassed) {
      return 'complete';
    }

    // 3. Otherwise (some passed or untested, but none failed)
    // The task CANNOT be complete yet!
    const pTasks = this.projectTasks();
    if (pTasks && pTasks.length > 0) {
      const match = pTasks.find(
        (t: any) =>
          (testCase.taskId && t.id === testCase.taskId) ||
          (testCase.taskCode &&
            t.taskCode &&
            t.taskCode.trim().toLowerCase() === testCase.taskCode.trim().toLowerCase())
      );
      if (match && match.status) {
        const liveStatus = (match.status || '').toLowerCase();
        // If live task was prematurely set to complete, display as testing because not all cases have passed!
        if (liveStatus === 'complete' || liveStatus === 'completed' || liveStatus === 'done') {
          return 'testing';
        }
        return match.status;
      }
    }

    const storedStatus = (testCase.taskStatus || '').toLowerCase();
    if (storedStatus === 'complete' || storedStatus === 'completed' || storedStatus === 'done') {
      return 'testing';
    }

    return testCase.taskStatus || 'To Do';
  }

  getTaskStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'testing') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse';
    }
    if (s === 'bugfix' || s === 'waiting fix') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700';
    }
    if (s === 'in progress') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
    }
    if (s === 'complete' || s === 'completed' || s === 'done') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
    }
    if (s === 'on hold') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }

  getTaskStatusLabel(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'testing') return '🧪 Testing';
    if (s === 'bugfix' || s === 'waiting fix') return '🚨 Waiting Fix';
    if (s === 'in progress') return '🛠️ In Progress';
    if (s === 'complete' || s === 'completed' || s === 'done') return '✅ Complete';
    if (s === 'on hold') return '⏸️ On Hold';
    if (s === 'to do' || s === 'todo') return '📝 To Do';
    return status || 'To Do';
  }

  getTestTypeClass(type?: string): string {
    const t = (type || 'SIT').toUpperCase();
    if (t === 'UAT') {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
    }
    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-300 dark:border-sky-800';
  }

  getTestTypeIcon(type?: string): string {
    const t = (type || 'SIT').toUpperCase();
    if (t === 'UAT') {
      return 'bi-clipboard-check';
    }
    return 'bi-flask';
  }
}

export default Pmdt12Component;