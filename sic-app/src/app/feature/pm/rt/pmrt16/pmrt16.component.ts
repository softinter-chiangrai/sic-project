import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface TestCase {
  id: string;
  testCode: string;
  testPlan: string;
  module: string;
  scenario: string;
  testCase: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Pending';
  testType: 'Unit Test' | 'Integration Test' | 'System Test' | 'Acceptance Test / UAT';
  tester: string;
  testDate?: string;
  requirementId: string;
  requirementCode: string;
  specId: string;
  specCode: string;
  taskId: string;
  taskCode: string;
  bugId?: string;
  bugCode?: string;
  projectId: string;
  projectName: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_TEST_CASES: TestCase[] = [
  {
    id: '1',
    testCode: 'TC-CUS-001',
    testPlan: 'Test Plan v1.0',
    module: 'Customer Management',
    scenario: 'เพิ่มลูกค้าใหม่',
    testCase: 'กรอกข้อมูลลูกค้าครบถ้วนและบันทึก',
    steps: ['กรอกชื่อ', 'กรอก Tax ID', 'กด Save'],
    expectedResult: 'ระบบบันทึกข้อมูลสำเร็จ',
    actualResult: 'ระบบบันทึกข้อมูลสำเร็จ',
    status: 'Pass',
    testType: 'Unit Test',
    tester: 'สมศักดิ์ รุ่งเรือง',
    testDate: '2024-02-20 10:00:00',
    requirementId: '1',
    requirementCode: 'REQ-001',
    specId: '1',
    specCode: 'SPEC-001',
    taskId: '1',
    taskCode: 'TASK-001',
    bugId: '',
    bugCode: '',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-15 09:00:00',
  },
  {
    id: '2',
    testCode: 'TC-CUS-002',
    testPlan: 'Test Plan v1.0',
    module: 'Customer Management',
    scenario: 'เพิ่มลูกค้าใหม่',
    testCase: 'กรอก Tax ID ซ้ำ',
    steps: ['กรอกชื่อ', 'กรอก Tax ID ที่มีอยู่แล้ว', 'กด Save'],
    expectedResult: 'ระบบแจ้ง Error "Tax ID ซ้ำ"',
    actualResult: 'ระบบแจ้ง Error 500',
    status: 'Fail',
    testType: 'Integration Test',
    tester: 'สมศักดิ์ รุ่งเรือง',
    testDate: '2024-02-20 10:30:00',
    requirementId: '1',
    requirementCode: 'REQ-001',
    specId: '1',
    specCode: 'SPEC-001',
    taskId: '2',
    taskCode: 'TASK-002',
    bugId: '1',
    bugCode: 'BUG-001',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-15 09:30:00',
  },
  {
    id: '3',
    testCode: 'TC-LOG-001',
    testPlan: 'Test Plan v1.0',
    module: 'Login System',
    scenario: 'เข้าสู่ระบบ',
    testCase: 'กรอก Username/Password ถูกต้อง',
    steps: ['กรอก Username', 'กรอก Password', 'กด Login'],
    expectedResult: 'เข้าสู่ระบบสำเร็จ',
    actualResult: '',
    status: 'Pending',
    testType: 'System Test',
    tester: 'มานี มีทรัพย์',
    testDate: '',
    requirementId: '2',
    requirementCode: 'REQ-002',
    specId: '2',
    specCode: 'SPEC-002',
    taskId: '3',
    taskCode: 'TASK-003',
    bugId: '',
    bugCode: '',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-18 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt16',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt16.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt16Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('testCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected testCases = signal<TestCase[]>(MOCK_TEST_CASES);

  // ===== Computed =====
  protected filteredTestCases = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const type = this.filterType();
    const project = this.filterProject();

    let result = this.testCases();

    if (term) {
      result = result.filter(
        (t) =>
          t.testCode.toLowerCase().includes(term) ||
          t.module.toLowerCase().includes(term) ||
          t.projectName.toLowerCase().includes(term) ||
          t.tester.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    if (type !== 'all') {
      result = result.filter((t) => t.testType === type);
    }

    if (project !== 'all') {
      result = result.filter((t) => t.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof TestCase] ?? '';
      const bVal = b[sortField as keyof TestCase] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedTestCases = computed(() => {
    const all = this.filteredTestCases();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredTestCases().length);
  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  protected hasPrevious = computed(() => this.currentPage() > 1);
  protected hasNext = computed(() => this.currentPage() < this.totalPages());

  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: Math.min(total, 5) }, (_, i) => {
      const page = this.currentPage() + i - Math.floor(Math.min(total, 5) / 2);
      if (page < 1) return i + 1;
      if (page > total) return total - Math.min(total, 5) + i + 1;
      return page;
    });
  });

  protected Math = Math;

  // ===== Options =====
  statusOptions = ['Pass', 'Fail', 'Blocked', 'Pending'];
  typeOptions = ['Unit Test', 'Integration Test', 'System Test', 'Acceptance Test / UAT'];
  projectOptions = [
    { id: '1', name: 'ระบบ CRM' },
    { id: '2', name: 'ระบบ HR' },
  ];

  // ===== Lifecycle =====
  ngOnInit() {
    // TODO: เรียก API จริง
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
  }

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
  }

  onProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterProject.set(select.value);
    this.currentPage.set(1);
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/test-case/new']);
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

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Fail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Blocked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Pending'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pass: 'ผ่าน',
      Fail: 'ไม่ผ่าน',
      Blocked: 'ติดปัญหา',
      Pending: 'รอทดสอบ',
    };
    return map[status] || status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      Pass: 'bi-check2-circle text-emerald-500',
      Fail: 'bi-x-circle text-red-500',
      Blocked: 'bi-exclamation-triangle text-yellow-500',
      Pending: 'bi-clock text-gray-400',
    };
    return map[status] || 'bi-clock';
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}

export default Pmrt16Component;