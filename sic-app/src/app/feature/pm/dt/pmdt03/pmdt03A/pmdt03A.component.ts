// src/app/feature/pm/dt/pmdt03A/pmdt03A.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SicApprovalComponent } from '../../../../../core/component/sic-approval/sic-approval.component';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import type { Approval } from '../approval.model';
import { ApprovalService } from '../approval.service';
import { SicDatePipe } from "../../../../../core/pipes/sic-date.pipe";

@Component({
  selector: 'app-pmdt03A',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SicApprovalComponent,
    SicButtonComponent,
    SicCardComponent,
    SicInputComponent,
    SicDatePipe
],
  templateUrl: './pmdt03A.component.html',
  styleUrls: ['./pmdt03A.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt03AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly approvalService = inject(ApprovalService);
  private readonly dialogService = inject(DialogService);
  private readonly navigation = inject(NavigationService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ===== State =====
  protected approvalId = signal<string | null>(null);
  protected approval = signal<Approval | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);
  protected returnUrl = signal<string>('/feature/pm/pmdt03');

  // ===== Computed =====
  protected documentType = computed(() => this.approval()?.documentType ?? null);
  protected documentId = computed(() => this.approval()?.documentId ?? null);
  protected documentCode = computed(() => this.approval()?.documentCode ?? null);
  protected documentTitle = computed(() => this.approval()?.documentTitle ?? null);
  protected status = computed(() => this.approval()?.status ?? null);
  protected statusText = computed(() => this.approval()?.statusText ?? '-');
  protected statusClass = computed(() => this.approval()?.statusColor ?? '');

  protected canApprove = computed(() => this.approval()?.canApprove ?? false);
  protected canReject = computed(() => this.approval()?.canReject ?? false);
  protected canRevise = computed(() => this.approval()?.canRevise ?? false);
  protected canCancel = computed(() => this.approval()?.canCancel ?? false);

  // ===== CanDeactivate =====
  pageDirty = () => false;

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.approvalId.set(id);
        this.loadApproval(id);
      } else {
        this.error.set('ไม่พบรหัสการอนุมัติ');
        this.navigation.navigate(['/feature/pm/pmdt03']);
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl.set(params['returnUrl']);
      }
    });
  }

  // ===== Load =====
  loadApproval(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.approvalService.getApproval(id).subscribe({
      next: (data) => {
        this.approval.set(data);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'ไม่สามารถโหลดข้อมูลการอนุมัติได้');
        this.cdr.markForCheck();
      },
    });
  }

  // ===== Actions =====
  onStatusChange(event: { status: string; approval: Approval }): void {
    this.approval.set(event.approval);
    this.cdr.markForCheck();
  }

  onActionTaken(event: { action: string; approval: Approval }): void {
    // Handle action taken
    this.approval.set(event.approval);
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.navigation.navigate([this.returnUrl()]);
  }

  goToDocument(): void {
    const approval = this.approval();
    if (!approval) return;

    // Navigate to the document based on type
    const docType = approval.documentType.toLowerCase();
    const docId = approval.documentId;

    const routeMap: Record<string, string> = {
      requirement: '/feature/pm/requirement',
      specification: '/feature/pm/specification',
      delivery: '/feature/pm/delivery',
      invoice: '/feature/pm/invoice',
      change_request: '/feature/pm/change-request',
      ma_renewal: '/feature/pm/renewal',
      dfd: '/feature/pm/dfd',
      er: '/feature/pm/er',
      uat: '/feature/pm/uat',
      test_plan: '/feature/pm/test-plan',
    };

    const baseRoute = routeMap[docType] || '/feature/pm/pmdt03';
    this.navigation.navigate([baseRoute, docId, 'edit']);
  }

  // ===== Utility =====
  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bi-hourglass-split',
      PARTIALLY_APPROVED: 'bi-check2-all',
      APPROVED: 'bi-check2-circle',
      REJECTED: 'bi-x-circle',
      NEED_REVISION: 'bi-pencil',
      CANCELLED: 'bi-x-lg',
      EXPIRED: 'bi-clock',
    };
    return map[status] || 'bi-circle';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'รอดำเนินการ',
      PARTIALLY_APPROVED: 'อนุมัติบางส่วน',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
      EXPIRED: 'หมดอายุ',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      EXPIRED: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getDocumentTypeDisplay(type: string): string {
    const map: Record<string, string> = {
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
    return map[type] || type;
  }
}
