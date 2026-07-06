// src/app/feature/pm/dt/pmdt01/pmdt01.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';

import { DrawerService } from '../../../../core/component/sic-drawer/drawer.service';
import type { PhaseResponse } from '../../../../core/model/phase.model';
import { PhaseService } from '../../../../core/services/phase.service';
import { Pmdt01AComponent } from './pmdt01A/pmdt01A.component';

@Component({
  selector: 'app-pmdt01',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pmdt01.component.html',
})
export class Pmdt01Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(PhaseService);
  private dialog = inject(DialogService);
  private drawerService = inject(DrawerService);

  projectId = signal<string>('');
  phases = signal<PhaseResponse[]>([]);
  isLoading = signal(false);

  // Tab switching
  viewMode = signal<'list' | 'gantt'>('list');

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        this.loadPhases();
      } else {
        this.router.navigate(['/feature/pm/pmrt02']);
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

  // เปิด Drawer สำหรับสร้าง Phase
  openCreatePhase() {
    this.drawerService.open({
      component: Pmdt01AComponent,
      title: 'สร้าง Phase ใหม่',
      inputs: {
        projectId: this.projectId(),
        isEdit: false,
      },
      width: '600px',
    });
  }

  // เปิด Drawer สำหรับแก้ไข Phase
  editPhase(phase: PhaseResponse, event: Event) {
    event.stopPropagation();
    this.drawerService.open({
      component: Pmdt01AComponent,
      title: 'แก้ไข Phase',
      inputs: {
        phaseId: phase.id,
        projectId: this.projectId(),
        isEdit: true,
        data: phase,
      },
      width: '600px',
    });
  }

  deletePhase(phase: PhaseResponse, event: Event) {
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

  // Utility
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-700',
      Done: 'bg-emerald-100 text-emerald-700',
      Delayed: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
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

  // Gantt helper (สำหรับแสดง Gantt View ง่ายๆ)
  getBarPosition(phase: PhaseResponse): { left: number; width: number } {
    // สมมติว่าเรามี startDate และ endDate
    // เราจะหา min/max ของทุก Phase
    const allDates = this.phases().flatMap((p) => [
      new Date(p.startDate).getTime(),
      new Date(p.endDate).getTime(),
    ]);
    if (allDates.length === 0) return { left: 0, width: 100 };
    const min = Math.min(...allDates);
    const max = Math.max(...allDates);
    const total = max - min || 1;
    const start = new Date(phase.startDate).getTime();
    const end = new Date(phase.endDate).getTime();
    return {
      left: ((start - min) / total) * 100,
      width: ((end - start) / total) * 100,
    };
  }
}
