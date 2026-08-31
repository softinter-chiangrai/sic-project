// src/app/feature/pm/dt/pmdt13/pmdt13B/pmdt13B.component.ts
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pmdt12BService } from './pmdt12B.service';
import { Pmdt12BForm } from './pmdt12B.form';
import { PmTestScenarioModel } from './pmdt12B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';

@Component({
  selector: 'app-pmdt12b',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    SicCheckboxComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt12B.component.html',
  styleUrls: ['./pmdt12B.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt12BComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt12BService);
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

  priorityOptions = [
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' },
  ];

  // AI Assistant State
  showAiAssistModal = signal(false);
  isGeneratingAiAssist = signal(false);
  aiAssistTaskId = signal<string | null>(null);
  aiAssistPrompt = signal<string>('');

  pageDirty = () => this.formData?.isChanged ?? false;

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestScenarioModel>(Pmdt12BForm.createForm(this.fb));
    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.form.patchValue({ projectId: pId });
      this.loadTasks(pId);
    } else {
      this.loadTasks();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.scenarioId = id;
        this.isEdit.set(true);
        this.loadScenario(id);
      }
    });
  }

  loadTasks(projectId?: string): void {
    if (!projectId) return;
    this.taskLoading.set(true);
    this.service.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        const list = (tasks || [])
          .filter((t: any) => {
            const text = (t.text || t.taskName || '').trim().toUpperCase();
            const code = (t.taskCode || t.code || '').trim().toUpperCase();
            return !text.startsWith('BUG-') && !text.startsWith('[BUG]') && !code.startsWith('BUG-') && !code.startsWith('BG-');
          })
          .map((t: any) => ({
            value: t.value || t.id,
            text: t.text || `${t.taskCode} - ${t.taskName}`,
          }));
        this.taskOptions.set(list);
        this.taskLoading.set(false);
      },
      error: () => {
        this.taskLoading.set(false);
      },
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

  onAiPromptChange(value: string): void {
    this.aiAssistPrompt.set(value || '');
  }

  // ===== AI Assistant In-Form =====
  openAiAssist(): void {
    const currentTaskId = this.formData.form.get('taskId')?.value;
    this.aiAssistTaskId.set(currentTaskId || null);
    this.aiAssistPrompt.set('');
    this.showAiAssistModal.set(true);
  }

  closeAiAssist(): void {
    this.showAiAssistModal.set(false);
  }

  generateWithAi(): void {
    const pId = this.customerState.getProjectId() || this.formData.form.get('projectId')?.value;
    const selectedTaskId = this.aiAssistTaskId() || this.formData.form.get('taskId')?.value;
    const currentName = this.formData.form.get('scenarioName')?.value;

    this.isGeneratingAiAssist.set(true);

    this.service.generateDraft({
      projectId: pId || undefined,
      taskId: selectedTaskId || undefined,
      scenarioName: currentName || undefined,
      prompt: this.aiAssistPrompt() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAiAssist.set(false);
        if (draft) {
          if (draft.scenarioCode && (!this.formData.form.get('scenarioCode')?.value || this.formData.form.get('scenarioCode')?.value === '')) {
            this.formData.form.patchValue({ scenarioCode: draft.scenarioCode });
          }

          const currentScenarioName = this.formData.form.get('scenarioName')?.value;
          if (draft.scenarioName && (!currentScenarioName || currentScenarioName.trim() === '')) {
            this.formData.form.patchValue({ scenarioName: draft.scenarioName });
          }

          if (draft.priority) {
            this.formData.form.patchValue({ priority: draft.priority });
          }

          if (draft.description) {
            this.formData.form.patchValue({ description: draft.description });
          }

          if (selectedTaskId && selectedTaskId !== this.formData.form.get('taskId')?.value) {
            this.onTaskChange(selectedTaskId);
          }

          this.formData.markAsDirty();
          this.closeAiAssist();
          this.dialog.success('สร้างเนื้อหาด้วย AI สำเร็จ', 'นำเข้าข้อมูล Test Scenario ลงในแบบฟอร์มเรียบร้อยแล้ว');
        }
      },
      error: (err) => {
        this.isGeneratingAiAssist.set(false);
        this.dialog.error('AI ไม่สามารถสร้างเนื้อหาได้', err.error?.message || 'เกิดข้อผิดพลาดในการติดต่อ AI');
      }
    });
  }

  loadScenario(id: string): void {
    this.isLoading.set(true);
    this.service.getTestScenarioById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue({
          ...data,
          status: data.status || 'Active',
        });
        this.formData.resetModel(this.formData.form.getRawValue() as any);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบข้อมูล Test Scenario นี้');
        this.onBack();
      },
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัสและชื่อ Test Scenario');
      return;
    }

    this.isSaving.set(true);
    const formVal: any = this.formData.value;
    const data = {
      ...formVal,
      status: formVal.status || 'Active',
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
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/test-case']);
  }
}

export default Pmdt12BComponent;
