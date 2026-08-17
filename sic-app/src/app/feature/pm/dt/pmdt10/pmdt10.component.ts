import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pmdt10Service } from './pmdt10.service';
import { PmTestScenarioModel } from './pmdt10.model';
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

  projectId = signal<string | null>(null);
  keyword = signal<string>('');

  // Data Signals
  scenarios = signal<PmTestScenarioModel[]>([]);
  filteredScenarios = signal<PmTestScenarioModel[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.projectId.set(pId);
    }
    this.loadData();
  }

  onSearch(): void {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) {
      this.filteredScenarios.set(this.scenarios());
      return;
    }
    const filtered = this.scenarios().filter(
      (s) =>
        s.scenarioName?.toLowerCase().includes(kw) ||
        s.description?.toLowerCase().includes(kw) ||
        s.priority?.toLowerCase().includes(kw)
    );
    this.filteredScenarios.set(filtered);
  }

  loadData(): void {
    this.isLoading.set(true);
    const pId = this.projectId() || undefined;

    this.service.getTestScenarios(pId).subscribe({
      next: (res) => {
        this.scenarios.set(res || []);
        this.onSearch();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onCreateScenario(): void {
    this.router.navigate(['pmdt10A'], { relativeTo: this.route });
  }

  onEditScenario(id: string): void {
    this.router.navigate(['pmdt10A', id, 'edit'], { relativeTo: this.route });
  }

  onDeleteScenario(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Test Scenario นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.service.deleteTestScenario(id).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ข้อมูล Test Scenario ถูกลบเรียบร้อย');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ลบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการลบ');
          }
        });
      }
    });
  }
}
