// src/app/feature/pm/rt/pmrt27/pmrt27A/pmrt27A.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Injectable, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { environment } from '../../../../../../environments/environment';
import { Pmrt28Service } from '../../pmrt28/pmrt28.service'; // ✅ import เพื่อดึงชื่อบทบาท

// ============================================================
// 1. Permission Levels
// ============================================================
export const PERMISSION_LEVELS = [
  { value: 'Full', label: 'เต็มรูปแบบ (Full)', color: 'purple' },
  { value: 'Edit', label: 'แก้ไข/เพิ่ม (Edit)', color: 'blue' },
  { value: 'Approve', label: 'อนุมัติ (Approve)', color: 'emerald' },
  { value: 'View', label: 'ดูอย่างเดียว (View)', color: 'gray' },
  { value: 'None', label: 'ไม่มีสิทธิ์ (None)', color: 'gray' },
];

// ============================================================
// 2. Conversion functions
// ============================================================
export function mapBooleansToLevel(p: {
  isAdd: boolean;
  isBack: boolean;
  isPrint: boolean;
  isRemove: boolean;
  isSave: boolean;
  isSearch: boolean;
}): string {
  if (p.isAdd && p.isSave && p.isRemove && p.isPrint && p.isBack && p.isSearch) return 'Full';
  if (p.isAdd && p.isSave && !p.isRemove && !p.isPrint && p.isBack && p.isSearch) return 'Edit';
  if (!p.isAdd && p.isSave && !p.isRemove && !p.isPrint && p.isBack && p.isSearch) return 'Approve';
  if (!p.isAdd && !p.isSave && !p.isRemove && !p.isPrint && p.isBack && p.isSearch) return 'View';
  return 'None';
}

export function mapLevelToBooleans(level: string): {
  isAdd: boolean;
  isBack: boolean;
  isPrint: boolean;
  isRemove: boolean;
  isSave: boolean;
  isSearch: boolean;
} {
  switch (level) {
    case 'Full':
      return { isSearch: true, isAdd: true, isSave: true, isRemove: true, isPrint: true, isBack: true };
    case 'Edit':
      return { isSearch: true, isAdd: true, isSave: true, isRemove: false, isPrint: false, isBack: true };
    case 'Approve':
      return { isSearch: true, isAdd: false, isSave: true, isRemove: false, isPrint: false, isBack: true };
    case 'View':
      return { isSearch: true, isAdd: false, isSave: false, isRemove: false, isPrint: false, isBack: true };
    case 'None':
    default:
      return { isSearch: false, isAdd: false, isSave: false, isRemove: false, isPrint: false, isBack: false };
  }
}

// ============================================================
// 3. Models
// ============================================================
interface ModulePermission {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  level: string;
  id?: string | null;
}

interface RolePermissionData {
  roleId: string;
  roleCode: string;
  roleName: string;
  modules: ModulePermission[];
}

// ============================================================
// 4. Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class Pmrt27AService {
  private readonly http = inject(HttpClient);

  getRolePermissions(roleId: string): Observable<RolePermissionData> {
    const url = `${environment.apiBaseUrl}/api/su/business-role-programs`;
    const params = { businessRoleId: roleId };

    return this.http.get<any[]>(url, { params }).pipe(
      map((rolePrograms) => {
        const modules: ModulePermission[] = rolePrograms.map((rp) => {
          let level: string;
          if (rp.active) {
            level = mapBooleansToLevel({
              isAdd: rp.add || false,
              isBack: rp.back || false,
              isPrint: rp.print || false,
              isRemove: rp.remove || false,
              isSave: rp.save || false,
              isSearch: rp.search || false,
            });
          } else {
            level = 'None';
          }

          // ✅ ใช้ programName (แปลแล้ว) เป็นอันดับแรก
          const moduleName = rp.programName || rp.programNameLocal || rp.programNameEn || rp.programCode;

          return {
            moduleId: rp.programId,
            moduleCode: rp.programCode,
            moduleName: moduleName,
            level: level,
            id: rp.id || null,
          };
        });

        // ดึง businessRoleCode จากรายการแรก
        const roleCode = rolePrograms.length > 0 ? rolePrograms[0].businessRoleCode : '';

        return {
          roleId: roleId,
          roleCode: roleCode,
          roleName: '', // จะถูก set จาก component
          modules: modules,
        };
      })
    );
  }

  saveRolePermissions(data: RolePermissionData): Observable<string> {
    const modulesReq = data.modules.map((mod) => {
      const perms = mapLevelToBooleans(mod.level);
      return {
        id: mod.id || null,
        businessRoleId: data.roleId,
        programId: mod.moduleId,
        isActive: mod.level !== 'None',
        isAdd: perms.isAdd,
        isBack: perms.isBack,
        isPrint: perms.isPrint,
        isRemove: perms.isRemove,
        isSave: perms.isSave,
        isSearch: perms.isSearch,
      };
    });

    return this.http
      .post<any>(`${environment.apiBaseUrl}/api/su/business-role-programs/bulk-save`, {
        roleId: data.roleId,
        modules: modulesReq,
      })
      .pipe(map(() => 'บันทึกสิทธิ์บทบาทสำเร็จ'));
  }
}

