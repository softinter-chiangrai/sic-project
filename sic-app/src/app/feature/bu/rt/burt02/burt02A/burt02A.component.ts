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
import { SicPaginationComponent } from '../../../../../core/component/sic-pagination/sic-pagination.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { burt03Service } from '../../burt03/burt03.service';
import { ModulePermission, RolePermissionData } from './burt02A.model';

// ============================================================
// Service
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
          const moduleName =
            rp.programName || rp.programNameLocal || rp.programNameEn || rp.programCode;

          return {
            moduleId: rp.programId,
            moduleCode: rp.programCode,
            moduleName: moduleName,
            id: rp.id || null,
            isActive: rp.active ?? false,
            isAdd: rp.add ?? false,
            isBack: rp.back ?? true,
            isPrint: rp.print ?? false,
            isRemove: rp.remove ?? false,
            isSave: rp.save ?? false,
            isSearch: rp.search ?? false,
          };
        });

        const roleCode = rolePrograms.length > 0 ? rolePrograms[0].businessRoleCode : '';

        return {
          roleId: roleId,
          roleCode: roleCode,
          roleName: '',
          modules: modules,
        };
      }),
    );
  }

  saveRolePermissions(data: RolePermissionData): Observable<string> {
    const modulesReq = data.modules.map((mod) => {
      return {
        id: mod.id || null,
        businessRoleId: data.roleId,
        programId: mod.moduleId,
        isActive: mod.isActive,
        isAdd: mod.isAdd,
        isBack: mod.isBack,
        isPrint: mod.isPrint,
        isRemove: mod.isRemove,
        isSave: mod.isSave,
        isSearch: mod.isSearch,
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
// Component
// ============================================================
@Component({
  selector: 'app-burt02A',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicComboboxComponent,
    SicPaginationComponent,
  ],
  templateUrl: './burt02A.component.html',
  styleUrls: ['./burt02A.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Burt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(burt02AService);
  readonly roleService = inject(burt03Service);
  readonly dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  roleId: string | null = null;
  roleCode = '';
  roleName = '';

  isLoading = signal(false);
  isSaving = signal(false);

  searchTerm = signal('');
  filterGroup = signal('all');
  currentPage = signal(1);
  pageSize = signal(10);
  modules = signal<ModulePermission[]>([]);
  private initialModulesSnapshot = signal<string>('');

  readonly groupOptions = [
    { value: 'all', text: 'All Modules' },
    { value: 'PM', text: 'PM - Project Management' },
    { value: 'BU', text: 'BU - Business Management' },
    { value: 'SU', text: 'SU - System & Settings' },
  ];

  filteredModules = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const group = this.filterGroup();
    let list = this.modules();

    if (term) {
      list = list.filter(
        (m) =>
          (m.moduleName && m.moduleName.toLowerCase().includes(term)) ||
          (m.moduleCode && m.moduleCode.toLowerCase().includes(term)),
      );
    }

    if (group !== 'all') {
      list = list.filter((m) => m.moduleCode && m.moduleCode.toUpperCase().startsWith(group));
    }

    return list;
  });

  totalItems = computed(() => this.filteredModules().length);

  paginatedModules = computed(() => {
    const list = this.filteredModules();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.cdr.markForCheck();
  }

  pageDirty = (): boolean => {
    if (!this.initialModulesSnapshot()) return false;
    return this.initialModulesSnapshot() !== JSON.stringify(this.modules());
  };

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  onFilterGroupChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterGroup.set(val || 'all');
    this.currentPage.set(1);
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
          this.roleName = roleDetail.roleName || roleDetail.roleNameEn || roleDetail.roleCode;
          this.modules.set(permissions.modules);
          this.initialModulesSnapshot.set(JSON.stringify(permissions.modules));
        },
        error: (error) => {
          console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลสิทธิ์ของบทบาทนี้');
        },
      });
  }

  // Toggle individual permission checkbox
  togglePerm(
    moduleId: string,
    permKey: 'isAdd' | 'isSave' | 'isRemove' | 'isPrint' | 'isSearch' | 'isActive',
    event: Event,
  ) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.modules();
    const updated = current.map((m) => {
      if (m.moduleId === moduleId) {
        const updatedMod = { ...m, [permKey]: checked };
        // If checking any action, automatically ensure active and back are true
        if (checked && permKey !== 'isActive') {
          updatedMod.isActive = true;
          updatedMod.isBack = true;
        }
        // If unchecking active, disable all actions
        if (permKey === 'isActive' && !checked) {
          updatedMod.isAdd = false;
          updatedMod.isSave = false;
          updatedMod.isRemove = false;
          updatedMod.isPrint = false;
          updatedMod.isSearch = false;
          updatedMod.isBack = false;
        }
        return updatedMod;
      }
      return m;
    });

    this.modules.set(updated);
    this.cdr.markForCheck();
  }

  // Set all permissions for a single row
  setRowPermissions(moduleId: string, mode: 'full' | 'edit' | 'view' | 'clear') {
    const current = this.modules();
    const updated = current.map((m) => {
      if (m.moduleId === moduleId) {
        if (mode === 'full') {
          return {
            ...m,
            isActive: true,
            isAdd: true,
            isSave: true,
            isRemove: true,
            isPrint: true,
            isSearch: true,
            isBack: true,
          };
        } else if (mode === 'edit') {
          return {
            ...m,
            isActive: true,
            isAdd: true,
            isSave: true,
            isRemove: false,
            isPrint: true,
            isSearch: true,
            isBack: true,
          };
        } else if (mode === 'view') {
          return {
            ...m,
            isActive: true,
            isAdd: false,
            isSave: false,
            isRemove: false,
            isPrint: false,
            isSearch: true,
            isBack: true,
          };
        } else {
          return {
            ...m,
            isActive: false,
            isAdd: false,
            isSave: false,
            isRemove: false,
            isPrint: false,
            isSearch: false,
            isBack: false,
          };
        }
      }
      return m;
    });

    this.modules.set(updated);
    this.cdr.markForCheck();
  }

  // Column Header Toggle: Select/Unselect entire column for visible/filtered items
  toggleColumn(permKey: 'isAdd' | 'isSave' | 'isRemove' | 'isPrint' | 'isSearch' | 'isActive') {
    const isAllChecked = this.isColumnAllChecked(permKey);
    const targetState = !isAllChecked;
    const visibleIds = new Set(this.filteredModules().map((m) => m.moduleId));

    const current = this.modules();
    const updated = current.map((m) => {
      if (visibleIds.has(m.moduleId)) {
        const updatedMod = { ...m, [permKey]: targetState };
        if (targetState && permKey !== 'isActive') {
          updatedMod.isActive = true;
          updatedMod.isBack = true;
        }
        if (permKey === 'isActive' && !targetState) {
          updatedMod.isAdd = false;
          updatedMod.isSave = false;
          updatedMod.isRemove = false;
          updatedMod.isPrint = false;
          updatedMod.isSearch = false;
          updatedMod.isBack = false;
        }
        return updatedMod;
      }
      return m;
    });

    this.modules.set(updated);
    this.cdr.markForCheck();
  }

  isColumnAllChecked(permKey: 'isAdd' | 'isSave' | 'isRemove' | 'isPrint' | 'isSearch' | 'isActive'): boolean {
    const list = this.filteredModules();
    if (list.length === 0) return false;
    return list.every((m) => m[permKey]);
  }

  // Batch actions across all visible modules
  setAllVisible(mode: 'full' | 'edit' | 'view' | 'clear') {
    const visibleIds = new Set(this.filteredModules().map((m) => m.moduleId));
    const current = this.modules();
    const updated = current.map((m) => {
      if (visibleIds.has(m.moduleId)) {
        if (mode === 'full') {
          return {
            ...m,
            isActive: true,
            isAdd: true,
            isSave: true,
            isRemove: true,
            isPrint: true,
            isSearch: true,
            isBack: true,
          };
        } else if (mode === 'edit') {
          return {
            ...m,
            isActive: true,
            isAdd: true,
            isSave: true,
            isRemove: false,
            isPrint: true,
            isSearch: true,
            isBack: true,
          };
        } else if (mode === 'view') {
          return {
            ...m,
            isActive: true,
            isAdd: false,
            isSave: false,
            isRemove: false,
            isPrint: false,
            isSearch: true,
            isBack: true,
          };
        } else {
          return {
            ...m,
            isActive: false,
            isAdd: false,
            isSave: false,
            isRemove: false,
            isPrint: false,
            isSearch: false,
            isBack: false,
          };
        }
      }
      return m;
    });

    this.modules.set(updated);
    this.cdr.markForCheck();
  }

  countActive(): number {
    return this.modules().filter((m) => m.isActive).length;
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
          this.initialModulesSnapshot.set(JSON.stringify(this.modules()));
          this.dialog.success('บันทึกสำเร็จ', 'สิทธิ์การใช้งานของบทบาทถูกบันทึกเรียบร้อย').then(() => {
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

