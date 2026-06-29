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
      const path = this.route.snapshot.url[0]?.path;

      // โหลดโปรแกรมทั้งหมดเพื่อใช้เป็น parent options
      this.service.getPrograms().subscribe({
        next: (progs) => this.programs.set(progs),
      });

      if (path === 'permissions' && id) {
        this.isPermissionMode.set(true);
        this.programId.set(id);
        this.loadProgramWithPermissions(id);
      } else if (id) {
        this.isEditMode.set(true);
        this.programId.set(id);
        this.loadProgram(id);
      } else {
        // ✅ หน้าเพิ่มโปรแกรมใหม่: แสดงส่วนกำหนดสิทธิ์ด้วย
        this.isEditMode.set(false);
        this.isPermissionMode.set(true);   // แสดงตารางบทบาท
        this.loadRoles();
      }
    });
  }

  loadProgram(id: string) {
    this.isLoading.set(true);
    this.service.getProgram(id).subscribe({
      next: (program) => {
        this.programForm.patchValue(program);
        this.isLoading.set(false);
        this.loadRoles();
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

    forkJoin({
      program: this.service.getProgram(id),
      rolePrograms: this.service.getRoleProgramsByProgram(id),
    }).subscribe({
      next: ({ program, rolePrograms }) => {
        this.programForm.patchValue(program);
        this.programId.set(id);

        const businessId = localStorage.getItem('businessId');
        if (businessId) {
          this.service.getRoles(businessId).subscribe({
            next: (roles) => {
              this.roles.set(roles);
              const permissions = roles.map((role) => {
                const existing = rolePrograms.find((rp: any) => rp.businessRoleId === role.id);
                return {
                  roleId: role.id,
                  roleName: role.roleNameEn || role.roleCode,
                  level: existing && existing.isActive ? this.mapBooleansToLevel(existing) : 'None',
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
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโปรแกรม');
        this.router.navigate(['/feature/pm/pmrt30']);
      },
    });
  }

  loadRoles() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return;

    this.service.getRoles(businessId).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.rolePermissions.set(
          roles.map((r) => ({
            roleId: r.id,
            roleName: r.roleNameEn || r.roleCode,
            level: 'None',
          }))
        );
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

  mapLevelToBooleans(level: string): { isAdd: boolean; isBack: boolean; isPrint: boolean; isRemove: boolean; isSave: boolean; isSearch: boolean } {
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

    // ✅ กรณีแก้ไขโปรแกรมที่มีอยู่
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

    // ✅ กรณีสร้างโปรแกรมใหม่: ใช้ create-with-permissions เพื่อเพิ่มสิทธิ์พร้อมกัน
    const rolePermissions: RolePermission[] = this.rolePermissions().map((rp) => ({
      roleId: rp.roleId,
      level: rp.level,
    }));

    const request: CreateProgramWithPermissionsRequest = {
      parentProgramId: data.parentProgramId,
      programCode: data.programCode,
      programNameEn: data.programNameEn,
      programNameLocal: data.programNameLocal,
      programIcon: data.programIcon,
      routePath: data.routePath,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      rolePermissions,
    };

    this.isSaving.set(true);
    this.service.createWithPermissions(request).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'สร้างโปรแกรมและกำหนดสิทธิ์เรียบร้อย');
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
    // ฟังก์ชันนี้ใช้ในโหมด permissions แยก (ยังคงไว้)
    // แต่ในหน้าใหม่เราจะใช้ saveProgram แทน
    const program = this.programForm.value as Program;
    const rolePermissions: RolePermission[] = this.rolePermissions().map((rp) => ({
      roleId: rp.roleId,
      level: rp.level,
    }));

    const programId = this.programId();

    if (programId) {
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

      this.service.bulkSaveRolePermissions(programId, modules).subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'บันทึกสิทธิ์โปรแกรมเรียบร้อย');
          this.isSaving.set(false);
          this.router.navigate(['/feature/pm/pmrt30']);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
    } else {
      // ถ้าไม่มี programId จะใช้ createWithPermissions (แต่ฟังก์ชันนี้จะไม่ถูกเรียกในกรณีนี้)
      this.dialog.warn('ไม่สามารถบันทึกได้', 'กรุณาสร้างโปรแกรมก่อนกำหนดสิทธิ์');
    }
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
      Full: 'bg-purple-100 text-purple-700',
      Edit: 'bg-blue-100 text-blue-700',
      Approve: 'bg-emerald-100 text-emerald-700',
      View: 'bg-gray-100 text-gray-600',
      None: 'bg-gray-200 text-gray-400',
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