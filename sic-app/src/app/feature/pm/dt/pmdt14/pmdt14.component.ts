import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Pmdt14AService } from './pmdt14A/pmdt14A.service';
import { PmDeliveryModel } from './pmdt14A/pmdt14A.model';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt14',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt14.component.html',
  styleUrls: ['./pmdt14.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt14Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt14AService);
  private readonly dialog = inject(DialogService);

  deliveries = signal<PmDeliveryModel[]>([]);
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
        this.deliveries.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
    });
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/delivery/new']);
  }

  goToView(id: string): void {
    this.router.navigate(['/feature/pm/delivery', id, 'view']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/delivery', id, 'edit']);
  }

  onDelete(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบเอกสารส่งมอบนี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบเอกสารส่งมอบเรียบร้อย');
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
      PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      READY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      DELIVERED: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ร่าง (Draft)',
      PREPARING: 'กำลังเตรียมงาน',
      READY: 'พร้อมส่งมอบ',
      DELIVERED: 'ส่งมอบแล้ว',
      CONFIRMED: 'ลูกค้ายืนยันรับมอบแล้ว',
    };
    return map[status] || status;
  }
}

export default Pmdt14Component;