import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Pmdt21Service } from './pmdt21.service';
import { PmMaTicketModel } from './pmdt21.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

@Component({
  selector: 'app-pmdt21',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt21.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt21Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt21Service);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  tickets = signal<PmMaTicketModel[]>([]);
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
        this.tickets.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/ma-ticket/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/ma-ticket', id, 'edit']);
  }

  deleteTicket(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบตั๋ว MA นี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบตั๋วแจ้งปัญหาเรียบร้อย');
            this.loadData();
          },
          error: (err: any) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบตั๋วได้');
          },
        });
      }
    });
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    };
    return map[severity] || 'bg-slate-100 text-slate-700';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      WAITING_CUSTOMER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      CLOSED: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'เปิดรับเรื่อง',
      IN_PROGRESS: 'กำลังดำเนินการ',
      WAITING_CUSTOMER: 'รอลูกค้าตรวจสอบ',
      RESOLVED: 'แก้ไขเรียบร้อย',
      CLOSED: 'ปิดตั๋ว',
    };
    return map[status] || status;
  }
}
