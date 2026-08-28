// src/app/feature/bu/rt/pmrt27/burt02A/burt02A.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  Injectable,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { burt03Service } from '../../burt03/burt03.service';

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
  return {
    isAdd: level === 'Full' || level === 'Edit',
    isSave: level === 'Full' || level === 'Edit' || level === 'Approve',
    isRemove: level === 'Full',
    isPrint: level === 'Full',
    isBack: level !== 'None',
    isSearch: level !== 'None',
  };
}

// ============================================================
// 3. Models
// ============================================================
import { ModulePermission, RolePermissionData } from './burt02A.model';


// ============================================================
// 4. Service
// ============================================================
@Injectable({ providedIn: 'root' })
export class burt02AService {
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
          const moduleName =
            rp.programName || rp.programNameLocal || rp.programNameEn || rp.programCode;

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
      }),
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
  selector: 'app-burt02A',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicInputComponent,
  ],
  templateUrl: './burt02A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Burt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(burt02AService);
  readonly roleService = inject(burt03Service); // ✅ สำหรับดึงชื่อบทบาท
  readonly dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  roleId: string | null = null;
  roleCode = '';
  roleName = '';

  isLoading = signal(false);
  isSaving = signal(false);

  searchTerm = signal('');
  filterLevel = signal('all');
  modules = signal<ModulePermission[]>([]);
  permissionLevels = PERMISSION_LEVELS;

  readonly permissionSelectOptions = [
    { value: 'Full', text: 'เต็มรูปแบบ (Full)' },
    { value: 'Edit', text: 'แก้ไข/เพิ่ม (Edit)' },
    { value: 'Approve', text: 'อนุมัติ (Approve)' },
    { value: 'View', text: 'ดูอย่างเดียว (View)' },
    { value: 'None', text: 'ไม่มีสิทธิ์ (None)' },
  ];

  filteredModules = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const level = this.filterLevel();
    let list = this.modules();

    if (term) {
      list = list.filter(
        (m) =>
          (m.moduleName && m.moduleName.toLowerCase().includes(term)) ||
          (m.moduleCode && m.moduleCode.toLowerCase().includes(term)),
      );
    }

    if (level !== 'all') {
      list = list.filter((m) => m.level === level);
    }

    return list;
  });

  pageDirty = () => false;

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  onFilterLevelChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterLevel.set(val || 'all');
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.roleId = id;
        this.loadData(id);
      } else {
        this.router.navigate(['/feature/bu/burt02']);
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
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }),
      )
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

  changeLevel(moduleId: string, level: any) {
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
    this.router.navigate(['/feature/bu/permission']);
  }

  submit() {
    if (!this.roleId) {
      this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบรหัสบทบาท');
      this.router.navigate(['/feature/bu/permission']);
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
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.dialog.success('บันทึกสำเร็จ', 'สิทธิ์ของบทบาทถูกบันทึกเรียบร้อย').then(() => {
            this.router.navigate(['/feature/bu/permission']);
          });
        },
        error: (error) => {
          console.error('❌ Save error:', error);
          this.dialog.error('บันทึกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการบันทึก');
        },
      });
  }
}

export default Burt02AComponent;
