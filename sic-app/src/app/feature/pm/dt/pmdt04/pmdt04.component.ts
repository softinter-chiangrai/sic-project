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
import { SicFromData } from '../../../../core/model/sic-from-data';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface PhaseModel {
  id: string;
  phaseCode: string;
  phaseName: string;
  projectId: string;
  projectName?: string;
  description: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: string;
  dependency?: string;
  progress: number;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt04Form {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      phaseCode: [null, [Validators.required, Validators.maxLength(30)]],
      phaseName: [null, [Validators.required, Validators.maxLength(255)]],
      projectId: [null, [Validators.required]],
      projectName: [null],
      description: [null, [Validators.maxLength(1000)]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      owner: [null, [Validators.maxLength(100)]],
      status: ['Not Started', [Validators.required]],
      dependency: [null],
      progress: [0, [Validators.min(0), Validators.max(100)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt04Service {
  private mockPhases: PhaseModel[] = [
    {
      id: '1',
      phaseCode: 'PH-001',
      phaseName: 'Requirement & Analysis',
      projectId: '1',
      projectName: 'ระบบ CRM',
      description: 'เก็บความต้องการและวิเคราะห์ระบบ',
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      owner: 'สมหญิง รักเรียน',
      status: 'Done',
      dependency: '',
      progress: 100,
      isActive: true,
      state: 1,
      rowVersion: 0,
    },
  ];

  apiGetComboboxProject = '/api/phase/combobox-project';
  apiGetLovStatus = '/api/phase/lov-status';

  save(phase: PhaseModel): Observable<string> {
    console.log('📝 Saving phase:', phase);
    return of('บันทึกสำเร็จ').pipe(delay(500));
  }

  getPhase(id: string): Observable<PhaseModel> {
    const found = this.mockPhases.find((p) => p.id === id);
    if (found) {
      return of(found).pipe(delay(300));
    }
    const emptyPhase: PhaseModel = {
      id: '',
      phaseCode: '',
      phaseName: '',
      projectId: '',
      projectName: '',
      description: '',
      startDate: '',
      endDate: '',
      owner: '',
      status: 'Not Started',
      dependency: '',
      progress: 0,
      isActive: true,
      state: 1,
      rowVersion: 0,
    };
    return of(emptyPhase).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt04',
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
  templateUrl: './pmdt04.component.html',
  styles: [],
})
export class Pmdt04Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt04Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  phaseId: string | null = null;
  isLoading = false;

  statusOptions = ['Not Started', 'In Progress', 'Done', 'Delayed'];

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.phaseId = id;
        this.loadPhase(id);
      }
    });
  }

  initForm(): void {
    this.form = Pmdt04Form.createForm(this.fb);
  }

  loadPhase(id: string) {
    this.isLoading = true;
    this.service.getPhase(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูล Phase สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Phase รหัสนี้');
        this.router.navigate(['/feature/pm/phase']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/phase']);
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
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Phase ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/phase']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt04Component;