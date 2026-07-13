// sic-app/src/app/feature/bu/rt/burt06/burt06A.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { BusinessService } from '../../../../../core/services/business.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Burt06Service, type ApprovalFlow, type ApprovalFlowStep } from '../burt06.service';
import { listAnimation } from '../list.animations';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';

/** ตัวเลือกผู้ใช้งานใน role ที่เลือก */
interface UserOption {
  value: string;   // userId
  text: string;    // displayName
}

@Component({
  selector: 'app-burt06a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicCheckboxComponent,
    SicCardComponent,
    SicComboboxComponent,
  ],
  templateUrl: './burt06A.component.html',
  styleUrl: './burt06A.component.css',
  animations: [listAnimation],
})
export class Burt06AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private businessService = inject(BusinessService);
  private http = inject(HttpClient);
  readonly apiBaseUrl = environment.apiBaseUrl;

  isEdit = false;
  flowId: string | null = null;
  isLoading = false;
  isSaving = false;

  /** cache ผู้ใช้งานของแต่ละ step index -> UserOption[] */
  stepUsersCache: Record<number, UserOption[]> = {};
  /** กำลังโหลดผู้ใช้งานของ step ไหน */
  stepUsersLoading: Record<number, boolean> = {};

  documentTypeOptions = [
    { value: 'REQUIREMENT', text: 'Requirement' },
    { value: 'SPECIFICATION', text: 'Specification' },
    { value: 'DFD', text: 'DFD' },
    { value: 'ER', text: 'ER Diagram' },
    { value: 'DELIVERY', text: 'Delivery' },
    { value: 'INVOICE', text: 'Invoice' },
    { value: 'MA_RENEWAL', text: 'MA Renewal' },
    { value: 'CHANGE_REQUEST', text: 'Change Request' },
    { value: 'TEST_PLAN', text: 'Test Plan' },
    { value: 'UAT', text: 'UAT' },
    { value: 'TASK', text: 'Task' },
  ];

  approvalModeOptions = [
    { value: 'CHAIN', text: 'เรียงลำดับ (Chain)' },
    { value: 'PARALLEL', text: 'พร้อมกัน (Parallel)' },
    { value: 'ANY', text: 'ใครก็ได้ (Any)' },
    { value: 'SINGLE', text: 'คนเดียว (Single)' },
  ];

  form = this.fb.group({
    id: [null],
    flowCode: ['', [Validators.required, Validators.maxLength(50)]],
    flowName: ['', [Validators.required, Validators.maxLength(255)]],
    documentType: ['', [Validators.required]],
    approvalMode: ['CHAIN', [Validators.required]],
    description: [''],
    isActive: [true],
    steps: this.fb.array<FormGroup>([]),
    rowVersion: [null],
  });

  get steps() {
    return this.form.get('steps') as FormArray;
  }

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.flowId = id;
      this.loadFlow(id);
    } else {
      this.addStep();
    }
  }

  loadFlow(id: string): void {
    this.isLoading = true;
    this.service
      .getFlow(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data as any);
          this.steps.clear();
          data.steps?.forEach((step, i) => {
            this.steps.push(this.createStepForm(step));
            // โหลดผู้ใช้งานถ้าขั้นตอนมี role
            if (step.approverRole) {
              this.loadUsersForStep(i, step.approverRole);
            }
          });
          this.reorderSteps();
          this.cdr.detectChanges();
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Flow ที่ต้องการ');
          this.router.navigate(['/feature/bu/burt06']);
        },
      });
  }

  createStepForm(step?: ApprovalFlowStep): FormGroup {
    return this.fb.group({
      id: [step?.id || null],
      stepOrder: [
        step?.stepOrder || this.steps.length + 1,
        [Validators.required, Validators.min(1)],
      ],
      stepName: [step?.stepName || '', [Validators.required, Validators.maxLength(255)]],
      approverRole: [step?.approverRole || ''],
      approverUserId: [step?.approverUserId || ''],
      selectedUserIds: [this.parseUserIds(step?.approverUserId)],   // string[]
      isRequired: [step?.isRequired !== false],
      timeoutDays: [step?.timeoutDays || null],
      canSkip: [step?.canSkip || false],
      rowVersion: [step?.rowVersion || null],
    });
  }

  private parseUserIds(csv?: string): string[] {
    if (!csv || !csv.trim()) return [];
    return csv.split(',').map(s => s.trim()).filter(Boolean);
  }

  addStep(): void {
    this.steps.push(this.createStepForm());
    this.reorderSteps();
    this.cdr.detectChanges();
  }

  removeStep(index: number): void {
    if (this.steps.length <= 1) {
      this.dialog.warn('ไม่สามารถลบได้', 'ต้องมีอย่างน้อย 1 ขั้นตอน');
      return;
    }
    this.steps.removeAt(index);
    delete this.stepUsersCache[index];
    delete this.stepUsersLoading[index];
    this.reorderSteps();
    this.cdr.detectChanges();
  }

  moveStepUp(index: number): void {
    if (index <= 0) return;
    const stepsArray = this.steps;
    const stepGroup = stepsArray.at(index) as FormGroup;
    stepsArray.removeAt(index);
    stepsArray.insert(index - 1, stepGroup);
    // swap cache
    [this.stepUsersCache[index], this.stepUsersCache[index - 1]] = [this.stepUsersCache[index - 1], this.stepUsersCache[index]];
    this.reorderSteps();
    this.form.markAsDirty();
    this.cdr.detectChanges();
  }

  moveStepDown(index: number): void {
    if (index >= this.steps.length - 1) return;
    const stepsArray = this.steps;
    const stepGroup = stepsArray.at(index) as FormGroup;
    stepsArray.removeAt(index);
    stepsArray.insert(index + 1, stepGroup);
    [this.stepUsersCache[index], this.stepUsersCache[index + 1]] = [this.stepUsersCache[index + 1], this.stepUsersCache[index]];
    this.reorderSteps();
    this.form.markAsDirty();
    this.cdr.detectChanges();
  }

  /** เมื่อเลือก Role เปลี่ยน → โหลดรายชื่อผู้ใช้งานใหม่ */
  onRoleChange(event: Event, index: number): void {
    const select = event.target as HTMLSelectElement;
    const roleCode = select.value;
    const stepGroup = this.steps.at(index) as FormGroup;
    stepGroup.get('approverRole')?.setValue(roleCode);
    stepGroup.get('selectedUserIds')?.setValue([]);
    stepGroup.get('approverUserId')?.setValue('');
    this.stepUsersCache[index] = [];

    if (roleCode) {
      this.loadUsersForStep(index, roleCode);
    }
    this.cdr.detectChanges();
  }

  loadUsersForStep(index: number, roleCode: string): void {
    const businessId = this.businessService.getCurrentBusinessId();
    if (!businessId || !roleCode) return;

    // Reset user selections when role changes
    const stepGroup = this.steps.at(index) as FormGroup;
    stepGroup.get('selectedUserIds')?.setValue([]);
    stepGroup.get('approverUserId')?.setValue('');
    this.stepUsersCache[index] = [];
    this.stepUsersLoading[index] = true;
    this.cdr.detectChanges();

    this.http
      .get<{ value: string; text: string }[]>(
        `${this.apiBaseUrl}/api/su/business-roles/${businessId}/users-by-role`,
        { params: { roleCode } }
      )
      .pipe(finalize(() => {
        this.stepUsersLoading[index] = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (users) => {
          this.stepUsersCache[index] = users;
        },
        error: () => {
          this.stepUsersCache[index] = [];
        },
      });
  }

  /** Toggle user selection for a step */
  toggleUser(index: number, userId: string): void {
    const stepGroup = this.steps.at(index) as FormGroup;
    const current: string[] = stepGroup.get('selectedUserIds')?.value ?? [];
    const next = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    stepGroup.get('selectedUserIds')?.setValue(next);
    stepGroup.get('approverUserId')?.setValue(next.join(','));
    this.form.markAsDirty();
  }

  isUserSelected(index: number, userId: string): boolean {
    const stepGroup = this.steps.at(index) as FormGroup;
    const current: string[] = stepGroup.get('selectedUserIds')?.value ?? [];
    return current.includes(userId);
  }

  private reorderSteps(): void {
    this.steps.controls.forEach((ctrl, index) => {
      ctrl.get('stepOrder')?.setValue(index + 1);
    });
  }

  cancel(): void {
    if (this.form.dirty) {
      this.dialog
        .confirm('ยืนยัน', 'คุณยังไม่ได้บันทึกข้อมูล ต้องการออกใช่หรือไม่?')
        .then((confirmed) => {
          if (confirmed) {
            this.router.navigate(['/feature/bu/burt06']);
          }
        });
    } else {
      this.router.navigate(['/feature/bu/burt06']);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const raw = this.form.value;

    // Sync approverUserId จาก selectedUserIds ก่อน save
    const steps = (raw.steps as any[])?.map(s => ({
      ...s,
      approverUserId: (s.selectedUserIds as string[] ?? []).join(',') || s.approverUserId || '',
    }));

    const hasEmptyStepName = steps?.some((s: any) => !s.stepName?.trim());
    if (hasEmptyStepName) {
      this.isSaving = false;
      this.dialog.warn('ข้อมูลไม่สมบูรณ์', 'กรุณากรอกชื่อขั้นตอนให้ครบทุกขั้นตอน');
      return;
    }

    const data: ApprovalFlow = { ...(raw as any), steps };

    const request =
      this.isEdit && this.flowId
        ? this.service.updateFlow(this.flowId, data)
        : this.service.createFlow(data);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', `บันทึก Approval Flow "${data.flowName}" เรียบร้อย`);
        this.router.navigate(['/feature/bu/burt06']);
      },
      error: (err) => {
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  get roleApiUrl(): string {
    const businessId = this.businessService.getCurrentBusinessId();
    if (!businessId) return '';
    return `${environment.apiBaseUrl}/api/su/business-roles?businessId=${businessId}`;
  }

  get approvalModeComboboxConfig() {
    return {
      apiUrl: `${this.apiBaseUrl}/api/db/parameter/lov`,
      params: { group: 'PM', parameterCode: 'APPROVAL_MODE' }
    };
  }
}

