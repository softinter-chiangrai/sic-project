import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { Pmdt19AService } from './pmdt19A/pmdt19A.service';
import { DocumentVersionModel } from './pmdt19A/pmdt19A.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

import { Pmdt19ViewDialogComponent } from './pmdt19-view-dialog.component';

@Component({
  selector: 'app-pmdt19',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicDatePipe, SicComboboxComponent],
  templateUrl: './pmdt19.component.html',
  styleUrls: ['./pmdt19.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt19Component implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(Pmdt19AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  versions = signal<DocumentVersionModel[]>([]);
  isLoading = signal(false);

  filterType = signal<string>('ALL');
  filterDocId = signal<string>('');

  readonly docTypeOptions = [
    { text: 'ทุกประเภทเอกสาร (All Types)', value: 'ALL' },
    { text: 'Requirement (ข้อกำหนดระบบ)', value: 'REQUIREMENT' },
    { text: 'DFD Diagram', value: 'DFD' },
    { text: 'ER Diagram', value: 'ER' },
    { text: 'Specification', value: 'SPEC' },
    { text: 'Test Case', value: 'TEST_CASE' },
    { text: 'Delivery Document', value: 'DELIVERY' },
    { text: 'Contract', value: 'CONTRACT' },
    { text: 'Change Request', value: 'CHANGE_REQUEST' },
    { text: 'User Manual', value: 'MANUAL' },
  ];

  filteredVersions = signal<DocumentVersionModel[]>([]);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const qProjectId = params['projectId'];
      if (qProjectId) {
        this.customerState.setProject(qProjectId);
      }
      const qType = params['documentType'];
      const qId = params['documentId'];
      if (qType) this.filterType.set(qType);
      if (qId) this.filterDocId.set(qId);

      this.loadVersions();
    });
  }

  loadVersions(): void {
    this.isLoading.set(true);
    const projectId = this.customerState.getProjectId() || undefined;
    const docType = this.filterType();
    const docId = this.filterDocId() || undefined;

    this.service.getVersions(docType, docId, projectId).subscribe({
      next: (list) => {
        this.versions.set(list || []);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = (this.filterDocId() || '').trim().toLowerCase();
    if (!term) {
      this.filteredVersions.set(this.versions());
      return;
    }
    const filtered = this.versions().filter((v) =>
      (v.documentCode && v.documentCode.toLowerCase().includes(term)) ||
      (v.versionNo && v.versionNo.toLowerCase().includes(term)) ||
      (v.changeSummary && v.changeSummary.toLowerCase().includes(term)) ||
      (v.documentId && v.documentId.toLowerCase().includes(term))
    );
    this.filteredVersions.set(filtered);
  }

  onTypeChange(type: any): void {
    const val = type !== undefined && type !== null ? (typeof type === 'object' && type.target ? type.target.value : type) : 'ALL';
    this.filterType.set(val || 'ALL');
    this.loadVersions();
  }

  onDocIdChange(docId: string): void {
    this.filterDocId.set(docId);
    this.applyFilter();
  }

  onViewContent(ver: DocumentVersionModel): void {
    this.dialog.open({
      type: 'info',
      title: 'เนื้อหาเอกสารเวอร์ชัน ' + ver.versionNo,
      component: Pmdt19ViewDialogComponent,
      componentInputs: {
        version: ver,
      },
    });
  }

  onActivate(id: string): void {
    this.dialog.confirm('ยืนยัน', 'คุณต้องการตั้งเวอร์ชันนี้เป็น Active Version ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.activateVersion(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'เปิดใช้งานเวอร์ชันเรียบร้อยแล้ว');
            this.loadVersions();
          },
          error: (err) => {
            this.dialog.error('ข้อผิดพลาด', err.message || 'ไม่สามารถเปิดใช้งานได้');
          },
        });
      }
    });
  }

  onDelete(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบบันทึกเวอร์ชันนี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.deleteVersion(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบบันทึกเรียบร้อย');
            this.loadVersions();
          },
          error: (err) => {
            this.dialog.error('ข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
          },
        });
      }
    });
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/version/new'], {
      queryParams: {
        documentType: this.filterType(),
        documentId: this.filterDocId(),
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/project-dashboard'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
  }
}

export default Pmdt19Component;