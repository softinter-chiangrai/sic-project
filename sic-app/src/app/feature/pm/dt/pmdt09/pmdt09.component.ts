import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { Pmdt09Service } from './pmdt09.service';
import { DesignReview, ReviewComment, Pmdt09PageData } from './pmdt09.model';
import { ApprovalService } from '../pmdt03/approval.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { HttpClient } from '@angular/common/http';
import { SicButtonComponent } from 'sic-ng';
import { SicAiBatchModalComponent, AiBatchFieldDef } from '../../../../core/component/sic-ai-batch-modal/sic-ai-batch-modal.component';

import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicPaginationComponent } from '../../../../core/component/sic-pagination/sic-pagination.component';
import { SicBulkExportBarComponent } from '../../../../core/component/sic-bulk-export-bar/sic-bulk-export-bar.component';

@Component({
  selector: 'app-pmdt09',
  standalone: true,
  imports: [SicBulkExportBarComponent, CommonModule, RouterModule, FormsModule, TranslateModule, SicComboboxComponent, SicPaginationComponent, SicButtonComponent, SicAiBatchModalComponent],
  templateUrl: './pmdt09.component.html',
  styleUrls: ['./pmdt09.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt09Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt09Service);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(DialogService);
  private approvalService = inject(ApprovalService);
  private translate = inject(TranslateService);
  private customerState = inject(CustomerStateService);
  private http = inject(HttpClient);

  @ViewChild('modalFigmaIframe') modalFigmaIframe?: ElementRef<HTMLIFrameElement>;


  // ===== State =====
  protected projectId = signal<string | null>(null);
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterSeverity = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(12);
  protected sortBy = signal('reviewCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== AI Batch Create =====
  showAiBatchModal = signal(false);
  aiBatchSaving = signal(false);
  readonly aiBatchFields: AiBatchFieldDef[] = [
    { key: 'title', label: this.translate.instant('PMDT09_TITLE') || 'Title', type: 'text' },
    { key: 'description', label: this.translate.instant('PMDT09_DESCRIPTION') || 'Description', type: 'textarea' },
    { key: 'severity', label: this.translate.instant('PMDT09_SEVERITY') || 'Severity', type: 'text' },
  ];

  // ===== Card Comments Section State =====
  protected activeCommentCardId = signal<string | null>(null);
  protected newCommentText = signal<Record<string, string>>({});
  protected newCommentType = signal<Record<string, string>>({});
  protected isSubmittingComment = signal<Record<string, boolean>>({});

  // ===== Live Modal Preview State =====
  protected previewModalOpen = signal(false);
  protected selectedReviewForPreview = signal<DesignReview | null>(null);
  protected sanitizedModalFigmaUrl = signal<SafeResourceUrl | null>(null);
  protected isModalFigmaLoading = signal(false);
  protected isModalFullscreen = signal(false);

  // Cache for sanitized card embed URLs
  private sanitizedUrlsCache = new Map<string, SafeResourceUrl>();

  // ===== Data =====
  protected reviews = signal<DesignReview[]>([]);
  protected totalElements = signal(0);

  // ===== Navbar context filter (client-side) =====
  // The resolver/loadData now always fetch ALL projects' design reviews; the navbar
  // project-context selection filters what's shown, client-side, exactly like pmdt01.
  protected readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;

  // ===== Computed =====
  protected filteredReviews = computed(() => {
    const type = this.filterType();
    const severity = this.filterSeverity();
    const ids = this.selectedProjectIds();

    let result = this.reviews();

    if (type !== 'all') {
      result = result.filter((r) => r.reviewableType === type);
    }

    if (severity !== 'all') {
      result = result.filter((r) => r.severity === severity);
    }

    if (ids && ids.length > 0) {
      const idSet = new Set(ids);
      result = result.filter((r) => r.projectId && idSet.has(r.projectId));
    }

    return result;
  });

  // Client-side pagination over the filtered set (data is now fetched in one large
  // batch per loadData()/search/status change — see loadData()).
  // reviews ticked for export (sic-bulk-export-bar)
  protected selectedIds = signal<string[]>([]);
  protected isSelected = (id?: string | null) => !!id && this.selectedIds().includes(id);
  protected toggleSelected(id: string | null | undefined, checked: boolean): void {
    if (!id) return;
    this.selectedIds.update((ids) => (checked ? [...new Set([...ids, id])] : ids.filter((x) => x !== id)));
  }
  protected allOnPageSelected = computed(() => {
    const page = this.paginatedReviews().map((r: any) => r.id).filter(Boolean);
    return page.length > 0 && page.every((id: string) => this.selectedIds().includes(id));
  });
  protected toggleAllOnPage(checked: boolean): void {
    this.paginatedReviews().forEach((r: any) => this.toggleSelected(r.id, checked));
  }

  protected paginatedReviews = computed(() => {
    const all = this.filteredReviews();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredReviews().length);
  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

  // ===== Options =====
  readonly statusSelectOptions = [
    { value: 'Open', text: 'PMDT09_ST_OPEN' },
    { value: 'In Progress', text: 'PMDT09_ST_INPROGRESS' },
    { value: 'Resolved', text: 'PMDT09_ST_RESOLVED' },
    { value: 'Closed', text: 'PMDT09_ST_CLOSED' },
  ];

  readonly typeSelectOptions = [
    { value: 'Requirement', text: 'DOC_TYPE_REQUIREMENT' },
    { value: 'Specification', text: 'DOC_TYPE_SPECIFICATION' },
    { value: 'Diagram', text: 'DOC_TYPE_DIAGRAM' },
    { value: 'UI Prototype', text: 'DOC_TYPE_UI_PROTOTYPE' },
    { value: 'Test Case', text: 'DOC_TYPE_TEST_CASE' },
    { value: 'User Manual', text: 'DOC_TYPE_USER_MANUAL' },
  ];

  readonly severitySelectOptions = [
    { value: 'Low', text: 'PRIORITY_LOW' },
    { value: 'Medium', text: 'PRIORITY_MEDIUM' },
    { value: 'High', text: 'PRIORITY_HIGH' },
  ];

  statusOptions = ['Open', 'In Progress', 'Resolved', 'Changed', 'Closed'];
  typeOptions = ['Requirement', 'Specification', 'Diagram', 'UI Prototype', 'Test Case', 'User Manual'];
  severityOptions = ['Low', 'Medium', 'High'];
  commentTypeOptions = ['Suggestion', 'Correction', 'Risk', 'Question', 'Approval Note'];

  constructor() {
    // Keep the current page in range whenever filtering (type/severity/navbar project)
    // shrinks the result set.
    effect(() => {
      const pages = this.totalPages();
      if (this.currentPage() > pages) {
        this.currentPage.set(1);
      }
    });
  }

  // ===== Lifecycle =====
  ngOnInit() {
    // projectId is kept only to preselect the project when creating a new design review
    // from context — it is no longer used to filter the loaded list (see filteredReviews).
    const pageData: Pmdt09PageData = this.route.snapshot.data['pageData'];
    if (pageData) {
      if (pageData.projectId) {
        this.projectId.set(pageData.projectId);
      }
      this.reviews.set(pageData.reviews || []);
      this.totalElements.set(pageData.totalElements || 0);
      this.loadApprovalStatuses(pageData.reviews || []);
    }
  }

  loadData() {
    this.isLoading.set(true);
    // Always fetch ALL projects' design reviews; the navbar context-switcher filters
    // client-side via filteredReviews(). Status/keyword stay server-side since they
    // aren't part of the navbar project filter.
    this.service.getDesignReviews({
      status: this.filterStatus(),
      keyword: this.searchTerm() || undefined,
      page: 1,
      size: 1000,
    }).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.reviews.set(data);
        this.totalElements.set(res.pageable?.totalElements || data.length);
        this.isLoading.set(false);
        this.loadApprovalStatuses(data);
      },
      error: (err) => {
        console.error('Error loading design reviews:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadApprovalStatuses(reviews: DesignReview[]) {
    reviews.forEach((review) => {
      if (!review.id) return;
      this.approvalService.getDocumentStatus('DESIGN_REVIEW', review.id).subscribe({
        next: (approval) => {
          this.reviews.update((list) =>
            list.map((r) =>
              r.id === review.id ? { ...r, approvalStatus: approval.status } : r
            )
          );
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ ปล่อย null
        },
      });
    });
  }

  // ===== HTML String Cleaner =====
  cleanHtml(raw?: string): string {
    if (!raw) return '';
    const temp = document.createElement('div');
    temp.innerHTML = raw;
    return temp.textContent || temp.innerText || '';
  }

  // ===== Figma URL Converter & Embedder =====
  getSanitizedFigmaUrl(rawUrl?: string): SafeResourceUrl | null {
    if (!rawUrl || !rawUrl.trim()) return null;
    const key = rawUrl.trim();
    if (this.sanitizedUrlsCache.has(key)) {
      return this.sanitizedUrlsCache.get(key)!;
    }

    const clientId = environment.figma?.clientId ? `&client-id=${environment.figma.clientId}` : '';
    let target = key;
    if (!target.includes('figma.com/embed')) {
      const encoded = encodeURIComponent(target);
      target = `https://www.figma.com/embed?embed_host=softflow${clientId}&url=${encoded}`;
    } else if (environment.figma?.clientId && !target.includes('client-id=')) {
      target += `&client-id=${environment.figma.clientId}`;
    }

    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(target);
    this.sanitizedUrlsCache.set(key, safeUrl);
    return safeUrl;
  }

  // ===== Card Comments Toggle & Add =====
  toggleCardComments(reviewId: string) {
    this.activeCommentCardId.set(this.activeCommentCardId() === reviewId ? null : reviewId);
  }

  setCommentText(reviewId: string, text: string) {
    this.newCommentText.update((curr) => ({ ...curr, [reviewId]: text }));
  }

  addCardComment(reviewId: string) {
    const text = this.newCommentText()[reviewId]?.trim();
    if (!text) return;

    this.isSubmittingComment.update((curr) => ({ ...curr, [reviewId]: true }));

    this.service.addComment(reviewId, {
      commentText: text,
      commentType: 'General',
    }).subscribe({
      next: (createdComment: ReviewComment) => {
        this.isSubmittingComment.update((curr) => ({ ...curr, [reviewId]: false }));
        this.setCommentText(reviewId, '');

        // Update local review comments in state
        this.reviews.update((list) =>
          list.map((r) => {
            if (r.id === reviewId) {
              const updatedComments = [...(r.comments || []), createdComment];
              return { ...r, comments: updatedComments };
            }
            return r;
          })
        );
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.isSubmittingComment.update((curr) => ({ ...curr, [reviewId]: false }));
      },
    });
  }


  // ===== Live Modal Preview =====
  openLivePreview(review: DesignReview) {
    this.selectedReviewForPreview.set(review);
    if (review.figmaUrl) {
      this.isModalFigmaLoading.set(true);
      const safe = this.getSanitizedFigmaUrl(review.figmaUrl);
      this.sanitizedModalFigmaUrl.set(safe);
      setTimeout(() => {
        this.isModalFigmaLoading.set(false);
      }, 1000);
    } else {
      this.sanitizedModalFigmaUrl.set(null);
    }
    this.previewModalOpen.set(true);
  }

  closeLivePreview() {
    this.previewModalOpen.set(false);
    this.selectedReviewForPreview.set(null);
    this.sanitizedModalFigmaUrl.set(null);
    this.isModalFullscreen.set(false);
  }

  toggleModalFullscreen() {
    this.isModalFullscreen.set(!this.isModalFullscreen());
  }

  openExternalFigma(url?: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // ===== Embed API Controls =====
  sendModalFigmaCommand(commandType: string) {
    if (!this.modalFigmaIframe?.nativeElement?.contentWindow) {
      console.warn('Modal Figma Iframe not ready');
      return;
    }
    const message = { type: commandType };
    this.modalFigmaIframe.nativeElement.contentWindow.postMessage(message, 'https://www.figma.com');
  }

  modalNext() {
    this.sendModalFigmaCommand('next');
  }

  modalPrev() {
    this.sendModalFigmaCommand('prev');
  }

  modalRestart() {
    this.sendModalFigmaCommand('restart');
  }

  modalToggleHints() {
    this.sendModalFigmaCommand('toggleHints');
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadData();
  }

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.loadData();
  }

  onTypeChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterType.set(val || 'all');
  }

  onSeverityChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterSeverity.set(val || 'all');
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
    // Client-side pagination now — no refetch needed.
    this.currentPage.set(page);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/design-review/new']);
  }

  printReview(id: string) {
    this.service.printPdf(id).subscribe({
      error: () => this.dialog.error(this.translate.instant('PMDT09_PRINT_FAIL_TITLE'), this.translate.instant('PMDT09_PRINT_FAIL_MSG')),
    });
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'view']);
  }

  onDeleteDesignReview(review: DesignReview) {
    this.dialog.confirm(
      this.translate.instant('PMDT09_CONFIRM_DELETE_TITLE'),
      this.translate.instant('PMDT09_CONFIRM_DELETE_MSG', { code: review.reviewCode, title: review.title })
    ).then((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.service.deleteDesignReview(review.id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT09_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT09_DELETE_SUCCESS_MSG'));
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting design review:', err);
            this.dialog.error(this.translate.instant('PMDT09_DELETE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT09_DELETE_ERROR_MSG'));
            this.isLoading.set(false);
          }
        });
      }
    });
  }


  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
      Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
      Changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40',
      Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    };
    return map[status] || map['Open'];
  }

  getApprovalStatusClass(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    };
    return status ? map[status] || 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      PENDING: this.translate.instant('PMDT09_STATUS_PENDING'),
      APPROVED: this.translate.instant('PMDT09_STATUS_APPROVED'),
      REJECTED: this.translate.instant('PMDT09_STATUS_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT09_STATUS_NEED_REVISION'),
      CANCELLED: this.translate.instant('PMDT09_STATUS_CANCELLED'),
    };
    return status ? map[status] || '-' : '-';
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      High: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      Critical: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-200 font-bold',
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

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '-';
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

  resolveProjectId(): string | null {
    if (this.projectId()) return this.projectId();
    const navIds = this.customerState.currentSelectedProjectIds();
    if (navIds && navIds.length > 0) return navIds[0];
    const navProj = this.customerState.currentProjectId();
    if (navProj) return navProj;
    const list = this.reviews();
    if (list && list.length > 0 && list[0].projectId) return list[0].projectId;
    return null;
  }

  onAiBatchSaved(rows: Record<string, any>[]): void {
    if (!rows.length) return;
    const projId = this.resolveProjectId();
    if (!projId) {
      this.dialog.error(this.translate.instant('COMMON_ERROR_TITLE') || 'ข้อผิดพลาด', 'กรุณาเลือกโครงการก่อนสร้างข้อมูล');
      return;
    }

    this.aiBatchSaving.set(true);
    const saveRequests = rows.map((row) =>
      this.http.post(`${environment.apiBaseUrl}/api/pm/design-reviews`, {
        projectId: projId,
        title: row['title'],
        description: row['description'],
        severity: row['severity'] || 'Medium',
        reviewableType: 'Specification', // same default as the design review form (pmdt09A)
        status: 'Open',
      })
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
          this.dialog.error(this.translate.instant('COMMON_ERROR_TITLE') || 'บันทึกไม่สำเร็จ', err.error?.message || err.message || 'เกิดข้อผิดพลาดในการบันทึก');
        },
      });
  }
}

export default Pmdt09Component;

