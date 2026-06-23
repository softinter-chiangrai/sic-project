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

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmrt27AService {
  // ✅ Mock Modules
  private mockModules: ModulePermission[] = [
    { moduleId: 'mod-001', moduleCode: 'project', moduleName: 'Project', level: 'Full' },
    { moduleId: 'mod-002', moduleCode: 'requirement', moduleName: 'Requirement', level: 'Approve' },
    { moduleId: 'mod-003', moduleCode: 'dfd', moduleName: 'DFD', level: 'View' },
    { moduleId: 'mod-004', moduleCode: 'er', moduleName: 'ER', level: 'None' },
    { moduleId: 'mod-005', moduleCode: 'spec', moduleName: 'Spec', level: 'Approve' },
    { moduleId: 'mod-006', moduleCode: 'plan', moduleName: 'Plan', level: 'Full' },
    { moduleId: 'mod-007', moduleCode: 'task', moduleName: 'Task', level: 'Full' },
    { moduleId: 'mod-008', moduleCode: 'test', moduleName: 'Test', level: 'View' },
    { moduleId: 'mod-009', moduleCode: 'bug', moduleName: 'Bug', level: 'Fix' },
    { moduleId: 'mod-010', moduleCode: 'delivery', moduleName: 'Delivery', level: 'Full' },
    { moduleId: 'mod-011', moduleCode: 'invoice', moduleName: 'Invoice', level: 'View' },
    { moduleId: 'mod-012', moduleCode: 'ma', moduleName: 'MA', level: 'Full' },
  ];

  getRolePermissions(roleId: string): Observable<RolePermissionData> {
    // ✅ ใช้ roleId เพื่อสร้างข้อมูล
    const roleMap: Record<string, { code: string; name: string }> = {
      'role-001': { code: 'ADMIN', name: 'Administrator' },
      'role-002': { code: 'PM', name: 'Project Manager' },
      'role-003': { code: 'DEV', name: 'Developer' },
      'role-004': { code: 'QA', name: 'QA Tester' },
      'role-005': { code: 'CUSTOMER', name: 'Customer' },
      'role-006': { code: 'FINANCE', name: 'Finance' },
    };

    const roleInfo = roleMap[roleId] || { code: 'UNKNOWN', name: 'Unknown Role' };

    // ✅ Copy modules เพื่อไม่ให้แก้ไขข้อมูลต้นฉบับ
    const modules = this.mockModules.map((m) => ({ ...m }));

    const found: RolePermissionData = {
      roleId: roleId,
      roleCode: roleInfo.code,
      roleName: roleInfo.name,
      modules: modules,
    };
    return of(found).pipe(delay(300));
  }

  saveRolePermissions(data: RolePermissionData): Observable<string> {
    console.log('📝 Saving role permissions:', data);
    return of('บันทึกสิทธิ์บทบาทสำเร็จ').pipe(delay(500));
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
