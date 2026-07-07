// src/app/core/component/sic-ganttchart/ganttchart.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';

export interface GanttTask {
  id: string;
  taskCode: string;
  taskName: string;
  projectId: string;
  projectName: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: string;
  priority?: string;
  estimateManday?: number;
  actualManday?: number;
}

@Component({
  selector: 'sic-ganttchart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ganttchart.component.html',
  styleUrls: ['./ganttchart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicGanttchartComponent {
  @Input() tasks: GanttTask[] = [];
  @Input() projectId?: string;
  @Input() phaseId?: string;
  @Input() isLoading = false;

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);

  // ===== Computed =====
  protected filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    let result = this.tasks;

    if (term) {
      result = result.filter(
        (t) =>
          t.taskCode.toLowerCase().includes(term) ||
          t.taskName.toLowerCase().includes(term) ||
          t.projectName.toLowerCase().includes(term) ||
          t.assignedTo.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    return result;
  });

  protected paginatedTasks = computed(() => {
    const all = this.filteredTasks();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredTasks().length);
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

  // ===== Date Range for Gantt (แก้ไขให้ปลอดภัย) =====
  protected dateRange = computed(() => {
    const tasks = this.filteredTasks();
    if (tasks.length === 0) {
      const now = new Date();
      return { min: now, max: now };
    }

    // กรองเฉพาะ task ที่มีวันที่ถูกต้อง
    const validTasks = tasks.filter((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime());
    });

    if (validTasks.length === 0) {
      const now = new Date();
      return { min: now, max: now };
    }

    let minDate = new Date(validTasks[0].startDate);
    let maxDate = new Date(validTasks[0].endDate);

    validTasks.forEach((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    });

    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);

    return { min: minDate, max: maxDate };
  });

  protected getDaysBetween = computed(() => {
    const range = this.dateRange();
    const diff = range.max.getTime() - range.min.getTime();
    if (isNaN(diff) || diff <= 0) {
      return 1; // fallback อย่างน้อย 1 วัน
    }
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  protected days = computed(() => {
    const count = Math.min(this.getDaysBetween(), 30);
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  protected Math = Math;

  // ===== Status Options =====
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Todo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Waiting Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Waiting Fix': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      Cancelled: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return map[status] || map['Todo'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Todo: 'รอเริ่ม',
      'In Progress': 'กำลังทำ',
      'Waiting Review': 'รอ Review',
      'Waiting Fix': 'รอแก้ไข',
      Done: 'เสร็จ',
      Delayed: 'ล่าช้า',
      Blocked: 'ติดปัญหา',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
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

  // ===== Gantt Helper (แก้ไขให้ปลอดภัย) =====
  getBarPosition(task: GanttTask): { left: number; width: number } {
    const range = this.dateRange();
    const totalDays = range.max.getTime() - range.min.getTime();
    if (totalDays <= 0) {
      return { left: 0, width: 100 };
    }

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { left: 0, width: 0 };
    }

    const left = ((start.getTime() - range.min.getTime()) / totalDays) * 100;
    const width = ((end.getTime() - start.getTime()) / totalDays) * 100;

    return {
      left: Math.max(0, Math.min(left, 100)),
      width: Math.max(1, Math.min(width, 100)),
    };
  }

  getBarColor(status: string): string {
    const map: Record<string, string> = {
      Todo: 'var(--crm-secondary)',
      'In Progress': 'var(--crm-primary)',
      'Waiting Review': 'var(--crm-warning)',
      'Waiting Fix': 'var(--crm-warning)',
      Done: 'var(--crm-success)',
      Delayed: 'var(--crm-danger)',
      Blocked: 'var(--crm-danger)',
      Cancelled: 'var(--text-muted)',
    };
    return map[status] || 'var(--crm-secondary)';
  }
}