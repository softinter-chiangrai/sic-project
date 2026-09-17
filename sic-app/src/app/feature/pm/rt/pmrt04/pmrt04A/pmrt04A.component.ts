import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';

// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { signal } from '@angular/core';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { DateTimeUtil } from '../../../../../core/utils/datetime.util';
import { environment } from '../../../../../../environments/environment';
import { ApprovalService } from '../../../dt/pmdt03/approval.service';
import { Pmrt02Service } from '../../pmrt02/pmrt02.service';
import { Pmrt04AForm } from './pmrt04A.form';
import { ContractModel } from './pmrt04A.model';
import { Pmrt04AService, ContractSummary } from './pmrt04A.service';
import { SicEntitySummaryComponent, EntitySummaryCard } from '../../../../../core/component/sic-entity-summary/sic-entity-summary.component';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { SicCopyLinkComponent } from '../../../../../core/component/sic-copy-link/sic-copy-link.component';

@Component({
  selector: 'app-pmrt04a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicVersionBadgeComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicDatepickerComponent,
    SicCopyLinkComponent,
    SicEntitySummaryComponent,
  ],
  templateUrl: './pmrt04A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt04AService);
  private approvalService = inject(ApprovalService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);
  private navigation = inject(NavigationService);
  private projectService = inject(Pmrt02Service);
  private cdr = inject(ChangeDetectorRef);
  private aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<ContractModel>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isView = false;
  isLocked = false;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;

  // Context info
  customerId: string | null = null;
  customerName: string | null = null;
  projectId: string | null = null;
  projectName: string | null = null;

  // ===== Cross-Entity Summary =====
  summary = signal<ContractSummary | null>(null);
  summaryLoading = signal(false);

  summaryCards = computed<EntitySummaryCard[]>(() => {
    const s = this.summary();
    if (!s) return [];
    const projectId = this.projectId;
    const cards: EntitySummaryCard[] = [
      {
        icon: 'bi-flag',
        label: 'Milestone',
        value: `${s.milestones.completed}/${s.milestones.total}`,
        sublabel: 'เสร็จแล้ว/ทั้งหมด',
        actionLabel: 'ดู Phase',
        action: () => this.navigation.navigate(['/feature/pm/phase'], { queryParams: { projectId } }),
      },
      {
        icon: 'bi-receipt',
        label: 'ใบแจ้งหนี้',
        value: String(s.invoices.total),
        sublabel: s.invoices.pending > 0 ? `${s.invoices.pending} ค้างชำระ` : 'ชำระครบแล้ว',
        variant: s.invoices.pending > 0 ? 'warning' : 'default',
        actionLabel: 'ดูใบแจ้งหนี้',
        action: () => this.navigation.navigate(['/feature/pm/invoice'], { queryParams: { projectId } }),
      },
      {
        icon: 'bi-ticket-perforated',
        label: 'MA Ticket',
        value: String(s.maTickets.total),
        sublabel: s.maTickets.open > 0 ? `${s.maTickets.open} เปิดอยู่` : 'ไม่มีที่เปิดอยู่',
        variant: s.maTickets.open > 0 ? 'warning' : 'default',
        actionLabel: 'ดู MA Ticket',
        action: () => this.navigation.navigate(['/feature/pm/ma-ticket'], { queryParams: { projectId } }),
      },
    ];

    if (s.daysUntilExpiry !== null) {
      const expiring = s.daysUntilExpiry <= 30;
      cards.push({
        icon: 'bi-clock-history',
        label: 'อายุสัญญา',
        value: s.daysUntilExpiry >= 0 ? `อีก ${s.daysUntilExpiry} วัน` : 'หมดอายุแล้ว',
        sublabel: expiring ? 'ใกล้หมดอายุ' : undefined,
        variant: s.daysUntilExpiry < 0 ? 'danger' : expiring ? 'warning' : 'default',
        actionLabel: this.contractId ? 'ต่อสัญญา' : undefined,
        action: this.contractId
          ? () => this.navigation.navigate(['/feature/pm/contract/renew', this.contractId!])
          : undefined,
      });
    }

    return cards;
  });

  // ===== AI Assistant =====
  showAiModal = signal(false);
  aiActiveTab = signal<'generate' | 'history'>('generate');
  isGeneratingAi = signal(false);
  aiModel = signal(DEFAULT_AI_MODEL);
  aiPrompt = signal('');
  aiContractType = signal('SOFTWARE_DEVELOPMENT');
  aiHistories = signal<AiHistoryItem<any>[]>([]);
  aiCurrentDraft = signal<any>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);

  aiModels = AI_MODEL_OPTIONS;

  aiContractTypeOptions = [
    { value: 'SOFTWARE_DEVELOPMENT', label: 'สัญญาจ้างพัฒนาซอฟต์แวร์ (Software Development)' },
    { value: 'MAINTENANCE_SUPPORT', label: 'สัญญาบำรุงรักษาและสนับสนุนระบบ (MA & Support)' },
    { value: 'CONSULTING', label: 'สัญญาบริการที่ปรึกษาด้านไอที (IT Consulting)' },
    { value: 'CLOUD_INFRASTRUCTURE', label: 'สัญญาบริการคลาวด์และโครงสร้างพื้นฐาน (Cloud & Infra)' },
  ];

  // Approval Integration
  selectedFlowId: string | null = null;
  apiGetApprovals = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/CONTRACT`;

  isSaved = false;

  pageDirty = () => {
    if (this.isView || this.isSaved) {
      return false;
    }
    return this.formData?.isChanged ?? this.form?.dirty ?? false;
  };

  ngOnInit(): void {
    this.initForm();

    if (this.router.url.includes('/view')) {
      this.isView = true;
    }

    // 1. รับค่า id จาก route params (ถ้ามี)
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.contractId = id;
      this.loadContract(id);
    }

    // 2. รับ projectId และ customerId จาก queryParams
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'view') {
        this.isView = true;
      }
      const projectId = params['projectId'];
      if (projectId && !this.contractId) {
        this.projectId = projectId;
        this.projectService.getProject(projectId).subscribe({
          next: (project) => {
            this.customerId = project.customerId;
            this.customerName = project.customerName || null;
            this.projectName = project.projectName || null;
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ
            this.formData.patchValue({
              projectId,
              customerId: project.customerId,
              projectName: project.projectName,
              customerName: project.customerName,
            });
            if (this.isView) {
              this.form.disable();
            }
            this.cdr.detectChanges();
          },
          error: () => this.navigation.navigate(['/feature/pm/contract']),
        });
      }
    });
  }

  initForm(): void {
    this.formData = new SicFromData<ContractModel>(Pmrt04AForm.createForm(this.fb));
  }

  loadContract(id: string) {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.isView) {
            this.form.disable();
          }
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          if (data.customerId) {
            this.customerId = data.customerId;
          }
          if (data.customerName) {
            this.customerName = data.customerName;
          }
          if (data.projectId) {
            this.projectId = data.projectId;
          }
          if (data.projectName) {
            this.projectName = data.projectName;
          }
          // ✅ ใช้ formData.patchValue() — patch + re-snapshot ในครั้งเดียว
          this.formData.patchValue(data);
          if (data.isLocked) {
            this.isLocked = true;
            this.isView = true;
          } else {
            this.isLocked = false;
            this.isView = this.router.url.includes('/view');
          }
          if (this.isView) {
            this.form.disable();
          } else {
            this.form.enable();
          }
          this.cdr.detectChanges();
          this.loadSummary(id);
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญารหัสนี้');
          this.navigation.navigate(['/feature/pm/contract']);
        },
      });
  }

  loadSummary(id: string): void {
    this.summaryLoading.set(true);
    this.service.getContractSummary(id).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.summaryLoading.set(false);
      },
      error: () => this.summaryLoading.set(false),
    });
  }

  onBack(): void {
    if (this.projectId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { projectId: this.projectId },
      });
    } else if (this.customerId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { customerId: this.customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/contract']);
    }
  }

  requestChange(): void {
    this.navigation.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.projectId,
        targetType: 'CONTRACT',
        targetId: this.contractId,
        targetTitle: this.form.get('contractNo')?.value,
      },
    });
  }

  onApprovalStatusChange(event: any): void {
    if (event?.status && this.contractId) {
      this.loadContract(this.contractId);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }


    this.isSaving = true;

    const data = { ...this.form.getRawValue() } as ContractModel;
    if (data.startDate) {
      data.startDate = DateTimeUtil.toInstantIsoString(data.startDate) || data.startDate;
    }
    if (data.endDate) {
      data.endDate = DateTimeUtil.toInstantIsoString(data.endDate) || data.endDate;
    }

    if (this.customerId) {
      data.customerId = this.customerId;
    } else {
      this.dialog.warn('ไม่พบข้อมูลลูกค้า', 'กรุณาเลือกลูกค้าก่อน');
      this.isSaving = false;
      return;
    }

    this.service
      .save(data)
      .subscribe({
        next: (savedContractRes: any) => {
          this.isSaved = true;
          this.formData.resetModel(this.form.getRawValue());
          this.form.markAsPristine();

          const savedId =
            (typeof savedContractRes === 'string'
              ? savedContractRes
              : savedContractRes?.id) ||
            data.id ||
            this.contractId;

          // ถ้ามีการเลือกกระบวนการอนุมัติ ให้ส่งเข้า Approval Flow
          if (this.selectedFlowId && savedId) {
            this.approvalService
              .submitForApproval({
                documentType: 'CONTRACT',
                documentId: savedId,
                documentCode: data.contractNo,
                documentTitle: `สัญญา ${data.contractNo}`,
                flowId: this.selectedFlowId,
                comment: 'ส่งขออนุมัติสัญญา',
              })
              .pipe(
                finalize(() => {
                  this.isSaving = false;
                  this.cdr.detectChanges();
                }),
              )
              .subscribe({
                next: () => {
                  this.dialog
                    .success(
                      'บันทึกสำเร็จ',
                      `บันทึกข้อมูลสัญญา ${data.contractNo} เรียบร้อย`,
                    )
                    .then(() => {
                      this.onBack();
                    });
                },
                error: (err) => {
                  console.error('Submit approval error:', err);
                  this.dialog
                    .success(
                      'บันทึกสำเร็จ',
                      `บันทึกข้อมูลสัญญา ${data.contractNo} เรียบร้อย`,
                    )
                    .then(() => {
                      this.onBack();
                    });
                },
              });
          } else {
            this.isSaving = false;
            this.cdr.detectChanges();
            this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลสัญญาถูกบันทึกเรียบร้อย').then(() => {
              this.onBack();
            });
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.cdr.detectChanges();
          this.dialog.error('บันทึกไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
  }

  // ===== AI Assistant Methods =====
  openAiAssist(): void {
    if (this.isLocked || this.isView) return;
    this.showAiModal.set(true);
    this.aiActiveTab.set('generate');
    this.loadAiHistory();
  }

  closeAiAssist(): void {
    this.showAiModal.set(false);
  }

  loadAiHistory(): void {
    const targetId = this.contractId || this.form?.get('id')?.value || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('contract', targetId));
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบประวัติการสร้างนี้ใช่หรือไม่?').then((ok: boolean) => {
      if (ok) {
        const targetId = this.contractId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.deleteHistory('contract', targetId, id);
        this.loadAiHistory();
        this.cdr.detectChanges();
      }
    });
  }

  clearAllAiHistories(): void {
    this.dialog.confirm('ยืนยันการล้างประวัติ', 'คุณต้องการล้างประวัติการสร้าง AI ทั้งหมดของสัญญานี้ใช่หรือไม่?').then((ok: boolean) => {
      if (ok) {
        const targetId = this.contractId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.clearHistories('contract', targetId);
        this.loadAiHistory();
        this.cdr.detectChanges();
      }
    });
  }

  generateAiDraft(): void {
    if (this.isGeneratingAi()) return;

    this.isGeneratingAi.set(true);
    const targetId = this.contractId || this.form?.get('id')?.value || 'new';
    const currentNo = this.form?.get('contractNo')?.value;
    const currentVal = this.form?.get('contractValue')?.value;

    this.service.generateDraft({
      projectId: this.projectId || this.form?.get('projectId')?.value || undefined,
      customerId: this.customerId || this.form?.get('customerId')?.value || undefined,
      contractNo: currentNo || undefined,
      contractType: this.aiContractType() || this.form?.get('contractType')?.value || undefined,
      contractValue: currentVal ? Number(currentVal) : undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft || (!draft.contractNo && !draft.scopeSummary && !draft.paymentTerms)) {
          this.dialog.warn('ไม่พบข้อมูล', 'AI ไม่สามารถสร้างเนื้อหาสัญญาได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'contract',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();

        // ดึงข้อมูลหัวข้อและเนื้อหา TipTap ลงในฟอร์มทันที
        this.applyDraftToForm(draft);

        this.dialog.success('สร้างเนื้อหาสำเร็จ', `AI ได้ร่างข้อมูลสัญญา (เวอร์ชัน v${historyItem.versionNo}) ลงในฟอร์มเรียบร้อยแล้ว`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI contract generation error:', err);
        this.dialog.error('เกิดข้อผิดพลาด', err?.error?.message || err?.message || 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้');
        this.cdr.detectChanges();
      },
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    this.formData.patchValue({
      contractNo: draft.contractNo || this.form.get('contractNo')?.value,
      contractType: draft.contractType || this.form.get('contractType')?.value,
      contractValue: draft.contractValue !== undefined && draft.contractValue !== null ? Number(draft.contractValue) : this.form.get('contractValue')?.value,
      paymentTerms: draft.paymentTerms || this.form.get('paymentTerms')?.value,
      scopeSummary: draft.scopeSummary || this.form.get('scopeSummary')?.value,
      startDate: draft.startDate || this.form.get('startDate')?.value,
      endDate: draft.endDate || this.form.get('endDate')?.value,
      signStatus: draft.signStatus || this.form.get('signStatus')?.value || 'Draft',
    });
    this.form.markAsDirty();
  }

  pasteContractDraft(draft: any): void {
    if (this.isLocked || this.isView) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว');
      return;
    }
    if (!draft) {
      this.dialog.warn('ไม่พบข้อมูล', 'ไม่มีข้อมูลที่จะวางลงในฟอร์ม');
      return;
    }

    this.applyDraftToForm(draft);
    this.showAiModal.set(false);
    this.dialog.success('นำข้อมูลลงฟอร์มสำเร็จ', 'ข้อมูลสัญญาจาก AI ถูกใส่ลงในฟอร์มเรียบร้อยแล้ว');
    this.cdr.detectChanges();
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => {
        this.copiedId.set(null);
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    });
  }
}

