import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt20Service } from '../../dt/pmdt20/pmdt20.service';
import { PmInvoiceModel } from '../../dt/pmdt20/pmdt20.model';

@Component({
  selector: 'app-pmrt20',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt20.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt20Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt20Service);

  currentPage = signal(0);
  pageSize = signal(10);

  invoicesResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/invoices/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  ngOnInit() {}

  goToAdd() {
    this.router.navigate(['/feature/pm/invoice/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'edit']);
  }

  deleteInvoice(id: string) {
    if (confirm('คุณต้องการลบใบแจ้งหนี้นี้ใช่หรือไม่?')) {
      this.service.delete(id).subscribe({
        next: () => this.invoicesResource.reload(),
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      UNPAID: 'bg-yellow-100 text-yellow-700',
      PARTIAL: 'bg-blue-100 text-blue-700',
      PAID: 'bg-emerald-100 text-emerald-700',
      OVERDUE: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }
}

export default Pmrt20Component;