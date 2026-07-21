// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { ImpactAnalysisService, type ImpactAnalysis } from '../impact-analysis.service';

interface ChangeRequest {
  id?: string;
  requirementId: string;
  changeDescription: string;
  impactSummary?: string;
  estimatedManday?: number;
  status: string;
  projectId?: string; // มาจาก Requirement
}

@Component({
  selector: 'app-pmdt07a',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicComboboxComponent,
    SicNumberComponent,
    SicCardComponent,
  ],
  templateUrl: './pmdt07A.component.html',
})
export class Pmdt07AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private impactService = inject(ImpactAnalysisService);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  // สำหรับใช้ใน template
  environment = environment;
  readonly Math = Math;

  isEdit = false;
  changeRequestId: string | null = null;
  isLoading = false;
  isSaving = false;
  projectId: string | null = null;

  // ฟอร์มหลัก
  form: FormGroup = this.fb.group({
    id: [null],
    requirementId: [null, Validators.required],
    changeDescription: [null, Validators.required],
    impactSummary: [null],
    estimatedManday: [null, [Validators.min(0)]],
    status: ['Draft', Validators.required],
    projectId: [null], // hidden
  });

  // Impact Analysis state
  impactAnalysis = signal<ImpactAnalysis | null>(null);
  isLoadingImpact = signal(false);

  // Combobox URL
  requirementApiUrl = environment.apiBaseUrl + '/api/pm/requirement/combobox';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.changeRequestId = id;
        this.loadChangeRequest(id);
        this.loadImpactAnalysis(id);
      }
    });

    // รับ projectId จาก queryParams (ใช้กับกรณีสร้างใหม่)
    this.route.queryParams.subscribe((qParams) => {
      if (qParams['projectId']) {
        this.projectId = qParams['projectId'];
        this.form.patchValue({ projectId: this.projectId });
        // ถ้าต้องการให้ combobox กรองตาม projectId ให้ส่ง params ไป
      }
    });
  }

  loadChangeRequest(id: string) {
    this.isLoading = true;
    this.http
      .get<ChangeRequest>(`${this.baseUrl}/${id}`)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          if (data.projectId) {
            this.projectId = data.projectId;
          }
        },
        error: () => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Change Request นี้'),
      });
  }

  loadImpactAnalysis(id: string) {
    this.isLoadingImpact.set(true);
    this.impactService
      .getByChangeRequest(id)
      .pipe(finalize(() => this.isLoadingImpact.set(false)))
      .subscribe({
        next: (data) => {
          if (data) {
            this.impactAnalysis.set(data);
          }
        },
        error: () => this.impactAnalysis.set(null),
      });
  }

  // Auto Detect Impact
  autoDetectImpact() {
    const id = this.form.get('id')?.value;
    if (!id) {
      this.dialog.warn('ยังไม่บันทึก', 'กรุณาบันทึก Change Request ก่อนวิเคราะห์');
      return;
    }
    this.isLoadingImpact.set(true);
    this.impactService
      .autoDetect(id)
      .pipe(finalize(() => this.isLoadingImpact.set(false)))
      .subscribe({
        next: (data) => {
          this.impactAnalysis.set(data);
          this.dialog.success('วิเคราะห์เสร็จสิ้น', 'พบผลกระทบที่เกี่ยวข้อง');
        },
        error: (err) => {
          this.dialog.error('วิเคราะห์ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  // บันทึก Impact Analysis (เรียกจากปุ่ม)
  saveImpactAnalysis() {
    const current = this.impactAnalysis();
    if (!current) {
      this.dialog.warn('ไม่มีข้อมูล', 'ไม่พบข้อมูล Impact Analysis ที่จะบันทึก');
      return;
    }
    // ตรวจสอบว่า changeRequestId ตรงกับ id ของฟอร์ม
    const changeRequestId = this.form.get('id')?.value;
    if (!changeRequestId) {
      this.dialog.warn('ยังไม่บันทึก', 'กรุณาบันทึก Change Request ก่อน');
      return;
    }

    const payload = {
      ...current,
      changeRequestId: changeRequestId,
    };

    this.isSaving = true;
    this.impactService
      .save(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.dialog.success('บันทึก Impact Analysis สำเร็จ', '');
        },
        error: (err) => {
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  // บันทึก Change Request หลัก
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isSaving = true;
    const data = this.form.value;
    // ตรวจสอบว่ามี projectId หรือไม่ (ถ้าไม่มีให้ใช้จาก query)
    if (!data.projectId && this.projectId) {
      data.projectId = this.projectId;
    }

    const request =
      this.isEdit && this.changeRequestId
        ? this.http.put(`${this.baseUrl}/${this.changeRequestId}`, data)
        : this.http.post(this.baseUrl, data);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (res: any) => {
        const id = res?.id || this.changeRequestId;
        this.dialog.success('บันทึกสำเร็จ', 'Change Request ถูกบันทึกเรียบร้อย');
        // ถ้ายังไม่มี id (กรณีสร้างใหม่) ให้ redirect ไปหน้า edit พร้อม id
        if (!this.isEdit && id) {
          this.navigation.navigate(['/feature/pm/pmdt07', id, 'edit']);
        } else {
          this.navigation.navigate(['/feature/pm/pmdt07']);
        }
      },
      error: (err) => {
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  cancel() {
    this.navigation.navigate(['/feature/pm/pmdt07']);
  }
}
