// src/app/feature/pm/rt/pmrt30/pmrt30A/pmrt30A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmrt30Service, Program, RolePermission, CreateProgramWithPermissionsRequest } from '../pmrt30.service';

@Component({
  selector: 'app-pmrt30A',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pmrt30A.component.html',
})
export class Pmrt30AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Pmrt30Service);
  private dialog = inject(DialogService);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  isPermissionMode = signal(false);
  programId = signal<string | null>(null);
  roles = signal<any[]>([]);
  rolePermissions = signal<{ roleId: string; roleName: string; level: string }[]>([]);
  permissionLevels = this.service.getPermissionLevels();
  programs = signal<Program[]>([]);

  programForm: FormGroup = this.fb.group({
    programCode: ['', [Validators.required, Validators.maxLength(50)]],
    programNameEn: ['', [Validators.required, Validators.maxLength(255)]],
    programNameLocal: ['', [Validators.required, Validators.maxLength(255)]],
    programIcon: [''],
    routePath: ['', Validators.maxLength(500)],
    parentProgramId: [null],
    sortOrder: [0],
    isActive: [true],
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      const segments = this.route.snapshot.url;
      const lastSegment = segments[segments.length - 1]?.path;

      // โหลดโปรแกรมทั้งหมดเพื่อใช้เป็น parent options
      this.service.getPrograms().subscribe({
        next: (progs) => this.programs.set(progs),
      });

      if (lastSegment === 'permissions' && id) {
        this.isPermissionMode.set(true);
        this.programId.set(id);
        this.loadProgramWithPermissions(id);
      } else if (id) {
        this.isEditMode.set(true);
        this.programId.set(id);
        this.loadProgram(id);
      } else {
        this.isEditMode.set(false);
        this.isPermissionMode.set(false);
      }
    });
  }

  loadProgram(id: string) {
    this.isLoading.set(true);
    this.service.getProgram(id).subscribe({
      next: (program) => {
        this.programForm.patchValue(program);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโปรแกรม');
        this.router.navigate(['/feature/pm/pmrt30']);
      },
    });
  }

  loadProgramWithPermissions(id: string) {
    this.isLoading.set(true);

    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.isLoading.set(false);
      this.dialog.error('ไม่พบธุรกิจ', 'กรุณาเลือกธุรกิจก่อน');
      this.router.navigate(['/management/business']);
      return;
    }

    forkJoin({
      program: this.service.getProgram(id),
      rolePrograms: this.service.getRoleProgramsByProgram(id),
    }).subscribe({
      next: ({ program, rolePrograms }) => {
        this.programForm.patchValue(program);
        this.programId.set(id);

        this.service.getRoles(businessId).subscribe({
          next: (roles) => {
            if (!roles || roles.length === 0) {
              this.dialog.warn('ไม่พบบทบาท', 'กรุณาสร้างบทบาทก่อนที่หน้า pmrt28');
              this.roles.set([]);
              this.rolePermissions.set([]);
              this.isLoading.set(false);
              return;
            }

            this.roles.set(roles);
            // ✅ ใช้ roleName ที่แปลแล้ว
            const permissions = roles.map((role) => {
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
          error: () => {
            this.isLoading.set(false);
            this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดบทบาทได้');
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโปรแกรม');
        this.router.navigate(['/feature/pm/pmrt30']);
      },
    });
  }

  mapBooleansToLevel(perm: any): string {
    if (perm.isAdd && perm.isSave && perm.isRemove && perm.isPrint && perm.isBack && perm.isSearch) return 'Full';
    if (perm.isAdd && perm.isSave && !perm.isRemove && !perm.isPrint && perm.isBack && perm.isSearch) return 'Edit';
    if (!perm.isAdd && perm.isSave && !perm.isRemove && !perm.isPrint && perm.isBack && perm.isSearch) return 'Approve';
    if (!perm.isAdd && !perm.isSave && !perm.isRemove && !perm.isPrint && perm.isBack && perm.isSearch) return 'View';
    return 'None';
  }

  mapLevelToBooleans(level: string) {
    switch (level) {
      case 'Full':
        return { isAdd: true, isBack: true, isPrint: true, isRemove: true, isSave: true, isSearch: true };
      case 'Edit':
        return { isAdd: true, isBack: true, isPrint: false, isRemove: false, isSave: true, isSearch: true };
      case 'Approve':
        return { isAdd: false, isBack: true, isPrint: false, isRemove: false, isSave: true, isSearch: true };
      case 'View':
        return { isAdd: false, isBack: true, isPrint: false, isRemove: false, isSave: false, isSearch: true };
      case 'None':
      default:
        return { isAdd: false, isBack: false, isPrint: false, isRemove: false, isSave: false, isSearch: false };
    }
  }

  saveProgram() {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่สมบูรณ์', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const data = this.programForm.value as Program;
    const programId = this.programId();

    if (programId) {
      data.id = programId;
      this.isSaving.set(true);
      this.service.saveProgram(data).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'บันทึกโปรแกรมเรียบร้อย');
          this.isSaving.set(false);
          this.router.navigate(['/feature/pm/pmrt30']);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
      return;
    }

    this.isSaving.set(true);
    this.service.saveProgram(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกโปรแกรมเรียบร้อย');
        this.isSaving.set(false);
        this.router.navigate(['/feature/pm/pmrt30']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  savePermissions() {
    const programId = this.programId();

    if (!programId) {
      this.dialog.error('ไม่พบโปรแกรม', 'กรุณาสร้างโปรแกรมก่อนกำหนดสิทธิ์');
      return;
    }

    if (this.roles().length === 0) {
      this.dialog.warn('ไม่มีบทบาท', 'กรุณาสร้างบทบาทก่อนที่หน้า pmrt28');
      return;
    }

    this.isSaving.set(true);

    const modules = this.roles().map((role) => {
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
            this.dialog.success('บันทึกสำเร็จ', 'บันทึกสิทธิ์โปรแกรมเรียบร้อย');
            this.isSaving.set(false);
            this.router.navigate(['/feature/pm/pmrt30']);
          },
          error: (err) => {
            this.isSaving.set(false);
            this.dialog.error('บันทึกสิทธิ์ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
          },
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('บันทึกข้อมูลโปรแกรมไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
      },
    });
  }

  goBack() {
    this.router.navigate(['/feature/pm/pmrt30']);
  }

  getRoleLevel(roleId: string): string {
    return this.rolePermissions().find((rp) => rp.roleId === roleId)?.level || 'None';
  }

  updateRolePermission(roleId: string, level: string) {
    this.rolePermissions.update((list) =>
      list.map((rp) => (rp.roleId === roleId ? { ...rp, level } : rp))
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
      Full: 'เต็มรูปแบบ',
      Edit: 'แก้ไข/เพิ่ม',
      Approve: 'อนุมัติ',
      View: 'ดูอย่างเดียว',
      None: 'ไม่มีสิทธิ์',
    };
    return map[level] || level;
  }
}

export default Pmrt30AComponent;