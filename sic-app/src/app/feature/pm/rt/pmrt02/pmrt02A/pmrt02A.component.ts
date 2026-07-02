// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { environment } from '../../../../../../environments/environment';

// ===== Interface =====
export interface ProjectModel {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string; // ยังคงไว้เพื่ออ้างอิง แต่ไม่ต้องแสดงใน Form
  customerName?: string;
  contractId: string; // ยังคงไว้เพื่ออ้างอิง
  contractNo?: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-pmrt02a',
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
  templateUrl: './pmrt02A.component.html',
  styles: [],
})
export class Pmrt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  projectId: string | null = null;
  
  // ข้อมูลสำหรับ Combobox (ถ้าจำเป็นต้องใช้กรองข้อมูล)
  statusOptions = [
    'Prospect', 'Contract Drafting', 'Contract Signed', 'Requirement Gathering',
    'Requirement Approval', 'System Analysis', 'DFD Design', 'ER Design',
    'Specification Design', 'Specification Approval', 'Planning', 'Development',
    'Internal Testing', 'UAT', 'Bug Fixing', 'Ready for Delivery', 'Delivered',
    'Invoicing', 'Closed', 'MA Active',
  ];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.projectId = id;
        this.loadProject(id);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      projectCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectName: [null, [Validators.required, Validators.maxLength(255)]],
      // ซ่อนแต่ยังคงค่าไว้
      customerId: [null], 
      contractId: [null],
      
      startDate: [null, [Validators.required]],
      plannedEndDate: [null, [Validators.required]],
      actualEndDate: [null],
      
      budgetManday: [null, [Validators.required, Validators.min(0)]],
      usedManday: [0, [Validators.min(0)]],
      
      status: ['Prospect', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      
      description: [null],
      isActive: [true],
    });
  }

  loadProject(id: string) {
    // Mock Data หรือเรียก API จริง
    this.getMockData(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
      },
      error: (err) => {
        console.error('Load project error:', err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลโครงการ');
        this.router.navigate(['/feature/pm/pmrt02']);
      },
    });
  }

  // Mock Function (แทนที่ด้วย Service จริงเมื่อเชื่อมต่อ Backend)
  getMockData(id: string): Observable<ProjectModel> {
    const mock: ProjectModel = {
      id: id,
      projectCode: 'PRJ-001',
      projectName: 'ระบบ CRM',
      customerId: 'CUST-001',
      contractId: 'CON-001',
      startDate: '2024-01-01',
      plannedEndDate: '2024-12-31',
      budgetManday: 100,
      usedManday: 20,
      status: 'Development',
      priority: 'High',
      description: 'พัฒนาระบบบริหารลูกค้าสัมพันธ์',
      isActive: true,
    };
    return of(mock).pipe(delay(500));
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt02']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const data = this.form.value;
    console.log('Saving Project:', data);

    // เรียก Service Save ที่นี่
    this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลโครงการถูกบันทึกเรียบร้อย').then(() => {
      this.router.navigate(['/feature/pm/pmrt02']);
    });
  }

  pageDirty = () => this.form?.dirty ?? false;
}