import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Pmdt20Service } from './pmdt20.service';
import { PmInvoiceModel } from './pmdt20.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

@Component({
  selector: 'app-pmdt20',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt20.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt20Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt20Service);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  invoices = signal<PmInvoiceModel[]>([]);
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
      next: (res: any) => {
        this.invoices.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
      },
    });
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/invoice/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/invoice', id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/pmrt03'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
  }

  deleteInvoice(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบใบแจ้งหนี้นี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบใบแจ้งหนี้เรียบร้อย');
            this.loadData();
          },
          error: (err: any) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบใบแจ้งหนี้ได้');
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      UNPAID: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      OVERDUE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      UNPAID: 'ยังไม่ชำระ',
      PARTIAL: 'ชำระบางส่วน',
      PAID: 'ชำระครบถ้วน',
      OVERDUE: 'เกินกำหนดชำระ',
    };
    return map[status] || status;
  }
}