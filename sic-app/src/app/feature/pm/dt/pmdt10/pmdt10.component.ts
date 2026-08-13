import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pmdt10Service } from './pmdt10.service';
import { PmBugModel, PmTestCaseModel, PmTestScenarioModel } from './pmdt10.model';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';

@Component({
  selector: 'app-pmdt10',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SicButtonComponent,
    SicInputComponent,
    SicDatePipe
  ],
  templateUrl: './pmdt10.component.html',
  styleUrls: ['./pmdt10.component.css']
})
export class Pmdt10Component implements OnInit {
  private service = inject(Pmdt10Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'bugs' | 'test-cases' | 'scenarios'>('bugs');
  projectId = signal<string | null>(null);
  keyword = signal<string>('');

  // Data Signals
  bugs = signal<PmBugModel[]>([]);
  testCases = signal<PmTestCaseModel[]>([]);
  scenarios = signal<PmTestScenarioModel[]>([]);
  isLoading = signal(false);

  // Pagination
  page = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  ngOnInit(): void {
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.projectId.set(pId);
    }
    this.loadData();
  }

  setTab(tab: 'bugs' | 'test-cases' | 'scenarios'): void {
    this.activeTab.set(tab);
    this.page.set(0);
    this.loadData();
  }

  onSearch(): void {
    this.page.set(0);
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const pId = this.projectId() || undefined;
    const kw = this.keyword() || undefined;

    if (this.activeTab() === 'bugs') {
      this.service.getBugs(pId, kw, this.page(), this.pageSize()).subscribe({
        next: (res) => {
          this.bugs.set(res.content || []);
          this.totalElements.set(res.totalElements || 0);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else if (this.activeTab() === 'test-cases') {
      this.service.getTestCases(pId, kw, this.page(), this.pageSize()).subscribe({
        next: (res) => {
          this.testCases.set(res.content || []);
          this.totalElements.set(res.totalElements || 0);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else if (this.activeTab() === 'scenarios') {
      this.service.getTestScenarios(pId).subscribe({
        next: (res) => {
          this.scenarios.set(res || []);
          this.totalElements.set(res?.length || 0);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  // Navigations
  onCreateBug(): void {
    this.router.navigate(['pmdt10A'], { relativeTo: this.route });
  }

  onEditBug(id: string): void {
    this.router.navigate(['pmdt10A', id, 'edit'], { relativeTo: this.route });
  }

  onDeleteBug(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Bug/Issue นี้ใช่หรือไม่?').then(ok => {
      if (ok) {
        this.service.deleteBug(id).subscribe(() => {
          this.dialog.success('ลบสำเร็จ');
          this.loadData();
        });
      }
    });
  }

  onCreateTestCase(): void {
    this.router.navigate(['pmdt10B'], { relativeTo: this.route });
  }

  onEditTestCase(id: string): void {
    this.router.navigate(['pmdt10B', id, 'edit'], { relativeTo: this.route });
  }

  onDeleteTestCase(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Test Case นี้ใช่หรือไม่?').then(ok => {
      if (ok) {
        this.service.deleteTestCase(id).subscribe(() => {
          this.dialog.success('ลบสำเร็จ');
          this.loadData();
        });
      }
    });
  }

  onCreateScenario(): void {
    this.router.navigate(['pmdt10C'], { relativeTo: this.route });
  }

  onEditScenario(id: string): void {
    this.router.navigate(['pmdt10C', id, 'edit'], { relativeTo: this.route });
  }

  onDeleteScenario(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Test Scenario นี้ใช่หรือไม่?').then(ok => {
      if (ok) {
        this.service.deleteTestScenario(id).subscribe(() => {
          this.dialog.success('ลบสำเร็จ');
          this.loadData();
        });
      }
    });
  }

  // Badges styling helper
  getSeverityClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-default';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-open';
      case 'in progress': return 'status-in-progress';
      case 'fixed': return 'status-fixed';
      case 'closed': return 'status-closed';
      case 'pass': case 'passed': return 'status-pass';
      case 'fail': case 'failed': return 'status-fail';
      default: return 'status-default';
    }
  }
}
