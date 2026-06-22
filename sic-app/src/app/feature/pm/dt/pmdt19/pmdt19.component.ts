import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface ManualModel {
  id: string;
  manualCode: string;
  manualType: string;
  title: string;
  description: string;
  relatedSpec: string;
  relatedSpecName?: string;
  projectId: string;
  projectName?: string;
  author: string;
  content: string;
  fileAttachments: string[];
  version: string;
  status: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt19Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      manualCode: [null, [Validators.required, Validators.maxLength(30)]],
      manualType: [null, [Validators.required]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.maxLength(1000)]],
      relatedSpec: [null],
      relatedSpecName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      author: [null, [Validators.maxLength(100)]],
      content: [null, [Validators.required]],
      fileAttachments: [[]],
      version: ['v1.0', [Validators.maxLength(20)]],
      status: ['Draft', [Validators.required]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt19Service {
  private mockManuals: ManualModel[] = [
    {
      id: '1',
      manualCode: 'UM-001',
      manualType: 'User Manual',
      title: 'คู่มือการใช้งานระบบ CRM',
      description: 'คู่มือสำหรับผู้ใช้งานทั่วไป',
      relatedSpec: 'SPEC-001',
      relatedSpecName: 'Customer Management',
      projectId: '1',
      projectName: 'ระบบ CRM',
      author: 'สมหญิง รักเรียน',
      content: 'เนื้อหาคู่มือ...',
      fileAttachments: ['user_manual_crm.pdf'],
      version: 'v1.0',
      status: 'Published',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/manual/combobox-project';
  apiGetComboboxSpec = '/api/manual/combobox-spec';
  apiGetLovManualType = '/api/manual/lov-type';
  apiGetLovStatus = '/api/manual/lov-status';

  save(data: ManualModel): Observable<string> {
    console.log('📝 Saving manual:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getManual(id: string): Observable<ManualModel> {
    const found = this.mockManuals.find((m) => m.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: ManualModel = {
      id: '',
      manualCode: '',
      manualType: '',
      title: '',
      description: '',
      relatedSpec: '',
      relatedSpecName: '',
      projectId: '',
      projectName: '',
      author: '',
      content: '',
      fileAttachments: [],
      version: 'v1.0',
      status: 'Draft',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }

  exportPdf(id: string): Observable<Blob> {
    return of(new Blob(['PDF content'], { type: 'application/pdf' })).pipe(delay(500));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt19',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicInputAreaComponent,
  ],
  templateUrl: './pmdt19.component.html',
  styles: [],
})
export class Pmdt19Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt19Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  manualId: string | null = null;
  isLoading = false;

  // ===== Options =====
  manualTypes = [
    'User Manual',
    'Admin Manual',
    'Installation Manual',
    'Operation Manual',
    'Troubleshooting Guide',
  ];
  statusOptions = ['Draft', 'Review', 'Approved', 'Published'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.manualId = id;
        this.loadManual(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt19Form.createForm(this.fb);
  }

  loadManual(id: string) {
    this.isLoading = true;
    this.service.getManual(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลคู่มือสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลคู่มือรหัสนี้');
        this.router.navigate(['/feature/pm/manual']);
      },
    });
  }

  // ✅ เพิ่มฟังก์ชัน removeFile
  removeFile(index: number) {
    const currentFiles = this.form.get('fileAttachments')?.value || [];
    currentFiles.splice(index, 1);
    this.form.patchValue({ fileAttachments: currentFiles });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/manual']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = this.form.value;
    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลคู่มือถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/manual']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt19Component;