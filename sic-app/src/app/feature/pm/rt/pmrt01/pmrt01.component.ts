// src/app/feature/pm/rt/pmrt01/pmrt01.component.ts
import { Component, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  SicButtonComponent,
  SicCardComponent,
  SicFlexComponent,
  SicGridPanelComponent,
  SicGridPanelConfig,
  SicGridLoadRequest,
  SicGridRowData,
  SicGridPanelTemplate,
  SicAvatarComponent,
  SicTextComponent,
} from 'sic-ng';
import { Pmrt01AService } from './pmrt01A/pmrt01A.service';
import { CustomerModel } from './pmrt01A/pmrt01A.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-pmrt01',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SicButtonComponent,
    SicCardComponent,
    SicFlexComponent,
    SicGridPanelComponent,
    SicGridPanelTemplate,
    SicAvatarComponent,
    SicTextComponent,
  ],
  templateUrl: './pmrt01.component.html',
  styleUrls: ['./pmrt01.component.css'],
})
export class Pmrt01Component {
  private service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);

  @ViewChild('customerGrid') customerGrid!: SicGridPanelComponent;

  searchTerm = signal('');
  filterStatus = signal('all');
  businessId = localStorage.getItem('businessId') || '';

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    defaultSortField: 'customerCode',
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    column: [
      {
        label: 'รหัส',
        name: 'customerCode',
        type: 'text',
        sortable: true,
        width: 120,
      },
      {
        label: 'ชื่อบริษัท',
        name: 'companyNameEn',
        type: 'custom',
        sortable: true,
        minWidth: 220,
      },
      {
        label: 'อีเมล',
        name: 'email',
        type: 'text',
        sortable: true,
        width: 200,
      },
      {
        label: 'เบอร์โทร',
        name: 'phoneNumber',
        type: 'text',
        sortable: true,
        width: 140,
      },
      {
        label: 'สถานะ',
        name: 'isActive',
        type: 'custom',
        sortable: true,
        width: 100,
        align: 'center',
      },
      {
        label: '',
        name: 'actions',
        type: 'custom',
        width: 200,
        align: 'center',
      },
    ],
    toolbar: {
      add: false,
      save: false,
      delete: false,
      review: false,
    },
    selectable: false,
  };

  handleGridLoad(request: SicGridLoadRequest): void {
    if (!this.businessId) {
      this.customerGrid.setRows([], { totalElements: 0 }, request.requestId);
      return;
    }

    // 🔥 ใช้ field ที่ถูกต้องตาม sic-ng
    const page = request.pageNumber ?? 0;
    const size = request.pageSize ?? 10;
    const sortBy = request.sortField ?? 'customerCode';        // ✅ sortField
    const sortDir = request.sortDescending ? 'desc' : 'asc';  
    const keyword = this.searchTerm() || undefined;

    this.service
      .getCustomers(this.businessId, page, size, keyword, sortBy, sortDir)
      .subscribe({
        next: (pageData) => {
          this.customerGrid.setRows(
            pageData.content as any,
            {
              totalElements: pageData.totalElements,
              totalPages: pageData.totalPages,
              pageNumber: pageData.number,   
              pageSize: pageData.size,     
            },
            request.requestId
          );
        },
        error: (err) => {
          console.error('Load customers error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการลูกค้าได้');
          this.customerGrid.setLoadError('เกิดข้อผิดพลาดในการโหลดข้อมูล', request.requestId);
        },
      });
  }

  handleGridRowAction(event: { action: string; row?: SicGridRowData | null }): void {
    const row = event.row as unknown as CustomerModel;
    if (!row) return;

    if (event.action === 'edit') {
      this.goToEdit(row.id);
    } else if (event.action === 'delete') {
      this.deleteCustomer(row.id);
    } else if (event.action === 'projects') {
      this.goToProjects(row);
    } else if (event.action === 'toggleActive') {
      this.toggleActive(row);
    }
  }

  // ===== Actions =====
  goToAdd(): void {
    this.navigation.navigate(['/feature/pm/pmrt01/new']);
  }

  goToEdit(id: string | undefined): void {
    if (!id) {
      this.dialog.warn('ไม่พบรหัสลูกค้า', 'ไม่สามารถแก้ไขข้อมูลได้');
      return;
    }
    this.navigation.navigate(['/feature/pm/pmrt01', id, 'edit']);
  }

  goToProjects(customer: CustomerModel): void {
    this.customerState.setCustomer(customer.id!, customer.companyNameEn);
    this.navigation.navigate(['/feature/pm/pmrt02'], {
      queryParams: { customerId: customer.id },
    });
  }

  toggleActive(customer: CustomerModel): void {
    if (!customer.id) return;
    const updated = { ...customer, isActive: !customer.isActive };
    this.service.updateCustomer(customer.id, updated).subscribe({
      next: () => {
        this.dialog.success('อัปเดตสถานะสำเร็จ', `สถานะถูกเปลี่ยนเป็น ${updated.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}`);
        this.customerGrid.reload();
      },
      error: (err) => {
        this.dialog.error('อัปเดตสถานะไม่สำเร็จ', err.error?.message);
      },
    });
  }

  deleteCustomer(id: string | undefined): void {
    if (!id) {
      this.dialog.warn('ไม่พบรหัสลูกค้า', 'ไม่สามารถลบข้อมูลได้');
      return;
    }
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบลูกค้ารายนี้ใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.service.deleteCustomer(id).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ลูกค้าถูกลบเรียบร้อย');
            this.customerGrid.reload();
          },
          error: (err) => {
            this.dialog.error('ลบไม่สำเร็จ', err.error?.message);
          },
        });
      }
    });
  }

  // ===== Search / Filter =====
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.customerGrid.reload();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.customerGrid.reload();
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.customerGrid.reload();
  }

  // ===== Utility =====
  getImageUrl(customer: CustomerModel): string {
    if (!customer.uploadGroupId) return '';
    return `${environment.apiBaseUrl}/api/storage/avatar/${customer.uploadGroupId}`;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }
}