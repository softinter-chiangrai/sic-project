import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { ApprovalService } from '../../pmdt03/approval.service';
import { ApprovalFlow } from '../../pmdt03/approval.model';

import { Pmdt15AForm } from './pmdt15A.form';
import { Pmdt15AService } from './pmdt15A.service';
import { PmUserManualModel, PmUserManualSectionModel } from './pmdt15A.model';

@Component({
  selector: 'app-pmdt15a',
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
    SicUploadComponent,
  ],
  templateUrl: './pmdt15A.component.html',
  styleUrls: ['./pmdt15A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt15AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt15AService);
  private readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly approvalService = inject(ApprovalService);
  private readonly http = inject(HttpClient);

  formData!: SicFromData<PmUserManualModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);
  isPrinting = signal(false);
  isLocked = signal(false);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/USER_MANUAL`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  sections = signal<PmUserManualSectionModel[]>([]);
  activeSectionIndex = signal<number>(0);
  selectedSectionIndex = computed(() => this.activeSectionIndex());
  selectedSection = computed(() => {
    const list = this.sections();
    const idx = this.activeSectionIndex();
    return list[idx] || null;
  });

  onSectionFieldChange(index: number, field: string, value: any): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    if (current[index]) {
      (current[index] as any)[field] = value;
      if (current[index].id) {
        current[index].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  typeOptions = [
    { label: 'คู่มือสำหรับผู้ใช้งานทั่วไป', value: 'USER' },
    { label: 'คู่มือสำหรับผู้ดูแลระบบ', value: 'ADMIN' },
    { label: 'คู่มือการติดตั้งระบบ', value: 'INSTALLATION' },
    { label: 'คู่มือการปฏิบัติงาน', value: 'OPERATION' },
    { label: 'คู่มือการแก้ปัญหา', value: 'TROUBLESHOOT' },
  ];

  deliveryOptions = signal<Array<{ value: string; text: string }>>([]);

  // AI Generator Modal State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiManualType = signal('USER');
  aiSelectedRequirementIds = signal<string[]>([]);
  aiSelectedSpecificationIds = signal<string[]>([]);
  aiPrompt = signal('');
  aiReplaceMode = signal<'replace' | 'append'>('replace');
  requirementOptions = signal<Array<{ value: string; text: string }>>([]);
  specificationOptions = signal<Array<{ value: string; text: string }>>([]);
  isLoadingAiOptions = signal(false);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    const rawForm = Pmdt15AForm.createForm(this.fb);
    this.formData = new SicFromData<PmUserManualModel>(rawForm);

    this.initDefaultSections();
    this.loadApprovalFlows();

    this.route.queryParams.subscribe((qParams) => {
      const queryProj = qParams['projectId'];
      if (queryProj) {
        this.formData.patchValue({ projectId: queryProj } as any);
        this.loadDeliveryOptions(queryProj);
        this.loadAiComboboxOptions(queryProj);
        this.cdr.markForCheck();
      } else {
        this.loadDeliveryOptions();
        this.loadAiComboboxOptions();
      }
    });

    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      if (paramId) {
        this.isEdit.set(true);
        this.id.set(paramId);
        this.loadData(paramId);
      }
      this.cdr.markForCheck();
    });
  }

  loadAiComboboxOptions(projectId?: string): void {
    const projId = projectId || (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    this.isLoadingAiOptions.set(true);

    this.service.getRequirementCombobox(projId).subscribe({
      next: (res) => {
        this.requirementOptions.set(res || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.requirementOptions.set([]);
        this.cdr.markForCheck();
      },
    });

    this.service.getSpecificationCombobox(projId).subscribe({
      next: (res) => {
        this.specificationOptions.set(res || []);
        this.isLoadingAiOptions.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.specificationOptions.set([]);
        this.isLoadingAiOptions.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  openAiModal(): void {
    if (this.isLocked()) {
      this.dialog.warn('ไม่สามารถดำเนินการได้', 'เอกสารนี้ถูกล็อคแล้ว');
      return;
    }
    const currentType = (this.formData?.form?.value as any)?.manualType || 'USER';
    this.aiManualType.set(currentType);
    this.aiPrompt.set('');

    const projId = (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    this.loadAiComboboxOptions(projId);
    this.showAiModal.set(true);
    this.cdr.markForCheck();
  }

  closeAiModal(): void {
    if (this.isGeneratingAi()) return;
    this.showAiModal.set(false);
    this.cdr.markForCheck();
  }

  generateWithAi(): void {
    if (this.isGeneratingAi()) return;

    const projId = (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    const currentTitle = (this.formData?.form?.value as any)?.manualTitle;

    this.isGeneratingAi.set(true);
    this.cdr.markForCheck();

    const reqIds = this.aiSelectedRequirementIds();
    const specIds = this.aiSelectedSpecificationIds();

    this.service.generateDraft({
      projectId: projId || undefined,
      manualTitle: currentTitle || undefined,
      manualType: this.aiManualType(),
      requirementIds: reqIds.length > 0 ? reqIds : undefined,
      specificationIds: specIds.length > 0 ? specIds : undefined,
      prompt: this.aiPrompt() || undefined,
    }).pipe(
      finalize(() => {
        this.isGeneratingAi.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (draft) => {
        if (!draft || !draft.sections || draft.sections.length === 0) {
          this.dialog.warn('ไม่พบข้อมูล', 'AI ไม่สามารถสร้างเนื้อหาคู่มือได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }

        // Set manual title if empty
        if (!currentTitle || currentTitle.trim() === '') {
          if (draft.manualTitle) {
            this.formData.patchValue({ manualTitle: draft.manualTitle } as any);
          }
        }
        if (draft.manualType) {
          this.formData.patchValue({ manualType: draft.manualType } as any);
        }

        const newSectionsList: PmUserManualSectionModel[] = draft.sections.map((s, idx) => ({
          sectionCode: s.sectionCode || `SEC-${idx + 1}`,
          sectionTitle: s.sectionTitle || `${idx + 1}. หัวข้อ`,
          content: s.content || '',
          sortOrder: s.sortOrder || (idx + 1),
          state: SicEntityState.Added,
        }));

        if (this.aiReplaceMode() === 'replace') {
          const existing = this.sections().filter((s) => !!s.id).map((s) => ({
            ...s,
            state: SicEntityState.Deleted,
          }));
          this.sections.set([...existing, ...newSectionsList]);
          const firstVisibleIdx = this.sections().findIndex((s) => s.state !== SicEntityState.Deleted);
          this.activeSectionIndex.set(firstVisibleIdx >= 0 ? firstVisibleIdx : 0);
        } else {
          const current = [...this.sections()];
          const startOrder = current.length;
          newSectionsList.forEach((s, i) => {
            s.sortOrder = startOrder + i + 1;
            current.push(s);
          });
          this.sections.set(current);
          this.activeSectionIndex.set(current.length - 1);
        }

        this.formData.markAsDirty();
        this.showAiModal.set(false);
        this.dialog.success('สร้างเนื้อหาสำเร็จ', 'AI ได้ทำการสร้างเนื้อหาคู่มือการใช้งานเรียบร้อยแล้ว');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('AI manual generation error:', err);
        this.dialog.error('เกิดข้อผิดพลาด', err?.error?.message || err?.message || 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้');
      },
    });
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('USER_MANUAL').subscribe({
      next: (flows) => {
        this.flows.set(flows || []);
        this.isLoadingFlows.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingFlows.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadDeliveryOptions(projectId?: string): void {
    this.service.getDeliveryCombobox(projectId).subscribe({
      next: (res) => {
        this.deliveryOptions.set(res || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.deliveryOptions.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  loadData(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.projectId) {
          this.loadDeliveryOptions(data.projectId);
        }
        if (data.sections && data.sections.length > 0) {
          this.sections.set(data.sections);
        } else {
          this.initDefaultSections();
        }
        if (data.isLocked) {
          this.isLocked.set(true);
          this.formData.form.disable();
        } else {
          this.isLocked.set(false);
          const isViewRoute = this.router.url.includes('/view');
          if (isViewRoute) {
            this.formData.form.disable();
          } else {
            this.formData.form.enable();
          }
        }
        this.formData.resetModel(this.formData.form.getRawValue() as any);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.dialog.error('Error', err.message || 'ไม่สามารถโหลดข้อมูลได้');
        this.cdr.markForCheck();
      },
    });
  }

  initDefaultSections(): void {
    const defaults: PmUserManualSectionModel[] = [
      { sectionCode: 'SEC-1', sectionTitle: '1. บทนำและวัตถุประสงค์', content: 'รายละเอียดวัตถุประสงค์ของระบบ...', sortOrder: 1 },
      { sectionCode: 'SEC-2', sectionTitle: '2. การเข้าใช้งานระบบและสิทธิ์การใช้งาน', content: 'ขั้นตอนการเข้าสู่ระบบ และสิทธิ์ผู้ใช้งาน...', sortOrder: 2 },
      { sectionCode: 'SEC-3', sectionTitle: '3. ขั้นตอนการใช้งานฟีเจอร์หลัก', content: 'คำอธิบายขั้นตอนการทำงานทีละขั้นตอนพร้อมภาพประกอบ...', sortOrder: 3 },
      { sectionCode: 'SEC-4', sectionTitle: '4. คำถามที่พบบ่อยและการแก้ปัญหาเบื้องต้น', content: 'รายการปัญหาที่อาจพบและวิธีแก้ไข...', sortOrder: 4 },
    ];
    this.sections.set(defaults);
    this.cdr.markForCheck();
  }

  addSection(): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const newSec: PmUserManualSectionModel = {
      sectionCode: `SEC-${current.length + 1}`,
      sectionTitle: `${current.length + 1}. หัวข้อใหม่`,
      content: '',
      sortOrder: current.length + 1,
      state: SicEntityState.Added,
    };
    current.push(newSec);
    this.sections.set(current);
    this.activeSectionIndex.set(current.length - 1);
    this.formData.markAsDirty();
    this.cdr.markForCheck();
  }

  removeSection(index: number): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const item = current[index];
    if (item.id) {
      item.state = SicEntityState.Deleted;
    } else {
      current.splice(index, 1);
    }
    this.sections.set(current);
    if (this.activeSectionIndex() >= current.length) {
      this.activeSectionIndex.set(Math.max(0, current.length - 1));
    }
    this.formData.markAsDirty();
    this.cdr.markForCheck();
  }

  selectSection(index: number): void {
    this.activeSectionIndex.set(index);
    this.cdr.markForCheck();
  }

  updateActiveSectionContent(content: string): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].content = content;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  updateActiveSectionTitle(title: string): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].sectionTitle = title;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.isLocked()) return;
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('คำเตือน', 'กรุณากรอกข้อมูลคู่มือที่จำเป็นให้ครบถ้วน');
      return;
    }

    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const sectionsPayload = this.sections().map((s) => ({
      ...s,
      state: s.state !== undefined ? s.state : (s.id ? SicEntityState.Modified : SicEntityState.Added),
    }));
    const payload = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
      sections: sectionsPayload,
    };

    this.isSaving.set(true);
    this.service.save(payload).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        const formVal = this.formData.form.getRawValue() as any;

        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'USER_MANUAL',
            documentId: savedId,
            documentCode: formVal.manualCode || payload.manualCode,
            documentTitle: formVal.manualTitle ? ('คู่มือการใช้งาน ' + formVal.manualTitle) : 'คู่มือการใช้งาน',
            version: res?.version || formVal.version,
            flowId: this.selectedFlowId()!,
            comment: 'ส่งขออนุมัติคู่มือการใช้งาน'
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกคู่มือการใช้งานเรียบร้อยแล้ว');
              const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
              this.router.navigate(['/feature/pm/manual'], {
                queryParams: queryProj ? { projectId: queryProj } : undefined,
              });
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success('บันทึกสำเร็จ', 'บันทึกคู่มือการใช้งานเรียบร้อยแล้ว');
              const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
              this.router.navigate(['/feature/pm/manual'], {
                queryParams: queryProj ? { projectId: queryProj } : undefined,
              });
            }
          });
        } else {
          this.isSaved = true;
          this.dialog.success('บันทึกสำเร็จ', 'บันทึกคู่มือการใช้งานเรียบร้อยแล้ว');
          this.formData.markAsPristine();
          const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
          this.router.navigate(['/feature/pm/manual'], {
            queryParams: queryProj ? { projectId: queryProj } : undefined,
          });
          this.isSaving.set(false);
        }
      },
      error: (err) => {
        this.dialog.error('ข้อผิดพลาด', err.message || 'บันทึกคู่มือไม่สำเร็จ');
        this.isSaving.set(false);
      },
    });
  }

  printPdf(): void {
    const manualId = this.id();
    if (!manualId) {
      this.dialog.warn('ไม่พบรหัสคู่มือ', 'กรุณาบันทึกคู่มือก่อนพิมพ์รายงาน');
      return;
    }

    this.isPrinting.set(true);
    const url = `${apiBaseUrl}/api/pm/manual/${manualId}/export-pdf`;
    this.http.get(url, { responseType: 'blob' })
      .pipe(finalize(() => this.isPrinting.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `user-manual-${this.formData?.form?.controls['manualCode']?.value || manualId}.pdf`;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print user manual error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้: ' + (err?.error?.message || err?.message || ''));
        },
      });
  }

  onBack(): void {
    const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
    this.router.navigate(['/feature/pm/manual'], {
      queryParams: queryProj ? { projectId: queryProj } : undefined,
    });
  }

  requestChange(): void {
    const rawVal = this.formData.form.getRawValue() as any;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: rawVal.projectId,
        targetType: 'USER_MANUAL',
        targetId: this.id(),
        targetTitle: rawVal.manualTitle,
      },
    });
  }
}

export default Pmdt15AComponent;