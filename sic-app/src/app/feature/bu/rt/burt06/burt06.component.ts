// sic-app/src/app/feature/bu/rt/burt06/burt06.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalFlow, Burt06Service } from './burt06.service';

@Component({
  selector: 'app-burt06',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent],
  templateUrl: './burt06.component.html',
  styleUrl: './burt06.component.css',
})
export class Burt06Component implements OnInit {
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private router = inject(Router);

  isLoading = signal(false);
  flows = signal<ApprovalFlow[]>([]);

  documentTypeMap: Record<string, string> = {
    REQUIREMENT: 'Requirement',
    SPECIFICATION: 'Specification',
    DFD: 'DFD',
    ER: 'ER Diagram',
    DELIVERY: 'Delivery',
    INVOICE: 'Invoice',
    MA_RENEWAL: 'MA Renewal',
    CHANGE_REQUEST: 'Change Request',
    TEST_PLAN: 'Test Plan',
    UAT: 'UAT',
  };

  ngOnInit(): void {
    this.loadFlows();
  }

  loadFlows(): void {
    this.isLoading.set(true);
    this.service.getFlows()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.flows.set(data),
        error: () => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Approval Flow'),
      });
  }

  openCreateForm(): void {
    this.router.navigate(['/feature/bu/burt06/new']);
  }

  openEditForm(flow: ApprovalFlow): void {
    this.router.navigate(['/feature/bu/burt06', flow.id, 'edit']);
  }

  deleteFlow(flow: ApprovalFlow): void {
    this.dialog.confirm(
      'ยืนยันการลบ',
      `คุณต้องการลบ Approval Flow "${flow.flowName}" (${flow.flowCode}) ใช่หรือไม่?`
    ).then((confirmed) => {
      if (confirmed && flow.id) {
        this.isLoading.set(true);
        this.service.deleteFlow(flow.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.flows.update((list) => list.filter((f) => f.id !== flow.id));
              this.dialog.success('ลบสำเร็จ', `ลบ Flow "${flow.flowName}" เรียบร้อย`);
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
      }
    });
  }

  getApprovalModeText(mode: string): string {
    const map: Record<string, string> = {
      CHAIN: 'เรียงลำดับ',
      PARALLEL: 'พร้อมกัน',
      ANY: 'ใครก็ได้',
      SINGLE: 'คนเดียว',
    };
    return map[mode] || mode;
  }

  getDocumentTypeText(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}