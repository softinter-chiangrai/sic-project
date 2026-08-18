import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Pmdt18Service } from './pmdt18.service';
import { PmDeliveryModel } from './pmdt18.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

@Component({
  selector: 'app-pmdt18',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt18.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt18Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt18Service);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

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
    const projectId = this.customerState.getProjectId() || undefined;
    this.service.getPaging({ projectId, page: this.page(), size: this.size() }).subscribe({
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

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/delivery', id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/pmrt03'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
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
            this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบเอกสารได้');
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      PREPARING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      READY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      DELIVERED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ฉบับร่าง',
      PREPARING: 'กำลังเตรียมส่งมอบ',
      READY: 'พร้อมส่งมอบ',
      DELIVERED: 'ส่งมอบแล้ว',
      CONFIRMED: 'ลูกค้ายืนยันรับมอบแล้ว',
    };
    return map[status] || status;
  }
}