// src/app/feature/pm/dt/pmdt05/pmdt05.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, Subscription, interval, takeWhile } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../core/auth/auth.service';

// Components
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';

// ✅ เปลี่ยนเป็น sic-tiptap-editor
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';

// Services
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { RequirementExportService } from './requirement-export.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';

// Preview Component
import { SicRequirementPreviewComponent } from './pmdt04-preview/pmdt04-preview.component';

import { RequirementModel } from './pmdt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { Pmdt04AForm } from './pmdt04A.form';

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt04AService {
  private http = inject(HttpClient);

  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/requirement/combobox-project`;
  apiGetLovRequirementType = `${environment.apiBaseUrl}/api/pm/requirement/lov-type`;
  apiGetLovPriority = `${environment.apiBaseUrl}/api/pm/requirement/lov-priority`;
  apiGetLovStatus = `${environment.apiBaseUrl}/api/pm/requirement/lov-status`;
  apiGetApprovals = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/REQUIREMENT`;

  save(req: RequirementModel): Observable<any> {
    console.log('📝 Saving requirement:', req);
    const data = { ...req };
    delete data.projectName;
    return this.http.post(`${environment.apiBaseUrl}/api/pm/requirement/save`, data);
  }

  getRequirement(id: string): Observable<RequirementModel> {
    return this.http.get<RequirementModel>(`${environment.apiBaseUrl}/api/pm/requirement/${id}`);
  }

  autoSave(req: RequirementModel): Observable<any> {
    console.log('💾 Auto-saving requirement:', req);
    const data = { ...req };
    delete data.projectName;
    return this.http.post(`${environment.apiBaseUrl}/api/pm/requirement/save`, data);
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt04a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicRequirementPreviewComponent,
    SicCardComponent,
    SicCheckboxComponent,
    SicTiptapEditorComponent,      
    SicUploadComponent,
    SicDatePipe,
  ],
  templateUrl: './pmdt04A.component.html',
  styleUrls: ['./pmdt04A.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt04AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  // ===== Dependencies =====
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt04AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly approvalService = inject(ApprovalService);
  private readonly exportService = inject(RequirementExportService);
  private readonly navigation = inject(NavigationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly customerState = inject(CustomerStateService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // ===== Form =====
  formData!: SicFromData<RequirementModel>;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isViewOnly = false;
  reqId: string | null = null;
  isLoading = false;
  isSaving = false;
  isAutoSaving = false;
  lastAutoSaveTime: Date | null = null;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ===== View Mode =====
  viewMode: 'edit' | 'split' | 'preview' = 'split';

  // ===== Auto-save =====
  private autoSaveSubscription: Subscription | null = null;
  private formChangeSubscription: Subscription | null = null;
  private autoSaveEnabled = true;
  private autoSaveInterval = 30000; // 30 seconds

  // ===== Source Options =====
  sourceOptions = ['ลูกค้า', 'BA', 'เอกสาร', 'ประชุม'];

  // ===== CanDeactivate =====
  isSaved = false;
  pageDirty = () => this.isViewOnly ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  // ===== Lifecycle =====
  ngOnInit(): void {
    const rawForm = Pmdt04AForm.createForm(this.fb);
    this.formData = new SicFromData<RequirementModel>(rawForm);
    this.loadFlows();

    // Check if current route is view mode
    const isViewRoute = this.router.url.includes('/view');
    if (isViewRoute) {
      this.isViewOnly = true;
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = !this.isViewOnly;
        this.reqId = id;
        this.loadRequirement(id);
      } else {
        // New requirement - set default project from query params or customer state
        this.route.queryParams.subscribe((qParams) => {
          const pId = qParams['projectId'] || this.customerState.getProjectId();
          
          if (pId) {
            const pName = (this.customerState.getProjectId() && String(this.customerState.getProjectId()) === String(pId)) 
              ? this.customerState.getProjectName() 
              : null;
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ ไม่ทำให้ isChanged = true
            this.formData.patchValue({ projectId: pId, ...(pName ? { projectName: pName } : {}) } as any);
            if (!pName) {
              this.fetchProjectName(pId);
            }
          }
        });

        // Set default createdBy for new requirement
        const userName = this.getUserNameFromToken();
        if (userName) {
          // ✅ ใช้ formData.patchValue() แทน form.patchValue()
          this.formData.patchValue({ createdBy: userName } as any);
        }
      }
    });

    // Setup auto-save
    this.setupAutoSave();

    // Watch for form changes to mark dirty
    this.formChangeSubscription = this.form.valueChanges.subscribe(() => {
      // Trigger dirty state
    });
  }

  ngOnDestroy(): void {
    this.autoSaveSubscription?.unsubscribe();
    this.formChangeSubscription?.unsubscribe();
  }

  // ===== Data Loading =====
  loadRequirement(id: string) {
    this.isLoading = true;
    this.service.getRequirement(id).subscribe({
      next: (data) => {
        this.formData.formGroup.patchValue(data);
        this.isLoading = false;

        if (this.isViewOnly) {
          this.form.disable();
        }

        // If loaded data doesn't have projectName but has projectId, try to fetch it
        if (!data.projectName && data.projectId) {
          const cachedName = (this.customerState.getProjectId() && String(this.customerState.getProjectId()) === String(data.projectId)) 
            ? this.customerState.getProjectName() 
            : null;
          if (cachedName) {
            // ✅ ใช้ formData.patchValue() — ไม่ทำให้ isChanged = true
            this.formData.patchValue({ projectName: cachedName } as any);
          } else {
            this.fetchProjectName(data.projectId);
          }
        } else {
          // ✅ re-snapshot หลังโหลดข้อมูลเสร็จ
          this.formData.resetModel(this.form.getRawValue());
        }

        // If loaded data doesn't have createdBy, set it from token
        if (!data.createdBy) {
          const userName = this.getUserNameFromToken();
          if (userName) {
            // ✅ ใช้ formData.patchValue()
            this.formData.patchValue({ createdBy: userName } as any);
          }
        }

        console.log('✅ โหลดข้อมูล Requirement สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Requirement รหัสนี้');
        this.navigation.navigate(['/feature/pm/requirement']);
      },
    });
  }

  private fetchProjectName(projectId: string): void {
    console.log('🔍 [fetchProjectName] Fetching projects list from:', this.service.apiGetComboboxProject);
    this.http.get<any>(this.service.apiGetComboboxProject).subscribe({
      next: (res) => {
        console.log('🔍 [fetchProjectName] API Response:', res);
        const list = Array.isArray(res) ? res : (res.data || []);
        const project = list.find((p: any) => String(p.value || p.id || '') === String(projectId));
        if (project) {
          const name = project.projectName || project.name || project.text || project.projectNameTh || project.projectNameEn;
          console.log('🔍 [fetchProjectName] Matched project:', project, 'Resolved Name:', name);
          if (name) {
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ
            this.formData.patchValue({ projectName: name } as any);
            this.cdr.markForCheck();
          }
        } else {
          console.warn('🔍 [fetchProjectName] No project matched ID:', projectId, 'in list:', list);
        }
      },
      error: (err) => console.warn('❌ [fetchProjectName] Could not fetch project name:', err),
    });
  }

  private getUserNameFromToken(): string | null {
    const token = this.auth.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.preferred_username || payload.displayName || payload.sub || null;
    } catch {
      return null;
    }
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService.getFlowsByDocumentType('REQUIREMENT').subscribe({
      next: (flows) => {
        this.flows = flows;
        this.isLoadingFlows = false;
        if (flows.length === 1) {
          this.selectedFlowId = flows[0].id;
        }
      },
      error: () => {
        this.isLoadingFlows = false;
        console.warn('ไม่สามารถโหลด Approval Flow ได้');
      },
    });
  }

  // ❌ ไม่ต้องมี onDescriptionChange และ onAcceptanceCriteriaChange

  // ===== Auto-save =====
  private setupAutoSave(): void {
    if (!this.autoSaveEnabled) return;

    this.autoSaveSubscription = interval(this.autoSaveInterval)
      .pipe(
        takeWhile(() => this.autoSaveEnabled),
        tap(() => {
          if (this.form.dirty && this.form.valid) {
            this.performAutoSave();
          }
        })
      )
      .subscribe();
  }

  private performAutoSave(): void {
    if (this.isSaving || this.isAutoSaving) return;

    const data = this.form.value as RequirementModel;
    if (!data.title && !data.description) return; // Skip empty

    this.isAutoSaving = true;
    this.lastAutoSaveTime = new Date();

    this.service.autoSave(data).subscribe({
      next: (response: any) => {
        this.isAutoSaving = false;

        // Patch the entire returned response to update uploadGroupId and other fields
        if (response) {
          // ✅ ใช้ formData.patchValue() — auto-save ไม่ควรทำให้ isChanged = true
          this.formData.patchValue(response);
          const savedId = response.id;
          if (savedId) {
            this.reqId = savedId;
            this.isEdit = true;
          }
        } else {
          // ✅ re-snapshot หลัง auto-save สำเร็จ
          this.formData.resetModel();
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.isAutoSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  manualAutoSave(): void {
    this.performAutoSave();
  }

  getAutoSaveStatus(): string {
    if (this.isAutoSaving) return 'saving';
    if (this.lastAutoSaveTime) {
      const diff = Date.now() - this.lastAutoSaveTime.getTime();
      if (diff < 5000) return 'saved';
    }
    if (this.form.dirty) return 'dirty';
    return 'idle';
  }

  getAutoSaveText(): string {
    const status = this.getAutoSaveStatus();
    switch (status) {
      case 'saving':
        return '💾 กำลังบันทึกอัตโนมัติ...';
      case 'saved':
        return '✅ บันทึกอัตโนมัติ ' + this.formatTimeDiff(this.lastAutoSaveTime);
      case 'dirty':
        return '⏳ ยังไม่ได้บันทึก';
      default:
        return '💾 บันทึกอัตโนมัติ';
    }
  }

  private formatTimeDiff(date: Date | null): string {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `(${diff} วินาทีที่แล้ว)`;
    return `(${Math.floor(diff / 60)} นาทีที่แล้ว)`;
  }

  // ===== View Mode =====
  setViewMode(mode: 'edit' | 'split' | 'preview'): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  // ===== Preview Data =====
  getPreviewData(): any {
    const value = this.form.value;
    return {
      requirementCode: value.requirementCode || '...',
      title: value.title || '...',
      description: value.description || '<em>กรุณากรอกรายละเอียด</em>',
      acceptanceCriteria: value.acceptanceCriteria || '',
      priority: value.priority || 'Must',
      requirementType: value.requirementType || '',
      source: value.source || '',
      businessValue: value.businessValue || '',
      createdBy: value.createdBy || 'ผู้ใช้งาน',
      version: value.version || 'v1.0',
      status: value.status || 'Draft',
      projectName: value.projectName || 'กำลังโหลด...',
      createdAt: new Date().toISOString(),
    };
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      'In Review': 'อยู่ระหว่างตรวจสอบ',
      Approved: 'อนุมัติแล้ว',
      Changed: 'เปลี่ยนแปลง',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'draft',
      'In Review': 'in-review',
      Approved: 'approved',
      Changed: 'changed',
      Cancelled: 'cancelled',
    };
    return map[status] || 'draft';
  }

  // ===== Export (JasperReports PDF) =====
  async exportRequirement(): Promise<void> {
    const id = this.reqId || this.form.get('id')?.value;
    if (!id) {
      this.dialog.warn('ยังไม่ได้บันทึกข้อมูล', 'กรุณาบันทึก Requirement ก่อนส่งออกเอกสาร');
      return;
    }

    this.isSaving = true;

    try {
      if (this.form.dirty) {
        await new Promise<void>((resolve, reject) => {
          this.service.save(this.form.value).subscribe({
            next: () => {
              this.form.markAsPristine();
              resolve();
            },
            error: (err) => reject(err),
          });
        });
      }

      const blob = await this.exportService.exportWithJasper(id, 'pdf');
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (!printWindow) {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        a.click();
      }
    } catch (error: any) {
      console.error('Export error:', error);
      this.dialog.error('ส่งออกไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  // ===== Submit =====
  submitForApproval() {
    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือก Approval Flow', 'ต้องเลือกกระบวนการอนุมัติก่อนส่ง');
      return;
    }

    const data = this.form.value as RequirementModel;
    if (!data.id) {
      this.dialog.warn('ยังไม่ได้บันทึกข้อมูล', 'กรุณาบันทึก Requirement ก่อนส่งขออนุมัติ');
      return;
    }

    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: data.id,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: 'ส่งขออนุมัติ Requirement',
      })
      .subscribe({
        next: () => {
          this.dialog.success('ส่งขออนุมัติสำเร็จ', 'Requirement ถูกส่งเข้าสู่กระบวนการอนุมัติแล้ว');
          this.form.patchValue({ status: 'In Review' });
        },
        error: (err) => {
          this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  // ===== CRUD Actions =====
  onBack(): void {
    const projectId = this.form.get('projectId')?.value;
    this.navigateBack(projectId);
  }

  private navigateBack(projectId?: string): void {
    if (projectId) {
      this.navigation.navigate(['/feature/pm/requirement'], {
        queryParams: { projectId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/requirement']);
    }
  }

  submit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    if (!this.selectedFlowId) {
      this.dialog.warn('กรุณาเลือกกระบวนการอนุมัติ', 'จำเป็นต้องเลือกกระบวนการอนุมัติทุกครั้ง');
      return;
    }

    this.isSaving = true;
    const data = this.formData.value as RequirementModel;

    // Set state
    data.state = this.isEdit ? SicEntityState.Modified : SicEntityState.Added;
    if (!this.isEdit) {
      data.rowVersion = 0;
    }

    this.service.save(data).subscribe({
      next: (response: any) => {
        // ✅ re-snapshot ก่อน — เพื่อให้ isChanged = false
        this.formData.markAsPristine();
        // ✅ flag isSaved = true ทันที — guard จะ bypass ไม่ถาม
        this.isSaved = true;
        
        // Resolve the saved requirement ID and patch the entire response (including uploadGroupId)
        let savedId = data.id || this.reqId;
        if (response && response.id) {
          savedId = response.id;
          // ✅ ใช้ formData.patchValue() แทน form.patchValue()
          this.formData.patchValue(response);
          this.reqId = savedId;
          this.isEdit = true;
        }

        // Submit for approval automatically
        this.approvalService
          .submitForApproval({
            documentType: 'REQUIREMENT',
            documentId: savedId!,
            documentCode: data.requirementCode,
            documentTitle: data.title,
            version: data.version,
            flowId: this.selectedFlowId!,
            comment: 'ส่งขออนุมัติ Requirement อัตโนมัติขณะบันทึก',
          })
          .subscribe({
            next: () => {
              this.isSaving = false;
              this.dialog.success('บันทึกและส่งขออนุมัติสำเร็จ', 'ข้อมูล Requirement ถูกบันทึกและส่งเข้าสู่กระบวนการอนุมัติเรียบร้อยแล้ว').then(() => {
                this.navigateBack(data.projectId);
              });
            },
            error: (err) => {
              this.isSaving = false;
              this.dialog.error('บันทึกสำเร็จ แต่ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาดในการส่งอนุมัติ');
            },
          });
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  // ===== Helper =====
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  get editPanelClass(): string {
    if (this.viewMode === 'edit') return 'pmdt05-panel pmdt05-panel--edit';
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--edit';
  }

  get previewPanelClass(): string {
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--preview';
  }
}

export default Pmdt04AComponent;