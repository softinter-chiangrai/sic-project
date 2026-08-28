// src/app/feature/pm/dt/pmdt01/pmdt01.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';
import { PhaseModel } from './pmdt01.model';
import { Pmdt01Service } from './pmdt01.service';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';

@Component({
  selector: 'app-pmdt01',
  standalone: true,
  imports: [CommonModule, SicStripHtmlPipe],
  templateUrl: './pmdt01.component.html',
})
export class Pmdt01Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(Pmdt01Service);
  private dialog = inject(DialogService);

  projectId = signal<string>('');
  phases = signal<PhaseModel[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && Array.isArray(resolved)) {
      this.phases.set(resolved);
    }

    this.route.queryParams.subscribe((params) => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        if (!resolved || !Array.isArray(resolved)) {
          this.loadPhases();
        }
      } else {
        this.router.navigate(['/feature/pm/project']);
      }
    });
  }

  loadPhases() {
    this.isLoading.set(true);
    this.phaseService.getPhases(this.projectId()).subscribe({
      next: (data) => this.phases.set(data),
      error: (err) => {
        console.error(err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลด Phase ได้');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  goToDetail(phaseId: string) {
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
      .confirm('ยืนยันการลบ', `คุณต้องการลบ Phase "${phase.phaseName}" ใช่หรือไม่?`)
      .then((confirmed) => {
        if (confirmed) {
          this.phaseService.deletePhase(phase.id).subscribe({
            next: () => this.loadPhases(),
            error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
          });
        }
      });
  }

  // ===== Utility Methods =====
  getStatusClass(status?: string): string {
    if (!status) return 'bg-gray-100 text-gray-600';
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-700',
      Done: 'bg-emerald-100 text-emerald-700',
      Delayed: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status?: string): string {
    if (!status) return '';
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
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