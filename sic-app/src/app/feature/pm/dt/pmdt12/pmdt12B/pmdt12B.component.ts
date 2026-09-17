// src/app/feature/pm/dt/pmdt13/pmdt13B/pmdt13B.component.ts
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pmdt12BService } from './pmdt12B.service';
import { Pmdt12BForm } from './pmdt12B.form';
import { PmTestScenarioModel } from './pmdt12B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { AiHistoryService } from '../../../../../core/services/ai-history.service';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicButtonComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicCheckboxComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { environment } from '../../../../../../environments/environment';
import { resolveProjectId } from '../../../../../core/utils/resolve-context.util';

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
  readonly aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<PmTestScenarioModel>;
  isEdit = signal(false);
  isView = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  scenarioId: string | null = null;

  taskOptions = signal<{ value: string; text: string }[]>([]);
  taskLoading = signal(false);

  priorityApiUrl = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=PRIORITY`;

  testTypeOptions = [
    { value: 'SIT', text: '🧪 การทดสอบระบบภายใน (SIT)' },
    { value: 'UAT', text: '📋 การตรวจรับระบบโดยผู้ใช้ (UAT)' },
  ];

  priorityOptions = [
    { value: 'High', text: 'สูง' },
    { value: 'Medium', text: 'ปานกลาง' },
    { value: 'Low', text: 'ต่ำ' },
  ];

  // AI Assistant State
  showAiAssistModal = signal(false);
  isGeneratingAiAssist = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiAssistTaskId = signal<string | null>(null);
  aiAssistPrompt = signal<string>('');
  aiAssistModel = signal<string>(DEFAULT_AI_MODEL);
  aiModels = AI_MODEL_OPTIONS;
  aiHistories = signal<any[]>([]);
  aiCurrentDraft = signal<any>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  previewHistoryId = signal<string | null>(null);
  copiedId = signal<string | null>(null);

  isSaved = false;
  pageDirty = () => this.isView() ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestScenarioModel>(Pmdt12BForm.createForm(this.fb));

    const currentUrl = this.router.url;
    if (currentUrl.includes('/view')) {
      this.isView.set(true);
    }

    const pId = resolveProjectId(this.route, this.customerState);
    if (pId) {
      this.formData.patchValue({ projectId: pId } as any);
      this.loadTasks(pId);
    } else {
      this.loadTasks();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.scenarioId = id;
        this.isEdit.set(!this.isView());
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
    this.aiAssistTab.set('generate');
    this.loadAiHistory();
    this.showAiAssistModal.set(true);
  }

  closeAiAssist(): void {
    this.showAiAssistModal.set(false);
  }

  loadAiHistory(): void {
    const targetId = this.scenarioId || this.formData?.form?.get('id')?.value || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('test-scenario', targetId));
  }

  generateWithAi(): void {
    const pId = this.formData.form.get('projectId')?.value || this.customerState.getProjectId();
    const selectedTaskId = this.aiAssistTaskId() || this.formData.form.get('taskId')?.value;
    const currentName = this.formData.form.get('scenarioName')?.value;
    const targetId = this.scenarioId || this.formData?.form?.get('id')?.value || 'new';

    this.isGeneratingAiAssist.set(true);

    this.service.generateDraft({
      projectId: pId || undefined,
      taskId: selectedTaskId || undefined,
      scenarioName: currentName || undefined,
      prompt: this.aiAssistPrompt() || undefined,
      model: this.aiAssistModel() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAiAssist.set(false);
        if (draft) {
          const currentScenarioName = this.formData.form.get('scenarioName')?.value;
          const nameToSet = (draft.scenarioName && draft.scenarioName.trim() !== '') ? draft.scenarioName : currentScenarioName;

          const fullDraft = {
            ...draft,
            scenarioName: nameToSet,
            taskId: selectedTaskId,
            priority: draft.priority || 'Medium',
          };

          const historyItem = this.aiHistoryService.addHistory(
            'test-scenario',
            targetId,
            fullDraft,
            this.aiAssistPrompt(),
            this.aiAssistModel(),
            nameToSet
          );

          this.loadAiHistory();
          this.aiCurrentDraft.set(fullDraft);
          this.aiCurrentVersionNo.set(historyItem.versionNo);

          // ดึงข้อมูลหัวข้อและเนื้อหาที่ AI สร้างลงในฟอร์มทันที
          this.formData.form.patchValue({
            scenarioName: fullDraft.scenarioName,
            description: fullDraft.description || this.formData.form.get('description')?.value,
            priority: fullDraft.priority || this.formData.form.get('priority')?.value || 'Medium',
          });

          if (fullDraft.scenarioCode && (!this.formData.form.get('scenarioCode')?.value || this.formData.form.get('scenarioCode')?.value === '')) {
            this.formData.form.patchValue({ scenarioCode: fullDraft.scenarioCode });
          }

          if (fullDraft.taskId && fullDraft.taskId !== this.formData.form.get('taskId')?.value) {
            this.onTaskChange(fullDraft.taskId);
          }

          this.formData.markAsDirty();
        }
      },
      error: (err) => {
        this.isGeneratingAiAssist.set(false);
        this.dialog.error('AI ไม่สามารถสร้างเนื้อหาได้', err.error?.message || 'เกิดข้อผิดพลาดในการติดต่อ AI');
      }
    });
  }

  pasteTestScenarioDraft(draft: any): void {
    if (!draft) return;
    this.formData.form.patchValue({
      scenarioName: draft.scenarioName || this.formData.form.get('scenarioName')?.value,
      description: draft.description || this.formData.form.get('description')?.value,
      priority: draft.priority || this.formData.form.get('priority')?.value || 'Medium',
    });

    if (draft.scenarioCode && (!this.formData.form.get('scenarioCode')?.value || this.formData.form.get('scenarioCode')?.value === '')) {
      this.formData.form.patchValue({ scenarioCode: draft.scenarioCode });
    }

    if (draft.taskId && draft.taskId !== this.formData.form.get('taskId')?.value) {
      this.onTaskChange(draft.taskId);
    }

    this.formData.markAsDirty();
    this.closeAiAssist();
    this.dialog.success('วางข้อมูลลงในฟอร์มสำเร็จ', 'นำเข้าข้อมูล Test Scenario เวอร์ชันที่เลือกลงในแบบฟอร์มเรียบร้อยแล้ว');
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    const targetId = this.scenarioId || this.formData?.form?.get('id')?.value || 'new';
    this.aiHistoryService.deleteHistory('test-scenario', targetId, id);
    this.loadAiHistory();
  }

  togglePreview(id: string): void {
    this.previewHistoryId.update((curr) => (curr === id ? null : id));
  }

  copyDraft(draft: any, id?: string): void {
    if (!draft) return;
    const text = `Test Scenario: ${draft.scenarioName || ''}\nCode: ${draft.scenarioCode || ''}\nPriority: ${draft.priority || ''}\n\nDescription:\n${draft.description || ''}`;
    navigator.clipboard?.writeText(text).then(() => {
      this.copiedId.set(id || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
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
        // โหลด Task list ใหม่ด้วย projectId ของ record จริง เผื่อตอน ngOnInit ยังไม่มี projectId ใน cache
        if (data.projectId) {
          this.loadTasks(data.projectId);
        }
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
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัส, ชื่อ Test Scenario และเลือก Task ที่เกี่ยวข้อง');
      return;
    }

    this.isSaving.set(true);
    const formVal: any = this.formData.form.getRawValue();
    const targetId = this.scenarioId || formVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const data = {
      ...formVal,
      id: targetId || undefined,
      status: formVal.status || 'Active',
      state: isEditMode ? 3 : 4,
    };

    this.service.saveTestScenario(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved = true;
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
    this.router.navigate(['/feature/pm/test-management']);
  }
}

export default Pmdt12BComponent;
