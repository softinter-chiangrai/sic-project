import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DesignReview, Pmdt09Service } from './pmdt09.service';

@Component({
  selector: 'app-pmdt09',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt09.component.html',
  styleUrls: ['./pmdt09.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt09Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt09Service);

  // ===== State =====
  protected projectId = signal<string | null>(null);
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterSeverity = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('reviewCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected expandedReview = signal<string | null>(null);

  // ===== Data =====
  protected reviews = signal<DesignReview[]>([]);
  protected totalElements = signal(0);

  // ===== Computed =====
  protected filteredReviews = computed(() => {
    const type = this.filterType();
    const severity = this.filterSeverity();

    let result = this.reviews();

    if (type !== 'all') {
      result = result.filter((r) => r.reviewableType === type);
    }

    if (severity !== 'all') {
      result = result.filter((r) => r.severity === severity);
    }

    return result;
  });

  protected paginatedReviews = computed(() => this.filteredReviews());

  protected totalItems = computed(() => this.totalElements());
  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);
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
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  typeOptions = ['Requirement', 'DFD', 'ER Diagram', 'Specification', 'UI Prototype', 'Test Case', 'User Manual'];
  severityOptions = ['Low', 'Medium', 'High'];

  // ===== Lifecycle =====
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['projectId']) {
        this.projectId.set(params['projectId']);
      }
      this.loadData();
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.service.getDesignReviews({
      projectId: this.projectId() || undefined,
      status: this.filterStatus(),
      keyword: this.searchTerm() || undefined,
      page: this.currentPage(),
      size: this.pageSize(),
    }).subscribe({
      next: (res) => {
        this.reviews.set(res.data || []);
        this.totalElements.set(res.total || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading design reviews:', err);
        this.isLoading.set(false);
      }
    });
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadData();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadData();
  }

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
  }

  onSeverityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterSeverity.set(select.value);
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
    this.loadData();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  toggleExpand(id: string) {
    this.expandedReview.set(this.expandedReview() === id ? null : id);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/design-review/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Open'];
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[severity] || map['Low'];
  }

  getCommentTypeClass(type: string): string {
    const map: Record<string, string> = {
      Suggestion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Correction: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Risk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Question: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      'Approval Note': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[type] || map['Suggestion'];
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

  formatDateTime(dateStr: string): string {
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

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }
}

export default Pmdt09Component;