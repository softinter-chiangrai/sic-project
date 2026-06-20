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
  reviewableType: string;
  reviewableId: string;
  reviewableName?: string;
  projectId: string;
  projectName?: string;
  reviewer: string;
  assignedTo: string;
  severity: string;
  status: string;
  dueDate: string;
  comments: ReviewCommentModel[];
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt11Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      reviewCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required, Validators.maxLength(2000)]],
      reviewableType: [null, [Validators.required]],
      reviewableId: [null, [Validators.required]],
      reviewableName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      reviewer: [null, [Validators.maxLength(100)]],
      assignedTo: [null, [Validators.maxLength(100)]],
      severity: ['Medium', [Validators.required]],
      status: ['Open', [Validators.required]],
      dueDate: [null, [Validators.required]],
      comments: [[]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt11Service {
  private mockReviews: DesignReviewModel[] = [
    {
      id: '1',
      reviewCode: 'DR-001',
      title: 'Review ER Diagram - Customer Table',
      description: 'ตรวจสอบ ER Diagram ของตาราง Customer',
      reviewableType: 'ER Diagram',
      reviewableId: 'er-1',
      reviewableName: 'ER Diagram v1.0',
      projectId: '1',
      projectName: 'ระบบ CRM',
      reviewer: 'วิชัย พัฒนาชัย',
      assignedTo: 'สมหญิง รักเรียน',
      severity: 'Medium',
      status: 'In Progress',
      dueDate: '2024-02-28',
      comments: [
        {
          id: 'c1',
          author: 'วิชัย พัฒนาชัย',
          text: 'ควรเพิ่มฟิลด์ created_at และ updated_at ในทุกตาราง',
          type: 'Correction',
          createdAt: '2024-02-20 09:00:00',
        },
      ],
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/design-review/combobox-project';
  apiGetComboboxReviewable = '/api/design-review/combobox-reviewable';
  apiGetLovReviewableType = '/api/design-review/lov-type';
  apiGetLovSeverity = '/api/design-review/lov-severity';
  apiGetLovStatus = '/api/design-review/lov-status';

  save(data: DesignReviewModel): Observable<string> {
    console.log('📝 Saving design review:', data);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getDesignReview(id: string): Observable<DesignReviewModel> {
    const found = this.mockReviews.find((r) => r.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const empty: DesignReviewModel = {
      id: '',
      reviewCode: '',
      title: '',
      description: '',
      reviewableType: '',
      reviewableId: '',
      reviewableName: '',
      projectId: '',
      projectName: '',
      reviewer: '',
      assignedTo: '',
      severity: 'Medium',
      status: 'Open',
      dueDate: '',
      comments: [],
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(empty).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt11',
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
  templateUrl: './pmdt11.component.html',
  styles: [],
})
export class Pmdt11Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt11Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  reviewId: string | null = null;
  isLoading = false;

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  commentTypeOptions = ['Suggestion', 'Correction', 'Risk', 'Question', 'Approval Note'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reviewId = id;
        this.loadDesignReview(id);
      }
    });

    // เมื่อเปลี่ยน reviewableType ให้โหลดรายการที่เกี่ยวข้อง
    this.form.get('reviewableType')?.valueChanges.subscribe((type) => {
      this.form.patchValue({ reviewableId: null });
    });
  }

  initForm(): void {
    this.form = Pmdt11Form.createForm(this.fb);
  }

  loadDesignReview(id: string) {
    this.isLoading = true;
    this.service.getDesignReview(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
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

  onBack(): void {
    this.router.navigate(['/feature/pm/design-review']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Design Review ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/design-review']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt11Component;