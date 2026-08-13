import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt20AService } from '../../dt/pmdt20A/pmdt20A.service';

@Component({
  selector: 'app-pmrt20A',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt20A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt21Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt20AService);

  currentPage = signal(0);
  pageSize = signal(10);

  paymentsResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/payments/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  ngOnInit() {}

  goToAdd() {
    this.router.navigate(['/feature/pm/payment/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/payment', id, 'edit']);
  }

  deletePayment(id: string) {
    if (confirm('คุณต้องการลบรายการชำระเงินนี้ใช่หรือไม่?')) {
      this.service.delete(id).subscribe({
        next: () => this.paymentsResource.reload(),
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-purple-100 text-purple-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }
}

export default Pmrt21Component;