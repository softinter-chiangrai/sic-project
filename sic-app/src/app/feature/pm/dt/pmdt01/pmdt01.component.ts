// src/app/feature/pm/dt/pmdt01/pmdt01.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  SicButtonComponent,
  SicCardComponent,
  SicFlexComponent,
  SicGridComponent,
  SicSpinnerComponent,
  SicTextComponent,
} from 'sic-ng';
import { DialogService } from '../../../../core/services/dialog.service';
import { Pmdt01Service } from './pmdt01.service';
import { PhaseModel } from './pmdt01.model';

@Component({
  selector: 'app-pmdt01',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SicButtonComponent,
    SicCardComponent,
    SicFlexComponent,
    SicGridComponent,
    SicSpinnerComponent,
    SicTextComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt01.component.html',
})
export class Pmdt01Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Pmdt01Service);
  private dialog = inject(DialogService);

  projectId = signal<string>('');
  phases = signal<PhaseModel[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        this.loadPhases(pid);
      } else {
        this.router.navigate(['/feature/pm/pmrt02']);
      }
    });
  }

  loadPhases(projectId: string) {
    if (!projectId) return;
    this.isLoading.set(true);
    this.error.set(null);
    this.service.getPhases(projectId).subscribe({
      next: (data) => {
        this.phases.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        this.isLoading.set(false);
      },
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
          this.service.deletePhase(phase.id).subscribe({
            next: () => {
              this.dialog.success('ลบ Phase สำเร็จ', '');
              this.loadPhases(this.projectId());
            },
            error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด'),
          });
        }
      });
  }

  getStatusClass(status?: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-700',
      Done: 'bg-emerald-100 text-emerald-700',
      Delayed: 'bg-red-100 text-red-700',
    };
    return map[status || ''] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status?: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
    };
    return map[status || ''] || status || '-';
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