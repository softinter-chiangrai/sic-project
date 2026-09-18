// src/app/feature/bu/rt/burt04/burt04A/burt04A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SicButtonComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ComboboxRole } from '../burt04.model';
import { burt04Service } from '../burt04.service';


import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { Burt04AForm, Burt04AFormModel } from './burt04A.form';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-burt04A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './burt04A.component.html',
})
export class Burt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(burt04Service);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  // ✅ URL สำหรับ combobox บทบาท
  roleComboboxUrl = this.service.getRoleComboboxUrl();

  isEdit = false;
  memberId: string | null = null;
  isLoading = signal(false);
  isSaving = signal(false);
  businessId = this.service.getBusinessId() || '';
  allRoles = signal<ComboboxRole[]>([]);

  formData!: SicFromData<Burt04AFormModel>;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit() {
    if (!this.businessId) {
      this.dialog.error(this.translate.instant('BURT04A_NO_BUSINESS_TITLE'), this.translate.instant('BURT04A_SELECT_BUSINESS_MSG'));
      this.router.navigate(['/feature/bu/burt04']);
      return;
    }
    this.formData = new SicFromData<Burt04AFormModel>(Burt04AForm.createForm(this.fb));
    this.loadRoles();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.memberId = id;
        this.loadMember(id);
      }
    });
  }

  // ✅ เพิ่ม type ให้กับ callback parameters
  loadRoles() {
    this.service.getComboboxRoles().subscribe({
      next: (roles: ComboboxRole[]) => {
        this.allRoles.set(roles);
      },
      error: (err: any) => console.error('Load roles error', err),
    });
  }

  loadMember(id: string) {
    this.isLoading.set(true);
    this.service
      .getMemberById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (member: any) => {
          this.formData.patchValue({
            id: member.id,
            userId: member.userId,
            userName: member.userName,
            userEmail: member.userEmail,
            roleIds: member.roleIds || [],
            isActive: member.isActive,
          } as any);
        },
        error: (err: any) => {
          console.error('Load member error', err);
          this.dialog.error(this.translate.instant('BURT04A_LOAD_FAILED_TITLE'), this.translate.instant('BURT04A_MEMBER_NOT_FOUND_MSG'));
          this.router.navigate(['/feature/bu/team']);
        },
      });
  }

  onBack() {
    this.router.navigate(['/feature/bu/team']);
  }

  submit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('BURT04A_INCOMPLETE_FORM_TITLE'), this.translate.instant('BURT04A_ROLE_REQUIRED_MSG'));
      return;
    }

    this.isSaving.set(true);
    const raw = this.formData.formGroup.getRawValue();

    this.service
      .updateMember(raw.id, raw.roleIds, raw.isActive)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success(this.translate.instant('BURT04A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT04A_SAVE_SUCCESS_MSG'));
          this.router.navigate(['/feature/bu/team']);
        },
        error: (err: any) => {
          this.dialog.error(this.translate.instant('BURT04A_ERROR_TITLE'), err.message || this.translate.instant('BURT04A_SAVE_ERROR_MSG'));
          console.error('Update error', err);
        },
      });
  }
}

export default Burt04AComponent;