// src/app/feature/pm/dt/pmdt25/pmdt25.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicCheckboxComponent } from '../../../../core/component/sic-checkbox/sic-checkbox.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { DocumentVersionModel } from './pmdt25.model';
import { Pmdt25Service } from './pmdt25.service';

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
    SicCheckboxComponent,
  ],
  templateUrl: './pmdt25.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt25Component implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt25Service);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly navigation = inject(NavigationService);

  form!: FormGroup;
  isEdit = false;
  versionId: string | null = null;

  // ✅ ใช้ signal() และเรียกใช้ด้วย () ใน template
  isLoading = signal(false);
  isSaving = signal(false);
  versions = signal<DocumentVersionModel[]>([]);
  loadingVersions = signal(false);

  // ===== Options =====
  // ไม่ต้องใช้ documentTypes hardcode แล้ว เพราะใช้ Combobox จาก API
  // statusOptions จะใช้ Combobox จาก API ด้วย

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

    // เมื่อ documentType เปลี่ยน ให้โหลด versions และ combobox
    this.form.get('documentType')?.valueChanges.subscribe(() => {
      this.loadVersions();
    });

    // เมื่อ documentId เปลี่ยน ให้โหลด versions
    this.form.get('documentId')?.valueChanges.subscribe(() => {
      this.loadVersions();
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      documentType: [null, [Validators.required]],
      documentId: [null, [Validators.required]],
      versionNo: [null, [Validators.required, Validators.maxLength(20)]],
      changeSummary: [null, [Validators.maxLength(2000)]],
      filePath: [null, [Validators.maxLength(500)]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }

  loadVersion(id: string) {
    this.isLoading.set(true);
    this.service.getVersion(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.loadVersions();
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลเวอร์ชันรหัสนี้');
          this.router.navigate(['/feature/pm/version']);
        },
      });
  }

  loadVersions() {
    const documentType = this.form.get('documentType')?.value;
    const documentId = this.form.get('documentId')?.value;

    if (!documentType || !documentId) {
      this.versions.set([]);
      return;
    }

    this.loadingVersions.set(true);
    this.service.getVersions(documentType, documentId)
      .pipe(finalize(() => this.loadingVersions.set(false)))
      .subscribe({
        next: (data) => {
          this.versions.set(data);
          console.log(`✅ โหลดประวัติเวอร์ชัน ${data.length} รายการ`);
        },
        error: (error) => {
          console.error('❌ โหลดประวัติเวอร์ชันไม่สำเร็จ:', error);
          this.versions.set([]);
          this.dialog.warn('ไม่พบประวัติเวอร์ชัน', 'ไม่สามารถโหลดประวัติเวอร์ชันของเอกสารนี้ได้');
        },
      });
  }

  onBack(): void {
    if (this.form.dirty) {
      this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่ได้บันทึก ต้องการออกใช่หรือไม่?')
        .then((confirmed) => {
          if (confirmed) {
            this.navigateToList();
          }
        });
    } else {
      this.navigateToList();
    }
  }

  private navigateToList(): void {
    this.router.navigate(['/feature/pm/version']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving.set(true);
    const data = this.form.value;

    // Set state
    if (!this.isEdit) {
      data.state = 4; // ADDED
      data.rowVersion = 0;
    } else {
      data.state = 3; // MODIFIED
    }

    this.service.saveVersion(data)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลเวอร์ชันถูกบันทึกเรียบร้อย')
            .then(() => {
              this.form.markAsPristine();
              this.loadVersions();
              if (!this.isEdit) {
                this.router.navigate(['/feature/pm/version']);
              }
            });
        },
        error: (error) => {
          this.dialog.error('บันทึกไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  deleteVersion(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบเวอร์ชันนี้ใช่หรือไม่?')
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteVersion(id).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'เวอร์ชันถูกลบแล้ว');
              this.loadVersions();
            },
            error: (error) => {
              this.dialog.error('ลบไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        }
      });
  }

  deleteAllVersions() {
    const documentType = this.form.get('documentType')?.value;
    const documentId = this.form.get('documentId')?.value;

    if (!documentType || !documentId) {
      this.dialog.warn('ไม่พบเอกสาร', 'กรุณาเลือกประเภทและรหัสเอกสาร');
      return;
    }

    this.dialog.confirm(
      'ยืนยันการลบทั้งหมด',
      `คุณต้องการลบประวัติเวอร์ชันทั้งหมดของเอกสารนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถกู้คืนได้`
    ).then((confirmed) => {
      if (confirmed) {
        this.service.deleteVersionsByDocument(documentType, documentId).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ประวัติเวอร์ชันทั้งหมดถูกลบแล้ว');
            this.versions.set([]);
          },
          error: (error) => {
            this.dialog.error('ลบไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาด');
          },
        });
      }
    });
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  viewVersion(id: string) {
    this.router.navigate(['/feature/pm/version', id, 'view']);
  }
}

export default Pmdt25Component;