import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { Pmdt25Service } from '../../dt/pmdt25/pmdt25.service';
import { DocumentVersionModel } from '../../dt/pmdt25/pmdt25.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

@Component({
  selector: 'app-pmrt25',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt25.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmrt25Component implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(Pmdt25Service);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  versions = signal<DocumentVersionModel[]>([]);
  isLoading = signal(false);

  filterType = signal<string>('ALL');
  filterDocId = signal<string>('');

  docTypeOptions = [
    { label: 'ทุกประเภทเอกสาร (All Types)', value: 'ALL' },
    { label: 'Requirement (ข้อกำหนดระบบ)', value: 'REQUIREMENT' },
    { label: 'DFD Diagram', value: 'DFD' },
    { label: 'ER Diagram', value: 'ER' },
    { label: 'Specification', value: 'SPEC' },
    { label: 'Test Case', value: 'TEST_CASE' },
    { label: 'Delivery Document', value: 'DELIVERY' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Change Request', value: 'CHANGE_REQUEST' },
    { label: 'User Manual', value: 'MANUAL' },
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

  onTypeChange(type: string): void {
    this.filterType.set(type);
    this.loadVersions();
  }

  onDocIdChange(docId: string): void {
    this.filterDocId.set(docId);
    this.applyFilter();
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
    this.router.navigate(['/feature/pm/pmrt03'], {
      queryParams: { projectId: this.customerState.getProjectId() || undefined }
    });
  }
}

export default Pmrt25Component;