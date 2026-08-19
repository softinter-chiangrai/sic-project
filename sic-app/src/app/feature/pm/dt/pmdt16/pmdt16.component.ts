import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt16AService } from './pmdt16A/pmdt16A.service';
import { PmInvoiceModel } from './pmdt16A/pmdt16A.model';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt16',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt16.component.html',
  styleUrls: ['./pmdt16.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt16Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt16AService);

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

export default Pmdt16Component;