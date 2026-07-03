// src/app/feature/pm/rt/pmrt04/pmrt04C/pmrt04C.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { ContractModel, Pmrt04AService } from '../pmrt04A/pmrt04A.component';


@Component({
  selector: 'app-pmrt04-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt04C.component.html',
  styles: [
    `
      .info-label {
        @apply text-xs text-[var(--text-muted)] uppercase tracking-wider;
      }
      .info-value {
        @apply text-sm font-medium text-[var(--text-active)] break-words;
      }
      .section-title {
        @apply text-lg font-semibold text-[var(--text-active)] mb-4 flex items-center gap-2;
      }
      .section-title i {
        @apply text-[var(--crm-primary)];
      }
      .detail-grid {
        @apply grid grid-cols-1 md:grid-cols-2 gap-4;
      }
      .detail-item {
        @apply flex flex-col gap-0.5;
      }
      .detail-item-full {
        @apply col-span-1 md:col-span-2;
      }
      .status-badge {
        @apply inline-block px-2.5 py-0.5 rounded-full text-xs font-medium;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class pmrt04CComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(Pmrt04AService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);

  protected contract = signal<ContractModel | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadContract(id);
      } else {
        this.dialog.error('ไม่พบรหัสสัญญา', 'กรุณาระบุรหัสสัญญา');
        this.navigation.navigate(['/feature/pm/pmrt04']);
      }
    });
  }

  loadContract(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service
      .getContract(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.contract.set(data);
        },
        error: (error) => {
          console.error('Load contract error:', error);
          this.error.set('ไม่สามารถโหลดข้อมูลสัญญาได้');
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญา');
          this.navigation.navigate(['/feature/pm/pmrt04']);
        },
      });
  }

  // ===== Navigation =====
  goBack(): void {
    const contract = this.contract();
    if (contract) {
      this.navigation.navigate(['/feature/pm/pmrt04'], {
        queryParams: { customerId: contract.customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/pmrt04']);
    }
  }

  goToEdit(): void {
    const contract = this.contract();
    if (contract?.id) {
      this.navigation.navigate(['/feature/pm/pmrt04', contract.id, 'edit'], {
        queryParams: {
          customerId: contract.customerId,
          projectId: contract.projectId,
        },
      });
    }
  }

  goToRenew(): void {
    const contract = this.contract();
    if (contract?.id) {
      this.navigation.navigate(['/feature/pm/pmrt04/renew', contract.id], {
        queryParams: {
          customerId: contract.customerId,
          projectId: contract.projectId,
        },
      });
    }
  }

  goToCustomer(): void {
    const contract = this.contract();
    if (contract?.customerId) {
      this.navigation.navigate(['/feature/pm/pmrt01']);
    }
  }

  goToProject(): void {
    const contract = this.contract();
    if (contract?.projectId) {
      this.navigation.navigate(['/feature/pm/pmrt03'], {
        queryParams: { projectId: contract.projectId },
      });
    }
  }

  // ===== Utility =====
  getStatusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status || 'Draft'] || map['Draft'];
  }

  getStatusText(status: string | undefined): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Sent: 'ส่งแล้ว',
      Signed: 'ลงนามแล้ว',
      Expired: 'หมดอายุ',
    };
    return map[status || 'Draft'] || status || '-';
  }

  getRenewalStatusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      ยังไม่ต่อ: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ต่อแล้ว: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      รอต่อ: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      ยกเลิก: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status || 'ยังไม่ต่อ'] || map['ยังไม่ต่อ'];
  }

  getRenewalStatusText(status: string | undefined): string {
    return status || 'ยังไม่ต่อ';
  }

  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '-';
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }

  isActive(isActive: boolean | undefined): string {
    return isActive ? '✅ เปิดใช้งาน' : '⛔ ปิดใช้งาน';
  }

  isActiveClass(isActive: boolean | undefined): string {
    return isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  }
  
}
