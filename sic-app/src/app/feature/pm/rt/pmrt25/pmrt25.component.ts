import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { Pmdt25Service } from '../../dt/pmdt25/pmdt25.service';
import { DocumentVersionModel } from '../../dt/pmdt25/pmdt25.model';
import { DialogService } from '../../../../core/services/dialog.service';

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

  versions = signal<DocumentVersionModel[]>([]);
  isLoading = signal(false);

  filterType = signal<string>('REQUIREMENT');
  filterDocId = signal<string>('');

  docTypeOptions = [
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

  ngOnInit(): void {
    const qType = this.route.snapshot.queryParams['documentType'];
    const qId = this.route.snapshot.queryParams['documentId'];
    if (qType) this.filterType.set(qType);
    if (qId) this.filterDocId.set(qId);

    this.loadVersions();
  }

  loadVersions(): void {
    if (!this.filterDocId()) {
      this.versions.set([]);
      return;
    }

    this.isLoading.set(true);
    this.service.getVersions(this.filterType(), this.filterDocId()).subscribe({
      next: (list) => {
        this.versions.set(list || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onTypeChange(type: string): void {
    this.filterType.set(type);
    this.loadVersions();
  }

  onDocIdChange(docId: string): void {
    this.filterDocId.set(docId);
    this.loadVersions();
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
}

export default Pmrt25Component;