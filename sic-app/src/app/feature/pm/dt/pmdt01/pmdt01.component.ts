// src/app/feature/pm/dt/pmdt01/pmdt01.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../core/services/dialog.service';
import { PhaseModel } from './pmdt01.model';
import { Pmdt01Service } from './pmdt01.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';
import { RecentItemsService } from '../../../../core/services/recent-items.service';

@Component({
  selector: 'app-pmdt01',
  standalone: true,
  imports: [CommonModule, SicStripHtmlPipe, TranslateModule],
  templateUrl: './pmdt01.component.html',
})
export class Pmdt01Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(Pmdt01Service);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private recentItems = inject(RecentItemsService);
  private translate = inject(TranslateService);

  // Kept for "create/edit phase" navigation context only — no longer used to filter the loaded list.
  projectId = signal<string>('');
  phases = signal<PhaseModel[]>([]);
  isLoading = signal(false);

  // ===== Navbar context filter (client-side) =====
  // Always load ALL phases of ALL projects; the navbar project-context selection filters what's shown.
  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;
  readonly filteredPhases = computed(() => {
    const ids = this.selectedProjectIds();
    const all = this.phases();
    if (!ids || ids.length === 0) return all;
    const idSet = new Set(ids);
    return all.filter((p) => idSet.has(p.projectId));
  });

  ngOnInit() {
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && Array.isArray(resolved)) {
      this.phases.set(resolved);
    } else {
      this.loadPhases();
    }

    this.route.queryParams.subscribe((params) => {
      // projectId is kept only to preselect the project when creating a new phase from context.
      this.projectId.set(params['projectId'] || '');
    });
  }

  loadPhases() {
    this.isLoading.set(true);
    this.phaseService.getPhases().subscribe({
      next: (data) => this.phases.set(data),
      error: (err) => {
        console.error(err);
        this.dialog.error(this.translate.instant('PMDT01_LOAD_FAIL_TITLE'), this.translate.instant('PMDT01_LOAD_FAIL_MSG'));
      },
      complete: () => this.isLoading.set(false),
    });
  }

  goToDetail(phaseId: string) {
    const phase = this.phases().find((p) => p.id === phaseId);
    if (phase) {
      this.recentItems.record({
        id: phase.id,
        label: phase.phaseName,
        type: 'phase',
        path: `/feature/pm/phase/${phaseId}`,
        queryParams: { projectId: this.projectId() },
        icon: 'bi-layers',
      });
    }
    this.router.navigate(['/feature/pm/phase', phaseId], {
      queryParams: { projectId: this.projectId() },
    });
  }

  openCreatePhase() {
    this.router.navigate(['/feature/pm/phase/new'], {
      queryParams: { projectId: this.projectId() },
    });
  }

  editPhase(phase: PhaseModel, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/phase', phase.id, 'edit'], {
      queryParams: { projectId: this.projectId() },
    });
  }

  deletePhase(phase: PhaseModel, event: Event) {
    event.stopPropagation();
    this.dialog
      .confirm(
        this.translate.instant('PMDT01_CONFIRM_DELETE_TITLE'),
        this.translate.instant('PMDT01_CONFIRM_DELETE_MSG', { name: phase.phaseName }),
      )
      .then((confirmed) => {
        if (confirmed) {
          this.phaseService.deletePhase(phase.id).subscribe({
            next: () => this.loadPhases(),
            error: (err) => this.dialog.error(this.translate.instant('PMDT01_DELETE_FAIL_TITLE'), err.message),
          });
        }
      });
  }

  // ===== Utility Methods =====
  getStatusClass(status?: string): string {
    if (!status) return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    const map: Record<string, string> = {
      'Not Started': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      'In Progress': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      Done: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      Delayed: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }

  getStatusText(status?: string): string {
    if (!status) return '';
    const map: Record<string, string> = {
      'Not Started': this.translate.instant('PMDT01_STATUS_NOT_STARTED'),
      'In Progress': this.translate.instant('PMDT01_STATUS_IN_PROGRESS'),
      Done: this.translate.instant('PMDT01_STATUS_DONE'),
      Delayed: this.translate.instant('PMDT01_STATUS_DELAYED'),
    };
    return map[status] || status;
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
}