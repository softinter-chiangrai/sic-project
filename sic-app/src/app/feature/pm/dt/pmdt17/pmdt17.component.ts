import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt17AService } from './pmdt17A/pmdt17A.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt17',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt17.component.html',
  styleUrls: ['./pmdt17.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt17Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt17AService);

  currentPage = signal(0);
  pageSize = signal(10);

  ticketsResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/ma-tickets/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  ngOnInit() {}

  goToAdd() {
    this.router.navigate(['/feature/pm/ma-ticket/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/ma-ticket', id, 'edit']);
  }

  deleteTicket(id: string) {
    if (confirm('คุณต้องการลบตั๋ว MA นี้ใช่หรือไม่?')) {
      this.service.delete(id).subscribe({
        next: () => this.ticketsResource.reload(),
      });
    }
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700 border border-red-300 font-bold',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-slate-100 text-slate-700',
    };
    return map[severity] || 'bg-slate-100 text-slate-700';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
      WAITING_CUSTOMER: 'bg-yellow-100 text-yellow-700',
      RESOLVED: 'bg-emerald-100 text-emerald-700',
      CLOSED: 'bg-slate-200 text-slate-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }
}

export default Pmrt21Component;