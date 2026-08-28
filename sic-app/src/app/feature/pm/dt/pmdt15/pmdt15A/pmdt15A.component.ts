import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';

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

  formData!: SicFromData<PmUserManualModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);

  sections = signal<PmUserManualSectionModel[]>([]);
  activeSectionIndex = signal<number>(0);

  typeOptions = [
    { label: 'User Manual (คู่มือสำหรับผู้ใช้งานทั่วไป)', value: 'USER' },
    { label: 'Admin Manual (คู่มือสำหรับผู้ดูแลระบบ)', value: 'ADMIN' },
    { label: 'Installation Manual (คู่มือการติดตั้งระบบ)', value: 'INSTALLATION' },
    { label: 'Operation Manual (คู่มือการปฏิบัติงาน)', value: 'OPERATION' },
    { label: 'Troubleshooting Guide (คู่มือการแก้ปัญหา)', value: 'TROUBLESHOOT' },
  ];

  statusOptions = [
    { label: 'Draft (ฉบับร่าง)', value: 'DRAFT' },
    { label: 'Review (อยู่ระหว่างการตรวจสอบ)', value: 'REVIEW' },
    { label: 'Approved (อนุมัติแล้ว)', value: 'APPROVED' },
    { label: 'Published (เผยแพร่แล้ว)', value: 'PUBLISHED' },
  ];

  pageDirty = () => this.formData?.dirty ?? false;

  ngOnInit(): void {
    const rawForm = Pmdt15AForm.createForm(this.fb);
    this.formData = new SicFromData<PmUserManualModel>(rawForm);

    const queryProj = this.route.snapshot.queryParams['projectId'];
    if (queryProj) {
      this.formData.form.controls['projectId'].setValue(queryProj);
    }

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit.set(true);
      this.id.set(paramId);
      this.loadData(paramId);
    } else {
      this.initDefaultSections();
    }
  }

  loadData(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.sections && data.sections.length > 0) {
          this.sections.set(data.sections);
        } else {
          this.initDefaultSections();
        }
        this.formData.markAsPristine();
      },
      error: (err) => {
        this.dialog.error('Error', err.message || 'ไม่สามารถโหลดข้อมูลได้');
      },
    });
  }

  initDefaultSections(): void {
    const defaults: PmUserManualSectionModel[] = [
      { sectionCode: 'SEC-1', sectionTitle: '1. บทนำและวัตถุประสงค์ (Overview)', content: 'รายละเอียดวัตถุประสงค์ของระบบ...', sortOrder: 1 },
      { sectionCode: 'SEC-2', sectionTitle: '2. การเข้าใช้งานระบบและสิทธิ์ (Login & Access)', content: 'ขั้นตอนการ เข้าสู่ระบบ และสิทธิ์ผู้ใช้งาน...', sortOrder: 2 },
      { sectionCode: 'SEC-3', sectionTitle: '3. ขั้นตอนการใช้งานฟีเจอร์หลัก (Core Workflows)', content: 'คำอธิบายขั้นตอนการทำงานทีละขั้นตอนพร้อมภาพประกอบ...', sortOrder: 3 },
      { sectionCode: 'SEC-4', sectionTitle: '4. คำถามที่พบบ่อยและการแก้ปัญหาเบื้องต้น (FAQ & Troubleshooting)', content: 'รายการปัญหาที่อาจพบและวิธีแก้ไข...', sortOrder: 4 },
    ];
    this.sections.set(defaults);
  }

  addSection(): void {
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
  }

  removeSection(index: number): void {
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
  }

  selectSection(index: number): void {
    this.activeSectionIndex.set(index);
  }

  updateActiveSectionContent(content: string): void {
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].content = content;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
    }
  }

  updateActiveSectionTitle(title: string): void {
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].sectionTitle = title;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
    }
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('คำเตือน', 'กรุณากรอกข้อมูลคู่มือที่จำเป็นให้ครบถ้วน');
      return;
    }

    const payload = {
      ...this.formData.value,
      state: this.isEdit() ? SicEntityState.Modified : SicEntityState.Added,
      sections: this.sections(),
    };

    this.isSaving.set(true);
    this.service.save(payload).subscribe({
      next: () => {
        this.dialog.success('สำเร็จ', 'บันทึกคู่มือการใช้งานเรียบร้อยแล้ว');
        this.formData.markAsPristine();
        this.router.navigate(['/feature/pm/manual']);
      },
      error: (err) => {
        this.dialog.error('ข้อผิดพลาด', err.message || 'บันทึกคู่มือไม่สำเร็จ');
      },
      complete: () => this.isSaving.set(false),
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/manual']);
  }
}

export default Pmdt15AComponent;