// src/app/feature/pm/dt/pmdt13/pmdt13.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { PmTestCaseModel, PmTestScenarioModel } from './pmdt13.model';
import { Pmdt13Service } from './pmdt13.service';

export interface ScenarioGroup {
  scenario: PmTestScenarioModel | null; // null for unassigned / general test cases
  testCases: PmTestCaseModel[];
}

@Component({
  selector: 'app-pmdt13',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt13.component.html',
  styleUrls: ['./pmdt13.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt13Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt13Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterTaskStatus = signal('all');
  protected isLoading = signal(false);

  // ===== Data =====
  protected scenarios = signal<PmTestScenarioModel[]>([]);
  protected testCases = signal<PmTestCaseModel[]>([]);

  // Track expanded accordion IDs ('unassigned' for null scenario)
  protected expandedScenarioIds = signal<Set<string>>(new Set());

  // Pagination for each scenario test case table (scenarioId -> pageNumber 1-based)
  protected scenarioPageMap = signal<Map<string, number>>(new Map());
  protected readonly pageSize = 10;

  // ===== Options =====
  statusOptions = ['Pass', 'Fail', 'Blocked', 'Pending'];
  priorityOptions = ['High', 'Medium', 'Low'];

  // ===== Computed Groups =====
  protected scenarioGroups = computed(() => {
    const rawScenarios = this.scenarios();
    const rawTestCases = this.testCases();
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();
    const priority = this.filterPriority();
    const taskStatus = this.filterTaskStatus();

    // 1. Filter test cases
    const filteredCases = rawTestCases.filter((tc) => {
      // Filter status
      if (status !== 'all' && (tc.testStatus || '').toLowerCase() !== status.toLowerCase()) {
        return false;
      }
      // Filter priority
      if (priority !== 'all' && (tc.priority || '').toLowerCase() !== priority.toLowerCase()) {
        return false;
      }
      // Filter taskStatus
      if (taskStatus === 'ready') {
        const ts = (tc.taskStatus || '').toLowerCase();
        if (ts !== 'waiting review' && ts !== 'review') return false;
      } else if (taskStatus !== 'all') {
        if ((tc.taskStatus || '').toLowerCase() !== taskStatus.toLowerCase()) return false;
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
    return this.scenarios().length;
  });

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    const projectId = this.customerState.getProjectId();

    forkJoin({
      scenarios: this.service.getTestScenarios(projectId),
      testCasesRes: this.service.getTestCases(projectId, null, 0, 1000, 'testCaseCode', 'ASC'),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ scenarios, testCasesRes }) => {
          this.scenarios.set(scenarios || []);

          let tcs: PmTestCaseModel[] = [];
          if (testCasesRes && testCasesRes.content) {
            tcs = testCasesRes.content;
          } else if (Array.isArray(testCasesRes)) {
            tcs = testCasesRes;
          }
          this.testCases.set(tcs);

          // Expand all by default
          const allIds = new Set<string>();
          (scenarios || []).forEach((s) => {
            if (s.id) allIds.add(s.id);
          });
          allIds.add('unassigned');
          this.expandedScenarioIds.set(allIds);
        },
        error: (err) => {
          console.error('Failed to load scenarios/test cases:', err);
          this.scenarios.set([]);
          this.testCases.set([]);
        },
      });
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
  }

  clearSearch() {
    this.searchTerm.set('');
    this.scenarioPageMap.set(new Map());
  }

  onFilterStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.scenarioPageMap.set(new Map());
  }

  onFilterPriorityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterPriority.set(select.value);
    this.scenarioPageMap.set(new Map());
  }

  onFilterTaskStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterTaskStatus.set(select.value);
    this.scenarioPageMap.set(new Map());
  }

  setQuickFilterReady() {
    if (this.filterTaskStatus() === 'ready') {
      this.filterTaskStatus.set('all');
    } else {
      this.filterTaskStatus.set('ready');
    }
    this.scenarioPageMap.set(new Map());
  }

  readyToTestCount = computed(() => {
    return this.testCases().filter((tc) => {
      const ts = (tc.taskStatus || '').toLowerCase();
      return ts === 'waiting review' || ts === 'review';
    }).length;
  });

  // ===== Actions: Test Scenario =====
  goToAddScenario() {
    this.router.navigate(['/feature/pm/pmdt13/pmdt13B']);
  }

  goToEditScenario(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.router.navigate(['/feature/pm/pmdt13/pmdt13B', id, 'edit']);
  }

  deleteScenario(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.dialog
      .confirm(
        'ยืนยันการลบ Test Scenario',
        'ต้องการลบ Test Scenario นี้ใช่หรือไม่? (Test Cases ที่อยู่ใน Scenario จะยังคงอยู่แต่จะกลายเป็น Unassigned)'
      )
      .then((ok) => {
        if (ok) {
          this.service.deleteTestScenario(id).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'ข้อมูล Test Scenario ถูกลบเรียบร้อยแล้ว');
              this.loadData();
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการลบ');
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
          'ยังไม่มี Test Scenario',
          'ต้องสร้าง Test Scenario ขึ้นมาก่อนจึงจะสามารถสร้าง Test Case ได้ ต้องการสร้าง Test Scenario ตอนนี้หรือไม่?'
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

  deleteTestCase(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Test Case นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.service.deleteTestCase(id).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ข้อมูล Test Case ถูกลบเรียบร้อย');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ลบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการลบ');
          },
        });
      }
    });
  }

  quickCreateBugTask(testCase: PmTestCaseModel, event: MouseEvent) {
    event.stopPropagation();
    this.dialog
      .confirm(
        'สร้าง Bug Task',
        `ต้องการสร้าง Bug Task สำหรับ Test Case "${testCase.testCaseCode}" ไปยังหน้ารายการงาน (Task Board) หรือไม่?`
      )
      .then((ok) => {
        if (ok) {
          this.dispatchQuickBugTask(testCase);
        }
      });
  }

  private dispatchQuickBugTask(testCase: PmTestCaseModel) {
    if (testCase.taskId) {
      this.service.getTaskById(testCase.taskId).subscribe({
        next: (parentTask) => {
          this.executeCreateBugTask(testCase, parentTask);
        },
        error: () => {
          this.executeCreateBugTask(testCase, null);
        },
      });
    } else {
      this.executeCreateBugTask(testCase, null);
    }
  }

  private executeCreateBugTask(testCase: PmTestCaseModel, parentTask: any) {
    const todayStr = new Date().toISOString().split('T')[0];
    const bugCode = 'BUG-' + Math.floor(1000 + Math.random() * 9000);

    let desc = `<b>[BUG จากผลการทดสอบ: ${testCase.testCaseCode || ''}]</b><br/><br/>`;
    if (testCase.title) desc += `<b>หัวข้อ:</b> ${testCase.title}<br/>`;
    if (testCase.testStep) desc += `<b>ขั้นตอนการทดสอบ:</b><br/>${testCase.testStep}<br/>`;
    if (testCase.expectedResult) desc += `<b>ผลลัพธ์ที่คาดหวัง:</b><br/>${testCase.expectedResult}<br/>`;
    if (testCase.actualResult) desc += `<b>ผลลัพธ์ที่พบจริง:</b><br/>${testCase.actualResult}<br/>`;
    if (testCase.tester) desc += `<b>ผู้ทดสอบ:</b> ${testCase.tester}<br/>`;

    const taskPayload: any = {
      taskCode: bugCode,
      taskName: `[BUG] ${testCase.title || testCase.testCaseCode}`,
      description: desc,
      priority: testCase.priority === 'High' ? 'Critical' : (testCase.priority || 'High'),
      status: 'Waiting Fix',
      startDate: `${todayStr}T09:00:00Z`,
      endDate: `${todayStr}T18:00:00Z`,
      estimateManday: 1,
      workPackageId: parentTask?.workPackageId || null,
      specificationId: parentTask?.specificationId || null,
      assignedTo: parentTask?.assignedTo || null,
      assigneeIds: parentTask?.assigneeIds || [],
    };

    if (taskPayload.workPackageId) {
      this.service.createTask(taskPayload).subscribe({
        next: () => {
          this.dialog.success('สร้าง Bug สำเร็จ', `สร้าง Bug Task (${bugCode}) เข้าสู่ระบบ Task Board เรียบร้อยแล้ว`);
        },
        error: (err) => {
          this.dialog.error('สร้าง Bug ไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการสร้าง Task');
        },
      });
    } else {
      this.dialog.warn('ไม่สามารถสร้าง Bug ได้', 'Test Case นี้ไม่ได้ผูกกับ Task หรือ Work Package จึงไม่สามารถระบุตำแหน่งงานใน Task Board ได้');
    }
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
        return 'ผ่าน';
      case 'fail':
      case 'failed':
        return 'ไม่ผ่าน';
      case 'blocked':
        return 'ติดปัญหา';
      case 'pending':
      default:
        return 'รอทดสอบ';
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

  getTaskStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (['waiting review', 'review'].includes(s)) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse';
    }
    if (['waiting fix', 'blocked'].includes(s)) {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700';
    }
    if (['in progress', 'doing'].includes(s)) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
    }
    if (['done', 'completed'].includes(s)) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }

  getTaskStatusLabel(status?: string): string {
    const s = (status || '').toLowerCase();
    if (['waiting review', 'review'].includes(s)) return '⏳ พร้อมทดสอบ (Review)';
    if (['waiting fix', 'blocked'].includes(s)) return '🚨 รอแก้ไข (Fix)';
    if (['in progress', 'doing'].includes(s)) return '🛠️ กำลังพัฒนา';
    if (['done', 'completed'].includes(s)) return '✅ Done';
    return status || 'To Do';
  }
}

export default Pmdt13Component;