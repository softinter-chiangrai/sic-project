// src/app/feature/bu/rt/burt05/burt05A/burt05A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicButtonComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicInputNumberComponent } from 'sic-ng';
import { SicCheckboxComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { Program } from '../burt05.model';
import { burt05Service } from '../burt05.service';

import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { Burt05AForm } from './burt05A.form';
import { Burt05AModel, Burt05APageData } from './burt05A.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-burt05A',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputNumberComponent,
    SicCheckboxComponent,
    SicComboboxComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './burt05A.component.html',
  styleUrl: './burt05A.component.css',
})
export class Burt05AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(burt05Service);
  private dialog = inject(DialogService);
  private translate = inject(TranslateService);

  formData!: SicFromData<Burt05AModel>;

  get programForm(): FormGroup {
    return this.formData?.formGroup;
  }

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  isPermissionMode = signal(false);
  programId = signal<string | null>(null);
  roles = signal<any[]>([]);
  rolePermissions = signal<{ roleId: string; roleName: string; level: string }[]>([]);
  permissionLevels = this.service.getPermissionLevels();
  programs = signal<Program[]>([]);

  programOptions = computed(() => {
    return this.programs().map((p) => ({
      value: p.id,
      text: `${p.programCode} - ${p.programName || p.programNameLocal || p.programNameEn}`,
    }));
  });

  permissionSelectOptions: { value: string; text: string }[] = [];

  ngOnInit() {
    this.permissionSelectOptions = [
      { value: 'Full', text: this.translate.instant('BURT05A_LEVEL_FULL_OPT') },
      { value: 'Edit', text: this.translate.instant('BURT05A_LEVEL_EDIT_OPT') },
      { value: 'Approve', text: this.translate.instant('BURT05A_LEVEL_APPROVE_OPT') },
      { value: 'View', text: this.translate.instant('BURT05A_LEVEL_VIEW_OPT') },
      { value: 'None', text: this.translate.instant('BURT05A_LEVEL_NONE_OPT') },
    ];
    const id = this.route.snapshot.paramMap.get('id');
    const segments = this.route.snapshot.url;
    const lastSegment = segments[segments.length - 1]?.path;

    if (lastSegment === 'permissions' && id) {
      this.formData = new SicFromData<Burt05AModel>(Burt05AForm.createForm(this.fb));
      this.isPermissionMode.set(true);
      this.programId.set(id);
      this.loadProgramWithPermissions(id);
      return;
    }

    const page: Burt05APageData = this.route.snapshot.data['form'];
    this.formData = page.programData;
    this.programs.set(page.programs);

    if (id) {
      this.isEditMode.set(true);
      this.programId.set(id);
    } else {
      this.isEditMode.set(false);
      this.isPermissionMode.set(false);
    }
  }

  loadProgramWithPermissions(id: string) {
    this.isLoading.set(true);

    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.isLoading.set(false);
      this.dialog.error(this.translate.instant('BURT05A_NO_BUSINESS_TITLE'), this.translate.instant('BURT05A_SELECT_BUSINESS_MSG'));
      this.router.navigate(['/management/business']);
      return;
    }

    forkJoin({
      program: this.service.getProgram(id),
      rolePrograms: this.service.getRoleProgramsByProgram(id),
    }).subscribe({
      next: ({ program, rolePrograms }) => {
        this.formData.formGroup.patchValue(program);
        this.formData.resetModel(this.formData.formGroup.getRawValue() as any);
        this.programId.set(id);

        this.service.getRoles(businessId).subscribe({
          next: (roles: any[]) => {
            if (!roles || roles.length === 0) {
              this.dialog.warn(this.translate.instant('BURT05A_NO_ROLES_FOUND_TITLE'), this.translate.instant('BURT05A_CREATE_ROLE_FIRST_MSG'));
              this.roles.set([]);
              this.rolePermissions.set([]);
              this.isLoading.set(false);
              return;
            }

            this.roles.set(roles);
            const permissions = roles.map((role: any) => {
              const existing = rolePrograms.find((rp: any) => rp.businessRoleId === role.id);
              let level = 'None';
              if (existing && existing.isActive) {
                level = this.mapBooleansToLevel(existing);
              }
              return {
                roleId: role.id,
                roleName: role.roleName || role.roleNameEn || role.roleCode,
                level: level,
              };
            });
            this.rolePermissions.set(permissions);
            this.isLoading.set(false);
          },
          error: (err: any) => {
            this.isLoading.set(false);
            this.dialog.error(this.translate.instant('BURT05A_LOAD_FAILED_TITLE'), this.translate.instant('BURT05A_LOAD_ROLES_FAILED_MSG'));
          },
        });
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.dialog.error(this.translate.instant('BURT05A_LOAD_FAILED_TITLE'), this.translate.instant('BURT05A_PROGRAM_NOT_FOUND_MSG'));
        this.router.navigate(['/feature/bu/program']);
      },
    });
  }

  mapBooleansToLevel(perm: any): string {
    if (perm.isAdd && perm.isSave && perm.isRemove && perm.isPrint && perm.isBack && perm.isSearch)
      return 'Full';
    if (
      perm.isAdd &&
      perm.isSave &&
      !perm.isRemove &&
      !perm.isPrint &&
      perm.isBack &&
      perm.isSearch
    )
      return 'Edit';
    if (
      !perm.isAdd &&
      perm.isSave &&
      !perm.isRemove &&
      !perm.isPrint &&
      perm.isBack &&
      perm.isSearch
    )
      return 'Approve';
    if (
      !perm.isAdd &&
      !perm.isSave &&
      !perm.isRemove &&
      !perm.isPrint &&
      perm.isBack &&
      perm.isSearch
    )
      return 'View';
    return 'None';
  }

  mapLevelToBooleans(level: string) {
    switch (level) {
      case 'Full':
        return {
          isAdd: true,
          isBack: true,
          isPrint: true,
          isRemove: true,
          isSave: true,
          isSearch: true,
        };
      case 'Edit':
        return {
          isAdd: true,
          isBack: true,
          isPrint: false,
          isRemove: false,
          isSave: true,
          isSearch: true,
        };
      case 'Approve':
        return {
          isAdd: false,
          isBack: true,
          isPrint: false,
          isRemove: false,
          isSave: true,
          isSearch: true,
        };
      case 'View':
        return {
          isAdd: false,
          isBack: true,
          isPrint: false,
          isRemove: false,
          isSave: false,
          isSearch: true,
        };
      case 'None':
      default:
        return {
          isAdd: false,
          isBack: false,
          isPrint: false,
          isRemove: false,
          isSave: false,
          isSearch: false,
        };
    }
  }

  saveProgram() {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      this.dialog.warn(this.translate.instant('BURT05A_FORM_INCOMPLETE_TITLE'), this.translate.instant('BURT05A_FORM_INCOMPLETE_MSG'));
      return;
    }

    const data = this.programForm.value as Program;
    const programId = this.programId();

    if (programId) {
      data.id = programId;
      this.isSaving.set(true);
      this.service.saveProgram(data).subscribe({
        next: () => {
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success(this.translate.instant('BURT05A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT05A_SAVE_SUCCESS_MSG'));
          this.isSaving.set(false);
          this.router.navigate(['/feature/bu/program']);
        },
        error: (err: any) => {
          this.isSaving.set(false);
          this.dialog.error(this.translate.instant('BURT05A_SAVE_ERROR_TITLE'), err.error?.message || this.translate.instant('BURT05A_GENERIC_ERROR_MSG'));
        },
      });
      return;
    }

    this.isSaving.set(true);
    this.service.saveProgram(data).subscribe({
      next: () => {
        this.isSaved = true;
        this.formData.markAsPristine();
        this.dialog.success(this.translate.instant('BURT05A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT05A_SAVE_SUCCESS_MSG'));
        this.isSaving.set(false);
        this.router.navigate(['/feature/bu/program']);
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('BURT05A_SAVE_ERROR_TITLE'), err.error?.message || this.translate.instant('BURT05A_GENERIC_ERROR_MSG'));
      },
    });
  }

  savePermissions() {
    const programId = this.programId();

    if (!programId) {
      this.dialog.error(this.translate.instant('BURT05A_PROGRAM_NOT_FOUND_TITLE'), this.translate.instant('BURT05A_PROGRAM_NOT_FOUND_MSG'));
      return;
    }

    if (this.roles().length === 0) {
      this.dialog.warn(this.translate.instant('BURT05A_NO_ROLES_TITLE'), this.translate.instant('BURT05A_NO_ROLES_MSG'));
      return;
    }

    this.isSaving.set(true);

    const modules = this.roles().map((role: any) => {
      const perm = this.rolePermissions().find((rp) => rp.roleId === role.id);
      const level = perm?.level || 'None';
      const flags = this.mapLevelToBooleans(level);

      return {
        businessRoleId: role.id,
        programId: programId,
        isActive: level !== 'None',
        isAdd: flags.isAdd,
        isBack: flags.isBack,
        isPrint: flags.isPrint,
        isRemove: flags.isRemove,
        isSave: flags.isSave,
        isSearch: flags.isSearch,
      };
    });

    const programData = this.programForm.value as Program;
    programData.id = programId;

    this.service.saveProgram(programData).subscribe({
      next: () => {
        this.service.bulkSaveRolePermissions(programId, modules).subscribe({
          next: () => {
            this.isSaved = true;
            this.formData.markAsPristine();
            this.dialog.success(this.translate.instant('BURT05A_SAVE_PERMISSIONS_SUCCESS_TITLE'), this.translate.instant('BURT05A_SAVE_PERMISSIONS_SUCCESS_MSG'));
            this.isSaving.set(false);
            this.router.navigate(['/feature/bu/program']);
          },
          error: (err: any) => {
            this.isSaving.set(false);
            this.dialog.error(this.translate.instant('BURT05A_SAVE_PERMISSIONS_ERROR_TITLE'), err.error?.message || this.translate.instant('BURT05A_GENERIC_ERROR_MSG'));
          },
        });
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('BURT05A_SAVE_PROGRAM_DATA_ERROR_TITLE'), err.error?.message || this.translate.instant('BURT05A_GENERIC_ERROR_MSG'));
      },
    });
  }

  goBack() {
    this.router.navigate(['/feature/bu/program']);
  }

  getRoleLevel(roleId: string): string {
    return this.rolePermissions().find((rp) => rp.roleId === roleId)?.level || 'None';
  }

  updateRolePermission(roleId: string, level: any) {
    this.rolePermissions.update((list) =>
      list.map((rp) => (rp.roleId === roleId ? { ...rp, level: String(level || 'None') } : rp)),
    );
  }

  getLevelColor(level: string): string {
    const map: Record<string, string> = {
      Full: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      View: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      None: 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
    };
    return map[level] || map['None'];
  }

  getLevelText(level: string): string {
    const map: Record<string, string> = {
      Full: this.translate.instant('BURT05A_LEVEL_FULL'),
      Edit: this.translate.instant('BURT05A_LEVEL_EDIT'),
      Approve: this.translate.instant('BURT05A_LEVEL_APPROVE'),
      View: this.translate.instant('BURT05A_LEVEL_VIEW'),
      None: this.translate.instant('BURT05A_LEVEL_NONE'),
    };
    return map[level] || level;
  }
}

export default Burt05AComponent;