// ============================================================
// 5. Component
// ============================================================
@Component({
  selector: 'app-Pmrt27A',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
  ],
  templateUrl: './Pmrt27A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt27AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmrt27AService);
  readonly roleService = inject(Pmrt28Service); // ✅ สำหรับดึงชื่อบทบาท
  readonly dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  roleId: string | null = null;
  roleCode = '';
  roleName = '';

  isLoading = signal(false);
  isSaving = signal(false);

  modules = signal<ModulePermission[]>([]);
  permissionLevels = PERMISSION_LEVELS;

  pageDirty = () => false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.roleId = id;
        this.loadData(id);
      } else {
        this.router.navigate(['/feature/pm/pmrt27']);
      }
    });
  }

  loadData(roleId: string) {
    this.isLoading.set(true);
    this.cdr.markForCheck();

    // ✅ ดึงข้อมูลสิทธิ์ + ชื่อบทบาทพร้อมกัน
    forkJoin({
      permissions: this.service.getRolePermissions(roleId),
      roleDetail: this.roleService.getRole(roleId),
    })
      .pipe(finalize(() => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: ({ permissions, roleDetail }) => {
          this.roleCode = permissions.roleCode || roleDetail.roleCode;
          // ✅ ใช้ roleName ที่แปลแล้วจาก roleDetail
          this.roleName = roleDetail.roleName || roleDetail.roleNameEn || roleDetail.roleCode;
          this.modules.set(permissions.modules);
          console.log('✅ โหลดข้อมูลสิทธิ์บทบาทสำเร็จ:', permissions.modules);
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสิทธิ์ของบทบาทนี้');
        },
      });
  }

  changeLevel(moduleId: string, level: string) {
    const current = this.modules();
    const updated = current.map((mod) => {
      if (mod.moduleId === moduleId) {
        return { ...mod, level: level as ModulePermission['level'] };
      }
      return mod;
    });
    this.modules.set(updated);
    this.cdr.markForCheck();
  }

  getCurrentLevel(moduleId: string): string {
    const found = this.modules().find((m) => m.moduleId === moduleId);
    return found?.level || 'None';
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

  onBack(): void {
    this.router.navigate(['/feature/pm/pmrt27']);
  }

  submit() {
    if (!this.roleId) {
      this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบรหัสบทบาท');
      this.router.navigate(['/feature/pm/pmrt27']);
      return;
    }

    this.isSaving.set(true);
    this.cdr.markForCheck();

    const data: RolePermissionData = {
      roleId: this.roleId,
      roleCode: this.roleCode,
      roleName: this.roleName,
      modules: this.modules(),
    };

    console.log('📤 Sending data to backend:', JSON.stringify(data, null, 2));

    this.service
      .saveRolePermissions(data)
      .pipe(finalize(() => {
        this.isSaving.set(false);
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'สิทธิ์ของบทบาทถูกบันทึกเรียบร้อย').then(() => {
            this.router.navigate(['/feature/pm/pmrt27']);
          });
        },
        error: (error) => {
          console.error('❌ Save error:', error);
          this.dialog.error('บันทึกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการบันทึก');
        },
      });
  }
}

export default Pmrt27AComponent;