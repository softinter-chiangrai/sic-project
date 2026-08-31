// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { DateTimeUtil } from '../../../../../core/utils/datetime.util';
import { Pmrt02Service } from '../../pmrt02/pmrt02.service';
import { Pmrt04AForm } from './pmrt04A.form';
import { ContractModel } from './pmrt04A.model';
import { Pmrt04AService } from './pmrt04A.service';

@Component({
  selector: 'app-pmrt04a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicDatepickerComponent,
  ],
  templateUrl: './pmrt04A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt04AService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);
  private navigation = inject(NavigationService);
  private projectService = inject(Pmrt02Service);
  private cdr = inject(ChangeDetectorRef);

  formData!: SicFromData<ContractModel>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isView = false;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;

  // Context info
  customerId: string | null = null;
  customerName: string | null = null;
  projectId: string | null = null;
  projectName: string | null = null;

  pageDirty = () => (this.isView ? false : (this.formData?.isChanged ?? false));

  ngOnInit(): void {
    this.initForm();

    if (this.router.url.includes('/view')) {
      this.isView = true;
    }

    // รับ projectId จาก queryParams (ในกรณีสร้างใหม่)
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'view') {
        this.isView = true;
      }
      const projectId = params['projectId'];
      if (projectId) {
        this.projectId = projectId;
        this.projectService.getProject(projectId).subscribe({
          next: (project) => {
            this.customerId = project.customerId;
            this.customerName = project.customerName || null;
            this.projectName = project.projectName || null;
            this.form.patchValue({
              projectId,
              customerId: project.customerId,
              projectName: project.projectName,
              customerName: project.customerName,
            });
            if (this.isView) {
              this.form.disable();
            }
            this.cdr.detectChanges();
          },
          error: () => this.navigation.navigate(['/feature/pm/contract']),
        });
      }
    });

    // กรณีแก้ไขหรือดู: โหลดข้อมูลสัญญา
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.contractId = id;
        this.loadContract(id);
      }
    });
  }

  initForm(): void {
    this.formData = new SicFromData<ContractModel>(Pmrt04AForm.createForm(this.fb));
  }

  loadContract(id: string) {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.isView) {
            this.form.disable();
          }
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          if (data.customerId) {
            this.customerId = data.customerId;
          }
          if (data.customerName) {
            this.customerName = data.customerName;
          }
          if (data.projectId) {
            this.projectId = data.projectId;
          }
          if (data.projectName) {
            this.projectName = data.projectName;
          }
          this.form.patchValue(data);
          if (this.isView) {
            this.form.disable();
          }
          this.formData.resetModel(this.form.getRawValue());
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสัญญารหัสนี้');
          this.navigation.navigate(['/feature/pm/contract']);
        },
      });
  }

  onBack(): void {
    if (this.projectId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { projectId: this.projectId },
      });
    } else if (this.customerId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { customerId: this.customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/contract']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isSaving = true;

    const data = { ...this.form.getRawValue() } as ContractModel;
    if (data.startDate) {
      data.startDate = DateTimeUtil.toInstantIsoString(data.startDate) || data.startDate;
    }
    if (data.endDate) {
      data.endDate = DateTimeUtil.toInstantIsoString(data.endDate) || data.endDate;
    }

    if (this.customerId) {
      data.customerId = this.customerId;
    } else {
      this.dialog.warn('ไม่พบข้อมูลลูกค้า', 'กรุณาเลือกลูกค้าก่อน');
      this.isSaving = false;
      return;
    }

    this.service
      .save(data)
      .pipe(finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.formData.resetModel(this.form.getRawValue());
          this.form.markAsPristine();
          this.dialog.success('บันทึกสำเร็จ', 'ข้อมูลสัญญาถูกบันทึกเรียบร้อย').then(() => {
            if (this.projectId) {
              this.navigation.navigate(['/feature/pm/contract'], {
                queryParams: { projectId: this.projectId },
              });
            } else {
              this.navigation.navigate(['/feature/pm/contract'], {
                queryParams: { customerId: this.customerId },
              });
            }
          });
        },
        error: (error) => {
          this.dialog.error('บันทึกไม่สำเร็จ', error.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
  }
}
