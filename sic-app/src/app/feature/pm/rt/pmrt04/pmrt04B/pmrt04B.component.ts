// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { environment } from '../../../../../../environments/environment';
import { ApprovalService } from '../../../dt/pmdt03/approval.service';
import type { ApprovalFlow } from '../../../dt/pmdt03/approval.model';
import { Pmrt02Service } from '../../pmrt02/pmrt02.service';
import { Pmrt01AService } from '../../pmrt01/pmrt01A/pmrt01A.service';
import { ContractModel } from '../pmrt04A/pmrt04A.model';
import { Pmrt04AService } from '../pmrt04A/pmrt04A.service';
import { DateTimeUtil } from '../../../../../core/utils/datetime.util';


@Component({
  selector: 'app-pmrt04-renew',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicInputAreaComponent,
    SicTiptapEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmrt04B.component.html',
})
export class Pmrt04BComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private service = inject(Pmrt04AService);
  private approvalService = inject(ApprovalService);
  private projectService = inject(Pmrt02Service);
  private customerService = inject(Pmrt01AService);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone); // ✅ ใช้ NgZone เพื่อบังคับ Change Detection

  form!: FormGroup;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;
  originalContract: ContractModel | null = null;

  // Customer & Project Display Names
  customerDisplayName = '';
  projectDisplayName = '';

  // Renewal Status Options for Combobox
  renewalStatusOptions = [
    { value: 'ต่อแล้ว', text: 'ต่อแล้ว' },
    { value: 'รอต่อ', text: 'รอต่อ' },
    { value: 'ยังไม่ต่อ', text: 'ยังไม่ต่อ' },
    { value: 'ยกเลิก', text: 'ยกเลิก' },
  ];

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;
  documenttypeapiUrl = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/MA_RENEWAL`;

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();
    this.loadFlows();

    // Check queryParams for projectId
    this.route.queryParams.subscribe((queryParams) => {
      const qProjectId = queryParams['projectId'];
      if (qProjectId) {
        this.fetchProjectName(qProjectId);
      }
    });

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.contractId = id;
        this.loadContract(id);
      } else {
        this.dialog.error('ไม่พบรหัสสัญญา', 'กรุณาระบุรหัสสัญญา');
        this.navigation.navigate(['/feature/pm/pmrt04']);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group(
      {
        newContractNo: ['', Validators.required],
        newStartDate: [null, Validators.required],
        newEndDate: [null, Validators.required],
        newContractValue: [null, [Validators.required, Validators.min(0)]],
        renewalRemark: [''],
        renewalStatus: ['ต่อแล้ว'],
        approvalFlowId: [null],
      },
      { validators: this.dateRangeValidator.bind(this) },
    );
  }

  private computeRenewalContractNo(originalContractNo: string): string {
    if (!originalContractNo) return '';
    const match = originalContractNo.match(/^(.*?)-R(\d+)$/i);
    if (match) {
      const base = match[1];
      const seq = parseInt(match[2], 10) + 1;
      return `${base}-R${seq}`;
    }
    if (originalContractNo.endsWith('-R') || originalContractNo.endsWith('-r')) {
      const base = originalContractNo.substring(0, originalContractNo.length - 2);
      return `${base}-R1`;
    }
    return `${originalContractNo}-R1`;
  }

  loadFlows(): void {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('MA_RENEWAL')
      .pipe(
        finalize(() => {
          this.isLoadingFlows = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (flows) => {
          this.flows = flows || [];
          if (this.flows.length === 1 && !this.selectedFlowId) {
            this.selectedFlowId = this.flows[0].id;
            this.form.patchValue({ approvalFlowId: this.flows[0].id });
          }
          this.cdr.detectChanges();
        },
        error: () => {
          console.warn('ไม่สามารถโหลด Approval Flow สำหรับ MA_RENEWAL');
        },
      });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('newStartDate')?.value;
    const end = group.get('newEndDate')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { endDateInvalid: 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่ม' };
    }
    return null;
  }

  loadContract(id: string): void {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(
        finalize(() => {
          // ✅ ใช้ NgZone.run() เพื่อให้ Angular รับรู้การเปลี่ยนแปลงทันที
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (data) => {
          this.originalContract = data;
          this.resolveCustomerAndProjectNames(data);

          const currentEndDate = new Date(data.endDate);
          const newStartDate = new Date(currentEndDate);
          newStartDate.setDate(newStartDate.getDate() + 1);
          const newEndDate = new Date(newStartDate);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);

          this.form.patchValue({
            newContractNo: this.computeRenewalContractNo(data.contractNo),
            newStartDate: newStartDate.toISOString().split('T')[0],
            newEndDate: newEndDate.toISOString().split('T')[0],
            newContractValue: data.contractValue,
            renewalStatus: 'ต่อแล้ว',
          });

          this.form.markAsPristine();
          // ✅ อัปเดต View หลังจาก patchValue
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Load contract error:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญา');
          this.navigation.navigate(['/feature/pm/pmrt04']);
        },
      });
  }

  private resolveCustomerAndProjectNames(contract: ContractModel): void {
    // 1. Check direct properties from contract API response
    if (contract.projectName) {
      this.projectDisplayName = contract.projectName;
    } else if (this.customerState.getProjectName()) {
      this.projectDisplayName = this.customerState.getProjectName();
    }

    if (contract.customerName) {
      this.customerDisplayName = contract.customerName;
    } else if (this.customerState.getCustomerName()) {
      this.customerDisplayName = this.customerState.getCustomerName();
    }

    // 2. Fetch Project if projectId exists and projectName is not yet resolved
    if (contract.projectId && !this.projectDisplayName) {
      this.fetchProjectName(contract.projectId);
    }

    // 3. Fetch Customer if customerId exists and not already resolved
    if (contract.customerId && !this.customerDisplayName) {
      this.fetchCustomerName(contract.customerId);
    }
  }

  private fetchProjectName(projectId: string): void {
    if (!projectId) return;
    this.projectService.getProject(projectId).subscribe({
      next: (proj) => {
        if (proj) {
          this.ngZone.run(() => {
            this.projectDisplayName = proj.projectName || proj.projectCode || projectId;
            if (proj.customerName && !this.customerDisplayName) {
              this.customerDisplayName = proj.customerName;
            } else if (proj.customerId && !this.customerDisplayName) {
              this.fetchCustomerName(proj.customerId);
            }
            this.cdr.detectChanges();
          });
        }
      },
      error: () => {
        if (!this.projectDisplayName) {
          this.projectDisplayName = projectId;
          this.cdr.detectChanges();
        }
      },
    });
  }

  private fetchCustomerName(customerId: string): void {
    this.customerService.getCustomer(customerId).subscribe({
      next: (cust) => {
        if (cust) {
          this.ngZone.run(() => {
            this.customerDisplayName =
              cust.companyNameLocal || cust.companyNameEn || cust.customerCode || customerId;
            this.cdr.detectChanges();
          });
        }
      },
      error: () => {
        if (!this.customerDisplayName) {
          this.customerDisplayName = customerId;
          this.cdr.detectChanges();
        }
      },
    });
  }

  // ✅ เมธอดสำหรับนำทางกลับไปหน้ารายการสัญญา โดยใช้ projectId จากข้อมูลสัญญา
  private navigateBack(): void {
    const projectId = this.originalContract?.projectId;
    if (projectId) {
      // ส่ง projectId กลับไปเพื่อให้หน้ารายการแสดงสัญญาของโครงการนั้น
      this.navigation.navigate(['/feature/pm/pmrt04'], { queryParams: { projectId } });
    } else {
      // ถ้าไม่มี projectId ไปหน้า list ทั่วไป
      this.navigation.navigate(['/feature/pm/pmrt04']);
    }
  }

  onBack(): void {
    if (this.form.dirty) {
      this.dialog
        .confirm('ยืนยัน', 'คุณยังไม่ได้บันทึกข้อมูล ต้องการออกจากหน้านี้ใช่หรือไม่?')
        .then((confirmed) => {
          if (confirmed) {
            this.navigateBack();
          }
        });
    } else {
      this.navigateBack();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const formValue = this.form.value;
    const original = this.originalContract;
    if (!original) return;

    const startDateStr =
      formValue.newStartDate instanceof Date
        ? formValue.newStartDate.toISOString().split('T')[0]
        : formValue.newStartDate;
    const endDateStr =
      formValue.newEndDate instanceof Date
        ? formValue.newEndDate.toISOString().split('T')[0]
        : formValue.newEndDate;

    const newContract: ContractModel = {
      ...original,
      id: undefined,
      contractNo: formValue.newContractNo || `${original.contractNo}-R`,
      parentContractId: original.id,
      startDate: DateTimeUtil.toInstantIsoString(formValue.newStartDate) || startDateStr,
      endDate: DateTimeUtil.toInstantIsoString(formValue.newEndDate) || endDateStr,
      contractValue: formValue.newContractValue,
      renewalStatus: formValue.renewalStatus,
      isActive: true,
    };

    if (formValue.renewalRemark) {
      newContract.scopeSummary = original.scopeSummary
        ? `${original.scopeSummary}\n[ต่อสัญญา] ${formValue.renewalRemark}`
        : `[ต่อสัญญา] ${formValue.renewalRemark}`;
    }

    this.dialog
      .confirm(
        'ยืนยันการต่อสัญญา',
        `คุณต้องการต่อสัญญาเป็น ${newContract.contractNo} (จากสัญญาเดิม ${original.contractNo}) ตั้งแต่วันที่ ${this.formatDate(startDateStr)} ถึง ${this.formatDate(endDateStr)} มูลค่า ${this.formatCurrency(formValue.newContractValue)} ใช่หรือไม่?`,
      )
      .then((confirmed) => {
        if (confirmed) {
          this.isSaving = true;
          this.service
            .save(newContract)
            .subscribe({
              next: (savedContractRes: any) => {
                const savedId =
                  (typeof savedContractRes === 'string'
                    ? savedContractRes
                    : savedContractRes?.id) ||
                  newContract.id ||
                  this.contractId;

                if (this.selectedFlowId && savedId) {
                  this.approvalService
                    .submitForApproval({
                      documentType: 'MA_RENEWAL',
                      documentId: savedId,
                      documentCode: newContract.contractNo,
                      documentTitle: `ต่ออายุสัญญา ${original.contractNo}`,
                      flowId: this.selectedFlowId,
                      comment: formValue.renewalRemark || 'ส่งขออนุมัติการต่ออายุสัญญา',
                    })
                    .pipe(
                      finalize(() => {
                        this.ngZone.run(() => {
                          this.isSaving = false;
                          this.cdr.detectChanges();
                        });
                      }),
                    )
                    .subscribe({
                      next: () => {
                        this.dialog
                          .success(
                            'ต่อสัญญาและส่งขออนุมัติสำเร็จ',
                            `สัญญา ${original.contractNo} ถูกต่ออายุและส่งเข้าสู่กระบวนการอนุมัติเรียบร้อยแล้ว`,
                          )
                          .then(() => {
                            this.form.markAsPristine();
                            this.navigateBack();
                          });
                      },
                      error: (err) => {
                        console.error('Submit approval error:', err);
                        this.dialog
                          .success(
                            'ต่อสัญญาสำเร็จ',
                            `สัญญาถูกต่ออายุแล้ว แต่การส่งขออนุมัติเกิดข้อผิดพลาด: ${err.error?.message || 'ไม่สามารถส่งขออนุมัติได้'}`,
                          )
                          .then(() => {
                            this.form.markAsPristine();
                            this.navigateBack();
                          });
                      },
                    });
                } else {
                  this.ngZone.run(() => {
                    this.isSaving = false;
                    this.cdr.detectChanges();
                  });
                  this.dialog
                    .success('ต่อสัญญาสำเร็จ', `สัญญา ${original.contractNo} ถูกต่ออายุเรียบร้อย`)
                    .then(() => {
                      this.form.markAsPristine();
                      this.navigateBack();
                    });
                }
              },
              error: (error) => {
                this.ngZone.run(() => {
                  this.isSaving = false;
                  this.cdr.detectChanges();
                });
                this.dialog.error('ต่อสัญญาไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
              },
            });
        }
      });
  }

  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '-';
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return typeof dateStr === 'string' ? dateStr : '-';
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
}