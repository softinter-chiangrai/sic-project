import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt18AService } from './pmdt18A/pmdt18A.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt18',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt18.component.html',
  styleUrls: ['./pmdt18.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt18Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt18AService);

  currentPage = signal(0);
  pageSize = signal(10);

  renewalsResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/ma-renewals/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  ngOnInit() {}

  goToAdd() {
    this.router.navigate(['/feature/pm/renewal/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/renewal', id, 'edit']);
  }

  deleteRenewal(id: string) {
    if (confirm('คุณต้องการลบข้อเสนอต่อสัญญานี้ใช่หรือไม่?')) {
      this.service.delete(id).subscribe({
        next: () => this.renewalsResource.reload(),
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700',
      PROPOSED: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 font-bold',
      REJECTED: 'bg-red-100 text-red-700',
      EXPIRED: 'bg-purple-100 text-purple-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }
}

export default Pmdt18Component;