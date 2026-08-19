import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Pmdt15AService } from './pmdt15A/pmdt15A.service';
import { PmUserManualModel } from './pmdt15A/pmdt15A.model';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt15',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt15.component.html',
  styleUrls: ['./pmdt15.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt15Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt15AService);
  private readonly dialog = inject(DialogService);

  manuals = signal<PmUserManualModel[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getPaging({ page: this.page(), size: this.size() }).subscribe({
      next: (res) => {
        this.manuals.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/manual/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/manual', id, 'edit']);
  }

  onDelete(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบระบุคู่มือนี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบคู่มือเรียบร้อยแล้ว');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      APPROVED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ฉบับร่าง (Draft)',
      REVIEW: 'รอตรวจสอบ (Review)',
      APPROVED: 'อนุมัติแล้ว (Approved)',
      PUBLISHED: 'เผยแพร่แล้ว (Published)',
    };
    return map[status] || status;
  }
}

export default Pmrt19Component;