import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { environment } from '../../../../../../environments/environment';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { ToForm } from '../../../../../core/types/form.type';

// ===== Model =====
export interface ReviewCommentModel {
  id: string;
  author: string;
  text: string;
  type: string;
  createdAt: string;
}

export interface DesignReviewModel {
  id: string;
  reviewCode: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  reviewableType: string;
  reviewableId: string;
  reviewableName?: string;
  reviewer?: string;
  assignedTo?: string;
  severity: string;
  status: string;
  dueDate: string;
  figmaUrl?: string;
  embedMode?: 'design' | 'prototype';
  isActive: boolean;
  comments?: ReviewCommentModel[];
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt09AForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<DesignReviewModel>> {
    return fb.group<ToForm<DesignReviewModel>>({
      id: fb.control(null),
      reviewCode: fb.control(null, [Validators.required, Validators.maxLength(30)]),
      title: fb.control(null, [Validators.required, Validators.maxLength(255)]),
      description: fb.control(null, [Validators.required]),
      reviewableType: fb.control(null),
      reviewableId: fb.control(null, [Validators.required]),
      reviewableName: fb.control(null),
      projectId: fb.control(null, [Validators.required]),
      projectName: fb.control(null),
      reviewer: fb.control(null),
      assignedTo: fb.control(null),
      severity: fb.control('Medium', [Validators.required]),
      status: fb.control('Open', [Validators.required]),
      dueDate: fb.control(null, [Validators.required]),
      figmaUrl: fb.control(null),
      embedMode: fb.control('design'),
      isActive: fb.control(true),
      comments: fb.control([]),
      state: fb.control(null),
      rowVersion: fb.control(null),
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt09AService {
  private http = inject(HttpClient);

  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-project`;
  apiGetComboboxReviewable = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-specification`;
  apiGetComboboxSpecification = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-specification`;
  apiGetComboboxRequirement = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-requirement`;
  apiGetComboboxTask = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-task`;
  apiGetComboboxUser = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-user`;
  apiGetUsers = `${environment.apiBaseUrl}/api/pm/design-reviews/combobox-user`;
  apiGetApprovalFlows = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/DESIGN_REVIEW`;
  apiGetLovSeverity = `${environment.apiBaseUrl}/api/pm/design-reviews/lov-severity`;
  apiGetLovStatus = `${environment.apiBaseUrl}/api/pm/design-reviews/lov-status`;

  readonly severityOptions = [
    { value: 'Low', label: 'Low (ต่ำ)' },
    { value: 'Medium', label: 'Medium (ปานกลาง)' },
    { value: 'High', label: 'High (สูง)' },
    { value: 'Critical', label: 'Critical (วิกฤต)' },
  ];

  readonly statusOptions = [
    { value: 'Open', label: 'Open (เปิดอยู่)' },
    { value: 'In Progress', label: 'In Progress (กำลังตรวจสอบ)' },
    { value: 'Resolved', label: 'Resolved (แก้ไขเรียบร้อย)' },
    { value: 'Closed', label: 'Closed (ปิดงาน)' },
  ];

  save(data: DesignReviewModel): Observable<any> {
    console.log('📝 Saving design review:', data);
    return this.http.post(`${environment.apiBaseUrl}/api/pm/design-reviews`, data);
  }

  getDesignReview(id: string): Observable<DesignReviewModel> {
    return this.http.get<DesignReviewModel>(`${environment.apiBaseUrl}/api/pm/design-reviews/${id}`);
  }

  addComment(reviewId: string, text: string, type = 'GENERAL'): Observable<ReviewCommentModel> {
    return this.http.post<ReviewCommentModel>(
      `${environment.apiBaseUrl}/api/pm/design-reviews/${reviewId}/comments`,
      { text, type }
    );
  }

  deleteComment(reviewId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiBaseUrl}/api/pm/design-reviews/${reviewId}/comments/${commentId}`
    );
  }
}


// ===== Component =====
@Component({
  selector: 'app-pmdt09a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt09A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [],
})
export class Pmdt09AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt09AService);
  readonly dialog = inject(DialogService);
  readonly customerState = inject(CustomerStateService);
  private readonly approvalService = inject(ApprovalService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('figmaIframe') figmaIframe?: ElementRef<HTMLIFrameElement>;

  formData!: SicFromData<DesignReviewModel>;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  reviewId: string | null = null;
  isLoading = false;
  isSaving = false;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ===== Figma & Embed API State =====
  activeEmbedUrl: SafeResourceUrl | null = null;
  rawEmbedUrl = '';
  isFigmaLoading = false;
  isFullscreen = false;

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

  pageDirty = () => this.formData?.isChanged ?? false;

  ngOnInit(): void {
    const rawForm = Pmdt09AForm.createForm(this.fb);
    this.formData = new SicFromData<DesignReviewModel>(rawForm);
    this.loadFlows();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reviewId = id;
        this.loadDesignReview(id);
      } else {
        this.updateEmbedUrl();
      }
    });

    // รับค่า queryParams หรือดึงจาก CustomerStateService เมื่อกดสร้างใหม่
    this.route.queryParams.subscribe((queryParams) => {
      if (!this.isEdit) {
        const projectId = queryParams['projectId'] || this.customerState.getProjectId();
        const projectName = this.customerState.getProjectName();

        if (projectId) {
          this.form.patchValue({
            projectId: projectId,
            projectName: projectName || null,
          });
        }

        if (queryParams['requirementId']) {
          this.form.patchValue({
            reviewableType: 'Requirement',
            reviewableId: queryParams['requirementId'],
          });
        }
      }
    });

    this.form.get('reviewableType')?.valueChanges.subscribe(() => {
      this.form.patchValue({ reviewableId: null });
    });

    this.form.get('figmaUrl')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
    });

    this.form.get('embedMode')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
    });
  }

  loadFlows(): void {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('DESIGN_REVIEW')
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          this.isLoadingFlows = false;
          if (flows.length === 1) {
            this.selectedFlowId = flows[0].id;
            this.form.patchValue({ approvalFlowId: flows[0].id });
          }
        },
        error: () => {
          this.isLoadingFlows = false;
        },
      });
  }

  loadApprovalFlowForReview(reviewId: string): void {
    this.approvalService.getDocumentStatus('DESIGN_REVIEW', reviewId).subscribe({
      next: (approval) => {
        let flowId: string | null = null;
        if (approval && (approval as any).flowId) {
          flowId = (approval as any).flowId;
        } else if (approval && (approval as any).flow?.id) {
          flowId = (approval as any).flow.id;
        }
        if (flowId) {
          this.selectedFlowId = flowId;
          this.form.patchValue({ approvalFlowId: flowId });
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {}

  initForm(): void {
    const rawForm = Pmdt09AForm.createForm(this.fb);
    this.formData = new SicFromData<DesignReviewModel>(rawForm);
  }


  loadDesignReview(id: string) {
    this.isLoading = true;
    this.service.getDesignReview(id).subscribe({
      next: (data) => {
        const formData: any = { ...data };
        if (typeof formData.assignedTo === 'string' && formData.assignedTo.trim()) {
          formData.assignedTo = formData.assignedTo.split(',').map((s: string) => s.trim());
        }
        this.form.patchValue(formData);
        this.form.markAsPristine();
        this.isLoading = false;
        this.updateEmbedUrl();
        this.loadApprovalFlowForReview(id);
        console.log('✅ โหลดข้อมูล Design Review สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Design Review รหัสนี้');
        this.router.navigate(['/feature/pm/design-review']);
      },
    });
  }

  // ===== Figma URL Formatter & Sanitizer =====
  updateEmbedUrl(): void {
    const rawUrl = this.form.get('figmaUrl')?.value;
    if (!rawUrl || !rawUrl.trim()) {
      this.activeEmbedUrl = null;
      this.rawEmbedUrl = '';
      return;
    }

    this.isFigmaLoading = true;
    let target = rawUrl.trim();

    // หากยังไม่ได้แปลงเป็น Figma Embed URL
    const clientId = environment.figma?.clientId ? `&client-id=${environment.figma.clientId}` : '';
    if (!target.includes('figma.com/embed')) {
      const encoded = encodeURIComponent(target);
      target = `https://www.figma.com/embed?embed_host=softflow${clientId}&url=${encoded}`;
    } else if (environment.figma?.clientId && !target.includes('client-id=')) {
      target += `&client-id=${environment.figma.clientId}`;
    }

    this.rawEmbedUrl = target;
    this.activeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(target);

    setTimeout(() => {
      this.isFigmaLoading = false;
    }, 1200);
  }

  setEmbedMode(mode: 'design' | 'prototype'): void {
    this.form.patchValue({ embedMode: mode });
  }

  // ===== Figma Embed API Controls (postMessage) =====
  sendFigmaCommand(commandType: string): void {
    if (!this.figmaIframe?.nativeElement?.contentWindow) {
      console.warn('Figma Iframe not ready');
      return;
    }
    const message = { type: commandType };
    this.figmaIframe.nativeElement.contentWindow.postMessage(message, 'https://www.figma.com');
    console.log(`🚀 Sent Figma Embed Command: [${commandType}]`);
  }

  prototypeNext(): void {
    this.sendFigmaCommand('next');
  }

  prototypePrev(): void {
    this.sendFigmaCommand('prev');
  }

  prototypeRestart(): void {
    this.sendFigmaCommand('restart');
  }

  prototypeToggleHints(): void {
    this.sendFigmaCommand('toggleHints');
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  openExternalFigma(): void {
    const url = this.form.get('figmaUrl')?.value;
    if (url) {
      window.open(url, '_blank');
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/design-review']);
  }

  submit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      
      const fieldLabels: Record<string, string> = {
        reviewCode: 'รหัส Design Review',
        title: 'ชื่อเรื่อง',
        description: 'คำอธิบาย',
        reviewableType: 'ประเภทงานที่ตรวจสอบ',
        reviewableId: 'Specification/รายการที่ตรวจสอบ',
        projectId: 'โครงการ (Project)',
        severity: 'ระดับความรุนแรง',
        status: 'สถานะ',
        dueDate: 'กำหนดส่ง',
      };

      const invalidControls = Object.keys(this.form.controls)
        .filter((key) => this.form.get(key)?.invalid)
        .map((key) => fieldLabels[key] || key);

      console.warn('❌ Form Invalid! Invalid fields:', invalidControls);

      const errorMsg = invalidControls.length > 0
        ? `กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน:\n• ${invalidControls.join('\n• ')}`
        : 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง';

      this.dialog.warn('ฟอร์มไม่ถูกต้อง', errorMsg);
      return;
    }

    this.isSaving = true;
    const data = { ...this.formData.value };
    if (Array.isArray(data.assignedTo)) {
      data.assignedTo = (data.assignedTo as any[]).join(', ');
    }
    data.state = this.isEdit ? SicEntityState.Modified : SicEntityState.Added;

    this.service.save(data).subscribe({
      next: (response: any) => {
        const savedId = (typeof response === 'string' ? response : response?.id) || data.id || this.reviewId;
        
        if (this.selectedFlowId && savedId) {
          this.approvalService
            .submitForApproval({
              documentType: 'DESIGN_REVIEW',
              documentId: savedId,
              documentCode: data.reviewCode,
              documentTitle: data.title,
              flowId: this.selectedFlowId,
              comment: 'ส่งขออนุมัติ Design Review',
            })
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.dialog.success('บันทึกและส่งขออนุมัติสำเร็จ', 'ข้อมูล Design Review ถูกบันทึกและส่งเข้าสู่กระบวนการอนุมัติแล้ว').then(() => {
                  this.formData.markAsPristine();
                  this.router.navigate(['/feature/pm/design-review']);
                });
              },
              error: (err) => {
                this.isSaving = false;
                this.dialog.error('บันทึกสำเร็จ แต่ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาดในการส่งขออนุมัติ');
              }
            });
        } else {
          this.isSaving = false;
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Design Review ถูกบันทึกเรียบร้อย').then(() => {
            this.formData.markAsPristine();
            this.router.navigate(['/feature/pm/design-review']);
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  onDelete(): void {
    if (!this.reviewId) return;
    this.dialog.confirm(
      'ยืนยันการลบ',
      `คุณต้องการลบรายการ Design Review "${this.form.get('reviewCode')?.value} - ${this.form.get('title')?.value}" ใช่หรือไม่?`
    ).then((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.http.delete(`${environment.apiBaseUrl}/api/pm/design-reviews/${this.reviewId}`).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ลบรายการ Design Review เรียบร้อยแล้ว').then(() => {
              this.form.markAsPristine();
              this.router.navigate(['/feature/pm/design-review']);
            });
          },
          error: (err) => {
            console.error('Error deleting design review:', err);
            this.dialog.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาดในการลบรายการ');
            this.isLoading = false;
          }
        });
      }
    });
  }
}

export default Pmdt09AComponent;