// src/app/core/component/sic-approval/sic-approval.component.ts

import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges,
    signal,
    computed,
    inject,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicInputAreaComponent } from '../sic-input-area/sic-input-area.component';

import { DialogService } from '../../services/dialog.service';
import { SicDatePipe } from '../../pipes/sic-date.pipe';
import { ApprovalService } from '../../../feature/pm/dt/pmdt03/approval.service';
import type { Approval } from '../../../feature/pm/dt/pmdt03/approval.model';
import type { Observable } from 'rxjs';

@Component({
    selector: 'sic-approval',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SicButtonComponent,
        SicInputAreaComponent,
        SicDatePipe,
    ],
    templateUrl: './sic-approval.component.html',
    styleUrls: ['./sic-approval.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicApprovalComponent implements OnInit, OnChanges {
    @Input() documentType!: string;
    @Input() documentId!: string;
    @Input() documentCode?: string;
    @Input() documentTitle?: string;
    @Input() version?: string;
    @Input() flowId?: string;
    @Input() autoLoad = true;

    @Output() statusChange = new EventEmitter<{ status: string; approval: Approval }>();
    @Output() actionTaken = new EventEmitter<{ action: string; approval: Approval }>();

    private readonly approvalService = inject(ApprovalService);
    private readonly dialogService = inject(DialogService);
    private readonly cdr = inject(ChangeDetectorRef);

    // ===== State =====
    protected isLoading = signal(false);
    protected approval = signal<Approval | null>(null);
    protected comment = signal('');
    protected isSubmitting = signal(false);

    // ===== Computed =====
    protected status = computed(() => this.approval()?.status ?? null);
    protected statusText = computed(() => this.approval()?.statusText ?? '-');
    protected statusColor = computed(() => this.approval()?.statusColor ?? '');
    protected steps = computed(() => this.approval()?.steps ?? []);
    protected logs = computed(() => this.approval()?.logs ?? []);
    protected currentStep = computed(() => this.approval()?.currentStep ?? null);

    protected canApprove = computed(() => this.approval()?.canApprove ?? false);
    protected canReject = computed(() => this.approval()?.canReject ?? false);
    protected canRevise = computed(() => this.approval()?.canRevise ?? false);
    protected canCancel = computed(() => this.approval()?.canCancel ?? false);

    protected hasAction = computed(() =>
        this.canApprove() || this.canReject() || this.canRevise() || this.canCancel()
    );

    protected isPending = computed(() =>
        this.status() === 'PENDING' || this.status() === 'PARTIALLY_APPROVED'
    );

    protected isFinal = computed(() =>
        this.status() === 'APPROVED' ||
        this.status() === 'REJECTED' ||
        this.status() === 'CANCELLED'
    );

    ngOnInit(): void {
        if (this.autoLoad && this.documentType && this.documentId) {
            this.loadApproval();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['documentId'] || changes['documentType']) {
            if (this.autoLoad && this.documentType && this.documentId) {
                this.loadApproval();
            }
        }
    }

    // ===== Load =====
    loadApproval(): void {
        if (!this.documentType || !this.documentId) return;

        this.isLoading.set(true);
        this.approvalService.getDocumentStatus(this.documentType, this.documentId).subscribe({
            next: (data) => {
                this.approval.set(data);
                this.isLoading.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading.set(false);
                this.approval.set(null);
                this.cdr.markForCheck();
            },
        });
    }

    refresh(): void {
        this.loadApproval();
    }

    // ===== Actions =====
    approve(): void {
        const approval = this.approval();
        if (!approval) return;

        this.dialogService
            .confirm('ยืนยันการอนุมัติ', `คุณต้องการอนุมัติเอกสาร "${approval.documentTitle || approval.documentCode}" ใช่หรือไม่?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.executeAction('approve', () =>
                        this.approvalService.approve(approval.id, this.comment())
                    );
                }
            });
    }

    reject(): void {
        const approval = this.approval();
        if (!approval) return;

        if (!this.comment()) {
            this.dialogService.warn('กรุณาใส่ความคิดเห็น', 'ต้องระบุเหตุผลในการปฏิเสธ');
            return;
        }

        this.dialogService
            .confirm('ยืนยันการปฏิเสธ', `คุณต้องการปฏิเสธเอกสาร "${approval.documentTitle || approval.documentCode}" ใช่หรือไม่?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.executeAction('reject', () =>
                        this.approvalService.reject(approval.id, this.comment())
                    );
                }
            });
    }

    requestRevision(): void {
        const approval = this.approval();
        if (!approval) return;

        if (!this.comment()) {
            this.dialogService.warn('กรุณาใส่ความคิดเห็น', 'ต้องระบุเหตุผลในการขอแก้ไข');
            return;
        }

        this.dialogService
            .confirm('ยืนยันการขอแก้ไข', `คุณต้องการขอให้แก้ไขเอกสาร "${approval.documentTitle || approval.documentCode}" ใช่หรือไม่?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.executeAction('revise', () =>
                        this.approvalService.requestRevision(approval.id, this.comment())
                    );
                }
            });
    }

    cancel(): void {
        const approval = this.approval();
        if (!approval) return;

        this.dialogService
            .confirm('ยืนยันการยกเลิก', `คุณต้องการยกเลิกการขออนุมัติเอกสาร "${approval.documentTitle || approval.documentCode}" ใช่หรือไม่?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.executeAction('cancel', () =>
                        this.approvalService.cancel(approval.id, this.comment())
                    );
                }
            });
    }

    // ===== Private =====
    private executeAction(action: string, apiCall: () => Observable<Approval>): void {
        this.isSubmitting.set(true);
        apiCall().subscribe({
            next: (result) => {
                this.approval.set(result);
                this.isSubmitting.set(false);
                this.comment.set('');
                this.statusChange.emit({ status: result.status, approval: result });
                this.actionTaken.emit({ action, approval: result });

                this.dialogService.success('ดำเนินการสำเร็จ', this.getSuccessMessage(action, result));
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.isSubmitting.set(false);
                this.dialogService.error('ดำเนินการไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
                this.cdr.markForCheck();
            },
        });
    }

    private getSuccessMessage(action: string, approval: Approval): string {
        const doc = approval.documentTitle || approval.documentCode || 'เอกสาร';
        switch (action) {
            case 'approve':
                return `อนุมัติ ${doc} เรียบร้อย`;
            case 'reject':
                return `ปฏิเสธ ${doc} เรียบร้อย`;
            case 'revise':
                return `ขอให้แก้ไข ${doc} เรียบร้อย`;
            case 'cancel':
                return `ยกเลิกการขออนุมัติ ${doc} เรียบร้อย`;
            default:
                return 'ดำเนินการสำเร็จ';
        }
    }

    // ===== Template Helpers =====
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

    getActionClass(action: string): string {
        const map: Record<string, string> = {
            SUBMIT: 'text-blue-500',
            APPROVE: 'text-emerald-500',
            REJECT: 'text-red-500',
            REVISE: 'text-amber-500',
            CANCEL: 'text-gray-500',
            DELEGATE: 'text-purple-500',
            RESUBMIT: 'text-indigo-500',
        };
        return map[action] || 'text-gray-500';
    }

    getActionIcon(action: string): string {
        const map: Record<string, string> = {
            SUBMIT: 'bi-send',
            APPROVE: 'bi-check2-circle',
            REJECT: 'bi-x-circle',
            REVISE: 'bi-pencil',
            CANCEL: 'bi-x-lg',
            DELEGATE: 'bi-person-arrow-right',
            RESUBMIT: 'bi-arrow-repeat',
        };
        return map[action] || 'bi-circle';
    }

    getActionLabel(action: string): string {
        const map: Record<string, string> = {
            SUBMIT: 'ส่งขออนุมัติ',
            APPROVE: 'อนุมัติ',
            REJECT: 'ปฏิเสธ',
            REVISE: 'ขอแก้ไข',
            CANCEL: 'ยกเลิก',
            DELEGATE: 'มอบหมาย',
            RESUBMIT: 'ส่งใหม่',
        };
        return map[action] || action;
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

    getStepStatusClass(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
            APPROVED: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
            REJECTED: 'border-red-400 bg-red-50 dark:bg-red-900/20',
            NEED_REVISION: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
            SKIPPED: 'border-gray-300 bg-gray-50 dark:bg-gray-800/50',
        };
        return map[status] || 'border-gray-200';
    }

    getStepIcon(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'bi-hourglass-split text-amber-500',
            APPROVED: 'bi-check2-circle text-emerald-500',
            REJECTED: 'bi-x-circle text-red-500',
            NEED_REVISION: 'bi-pencil text-orange-500',
            SKIPPED: 'bi-skip-forward text-gray-400',
        };
        return map[status] || 'bi-circle text-gray-300';
    }

    protected getStatusDisplay(status: string): string {
        return this.getStatusText(status);
    }

    protected getStatusClass(status: string): string {
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
}