import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pmdt10Service } from '../pmdt10.service';
import { Pmdt10AForm } from './pmdt10A.form';
import { PmTestScenarioModel } from '../pmdt10.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';

@Component({
  selector: 'app-pmdt10a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    SicCheckboxComponent,
    SicInputAreaComponent,
    SicTiptapEditorComponent
  ],
  templateUrl: './pmdt10A.component.html',
  styleUrls: ['./pmdt10A.component.css']
})
export class Pmdt10AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt10Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formData!: SicFromData<PmTestScenarioModel>;
  isEdit = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  scenarioId: string | null = null;

  taskOptions = signal<{ value: string; text: string }[]>([]);
  taskLoading = signal(false);

  pageDirty = () => this.formData?.dirty ?? false;

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestScenarioModel>(Pmdt10AForm.createForm(this.fb));
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
      this.loadTasks(pId);
    } else {
      this.loadTasks();
    }

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.scenarioId = id;
      this.isEdit.set(true);
      this.loadScenario(id);
    }
  }

  loadTasks(projectId?: string): void {
    if (!projectId) return;
    this.taskLoading.set(true);
    this.service.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        const list = (tasks || []).map((t: any) => ({
          value: t.value || t.id,
          text: t.text || `${t.taskCode} - ${t.taskName}`,
        }));
        this.taskOptions.set(list);
        this.taskLoading.set(false);
      },
      error: () => {
        this.taskLoading.set(false);
      }
    });
  }

  onTaskChange(taskId: string | null): void {
    if (!taskId) {
      this.formData.form.patchValue({
        taskId: null,
        taskCode: null,
        taskName: null,
      });
      return;
    }
    const selected = this.taskOptions().find((o) => o.value === taskId);
    this.formData.form.patchValue({
      taskId: taskId,
      taskName: selected ? selected.text : null,
    });
  }

  loadScenario(id: string): void {
    this.isLoading.set(true);
    this.service.getTestScenarioById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue({
          ...data,
          status: data.status || 'Active'
        });
        this.formData.markAsPristine();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบข้อมูล Test Scenario นี้');
        this.onBack();
      }
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อ Test Scenario');
      return;
    }

    this.isSaving.set(true);
    const formVal: any = this.formData.value;
    const data = {
      ...formVal,
      status: formVal.status || 'Active'
    };
    data.state = this.isEdit() ? 3 : 4;

    this.service.saveTestScenario(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();
        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Test Scenario เรียบร้อยแล้ว').then(() => {
          this.onBack();
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}
