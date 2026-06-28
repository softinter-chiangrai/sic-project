import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';

// ===== Model =====
interface ModulePermission {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  level:
    | 'Full'
    | 'View'
    | 'Edit'
    | 'Approve'
    | 'Fix'
    | 'Create/View'
    | 'View/UAT'
    | 'Test'
    | 'None';
}

interface RolePermissionData {
  roleId: string;
  roleCode: string;
  roleName: string;
  modules: ModulePermission[];
}

// ===== Permission Levels =====
const PERMISSION_LEVELS = [
  { value: 'Full', label: 'เต็มรูปแบบ (Full)', color: 'purple' },
  { value: 'Approve', label: 'อนุมัติ (Approve)', color: 'emerald' },
  { value: 'Edit', label: 'แก้ไข (Edit)', color: 'blue' },
  { value: 'Fix', label: 'แก้ไข Bug (Fix)', color: 'orange' },
  { value: 'Create/View', label: 'สร้าง/ดู (Create/View)', color: 'cyan' },
  { value: 'View/UAT', label: 'ดู/UAT (View/UAT)', color: 'indigo' },
  { value: 'Test', label: 'ทดสอบ (Test)', color: 'yellow' },
  { value: 'View', label: 'ดู (View)', color: 'gray' },
  { value: 'None', label: 'ไม่มีสิทธิ์ (None)', color: 'gray' },
];

import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';


// ===== Helper Functions =====
export function mapBooleansToLevel(p: { isAdd: boolean, isBack: boolean, isPrint: boolean, isRemove: boolean, isSave: boolean, isSearch: boolean }): ModulePermission['level'] {
  if (p.isAdd && p.isSave && p.isRemove && p.isPrint && p.isBack && p.isSearch) return 'Full';
  if (p.isSearch && p.isSave && !p.isAdd && !p.isRemove && !p.isPrint) return 'Approve';
  if (p.isSearch && p.isAdd && p.isSave && !p.isRemove && !p.isPrint) return 'Edit';
  if (p.isSearch && !p.isAdd && !p.isSave && !p.isRemove && !p.isPrint) return 'View';
  if (!p.isSearch && !p.isAdd && !p.isSave && !p.isRemove && !p.isPrint) return 'None';
  return 'View';
}

export function mapLevelToBooleans(level: string): { isAdd: boolean, isBack: boolean, isPrint: boolean, isRemove: boolean, isSave: boolean, isSearch: boolean } {
  switch (level) {
    case 'Full':
      return { isSearch: true, isAdd: true, isSave: true, isRemove: true, isPrint: true, isBack: true };
    case 'Approve':
    case 'Fix':
    case 'View/UAT':
      return { isSearch: true, isAdd: false, isSave: true, isRemove: false, isPrint: false, isBack: true };
    case 'Edit':
    case 'Test':
    case 'Create/View':
      return { isSearch: true, isAdd: true, isSave: true, isRemove: false, isPrint: false, isBack: true };
    case 'View':
      return { isSearch: true, isAdd: false, isSave: false, isRemove: false, isPrint: false, isBack: true };
    case 'None':
    default:
      return { isSearch: false, isAdd: false, isSave: false, isRemove: false, isPrint: false, isBack: false };
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt27AService {
  private readonly http = inject(HttpClient);

  getRolePermissions(roleId: string): Observable<RolePermissionData> {
    // 1. Fetch role detail to get its code/name
    const role$ = this.http.get<any>(`${environment.apiBaseUrl}/api/su/business-roles/${roleId}`);
    // 2. Fetch all active programs
    const programs$ = this.http.get<any[]>(`${environment.apiBaseUrl}/api/su/programs`);
    // 3. Fetch role's assigned programs
    const rolePrograms$ = this.http.get<any[]>(`${environment.apiBaseUrl}/api/su/business-role-programs`, {
      params: { businessRoleId: roleId }
    });

    return forkJoin({ role: role$, programs: programs$, rolePrograms: rolePrograms$ }).pipe(
      map(({ role, programs, rolePrograms }) => {
        const modules: ModulePermission[] = programs.map(p => {
          const matched = rolePrograms.find(rp => rp.programId === p.id);
          const level = matched && matched.active
            ? mapBooleansToLevel({
                isAdd: matched.isAdd,
                isBack: matched.isBack,
                isPrint: matched.isPrint,
                isRemove: matched.isRemove,
                isSave: matched.isSave,
                isSearch: matched.isSearch
              })
            : 'None';

          const mod: ModulePermission = {
            moduleId: p.id,
            moduleCode: p.programCode,
            moduleName: p.programNameEn,
            level: level
          };
          
          // Keep track of the business role program record id if it exists
          if (matched) {
            (mod as any).id = matched.id;
          }
          return mod;
        });

        return {
          roleId: role.id,
          roleCode: role.roleCode,
          roleName: role.roleNameEn,
          modules: modules
        };
      })
    );
  }

  saveRolePermissions(data: RolePermissionData): Observable<string> {
    const modulesReq = data.modules.map(mod => {
      const perms = mapLevelToBooleans(mod.level);
      return {
        id: (mod as any).id || null,
        businessRoleId: data.roleId,
        programId: mod.moduleId,
        isActive: mod.level !== 'None',
        ...perms
      };
    });

    const body = {
      roleId: data.roleId,
      modules: modulesReq
    };

    return this.http.post<any>(`${environment.apiBaseUrl}/api/su/business-role-programs/bulk-save`, body).pipe(
      map(() => 'บันทึกสิทธิ์บทบาทสำเร็จ')
    );
  }
}

// ===== Component =====
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
  styles: [],
})
export class Pmrt27AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmrt27AService);
  readonly dialog = inject(DialogService);

  roleId: string | null = null;
  roleCode = '';
  roleName = '';
  isLoading = false;
  isSaving = false;

  // ===== Data =====
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
        this.router.navigate(['/feature/pm/role-permission']);
      }
    });
  }

  loadData(roleId: string) {
    this.isLoading = true;
    this.service.getRolePermissions(roleId).subscribe({
      next: (data) => {
        this.roleCode = data.roleCode;
        this.roleName = data.roleName;
        this.modules.set(data.modules);
        this.isLoading = false;
        console.log('✅ โหลดข้อมูลสิทธิ์บทบาทสำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
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
  }

  getCurrentLevel(moduleId: string): string {
    const found = this.modules().find((m) => m.moduleId === moduleId);
    return found?.level || 'None';
  }

  getLevelColor(level: string): string {
    const map: Record<string, string> = {
      Full: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Fix: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Create/View': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      View: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'View/UAT': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      Test: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      None: 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
    };
    return map[level] || map['None'];
  }

  getLevelText(level: string): string {
    const found = this.permissionLevels.find((l) => l.value === level);
    return found?.label || level;
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/role-permission']);
  }

  submit() {
    if (!this.roleId) {
      this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบรหัสบทบาท');
      this.router.navigate(['/feature/pm/role-permission']);
      return;
    }

    this.isSaving = true;
    const data: RolePermissionData = {
      roleId: this.roleId,
      roleCode: this.roleCode,
      roleName: this.roleName,
      modules: this.modules(),
    };
    this.service.saveRolePermissions(data).subscribe({
      next: () => {
        this.isSaving = false;
        this.dialog.success('บันทึกสำเร็จ', 'สิทธิ์ของบทบาทถูกบันทึกเรียบร้อย').then(() => {
          this.router.navigate(['/feature/pm/role-permission']);
        });
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmrt27AComponent;
