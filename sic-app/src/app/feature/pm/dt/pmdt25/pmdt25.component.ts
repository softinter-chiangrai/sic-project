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
export interface DocumentVersionModel {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  version: string;
  status: string;
  changedBy: string;
  changedDate: string;
  changeSummary: string;
  previousVersion: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt25Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      documentType: [null, [Validators.required]],
      documentCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      version: [null, [Validators.required, Validators.maxLength(20)]],
      status: ['Draft', [Validators.required]],
      changedBy: [null, [Validators.maxLength(100)]],
      changedDate: [null, [Validators.required]],
      changeSummary: [null, [Validators.required, Validators.maxLength(1000)]],
      previousVersion: [null, [Validators.maxLength(20)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt25Service {
  private mockVersions: DocumentVersionModel[] = [
    {
      id: '1',
      documentType: 'Requirement',
      documentCode: 'REQ-001',
      title: 'ระบบ Login',
      version: 'v1.0',
      status: 'Draft',
      changedBy: 'สมหญิง รักเรียน',
      changedDate: '2024-01-15 09:00:00',
      changeSummary: 'สร้างเอกสาร Requirement ฉบับแรก',
      previousVersion: '-',
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxDocument = '/api/version/combobox-document';
  apiGetLovDocumentType = '/api/version/lov-type';
  apiGetLovStatus = '/api/version/lov-status';

  save(data: DocumentVersionModel): Observable<string> {
    console.log('📝 Saving version:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getVersion(id: string): Observable<DocumentVersionModel> {
    const found = this.mockVersions.find((v) => v.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: DocumentVersionModel = {
      id: '',
      documentType: '',
      documentCode: '',
      title: '',
      version: '',
      status: 'Draft',
      changedBy: '',
      changedDate: '',
      changeSummary: '',
      previousVersion: '-',
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt25',
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
  templateUrl: './pmdt25.component.html',
  styles: [],
})
export class Pmdt25Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt25Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  versionId: string | null = null;
  isLoading = false;

  // ===== Options =====
  documentTypes = [
    'Requirement',
    'DFD',
    'ER Diagram',
    'Specification',
    'Test Case',
    'User Manual',
    'Delivery Document',
    'Contract',
    'Change Request',
  ];
  statusOptions = ['Draft', 'Approved', 'Active'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.versionId = id;
        this.loadVersion(id);
      }
    });

    // เมื่อเปลี่ยน documentType ให้โหลด document codes
    this.form.get('documentType')?.valueChanges.subscribe((type) => {
      this.form.patchValue({ documentCode: null });
    });
  }

  initForm(): void {
    this.form = Pmdt25Form.createForm(this.fb);
  }

  loadVersion(id: string) {
    this.isLoading = true;
    this.service.getVersion(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลเวอร์ชันสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลเวอร์ชันรหัสนี้');
        this.router.navigate(['/feature/pm/version']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/version']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลเวอร์ชันถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/version']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Approved: 'อนุมัติ',
      Active: 'ใช้งาน',
    };
    return map[status] || status;
  }
}

export default Pmdt25Component;