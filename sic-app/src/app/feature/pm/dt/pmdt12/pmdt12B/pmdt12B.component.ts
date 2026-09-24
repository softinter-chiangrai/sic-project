import { HttpClient } from '@angular/common/http';
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
import { Pmdt12BPageData } from './pmdt12B.resolver';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

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
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt12B.component.html',
  styleUrls: ['./pmdt12B.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt12BComponent implements OnInit, CanComponentDeactivate {
  private readonly aiHttp = inject(HttpClient);
  private fb = inject(FormBuilder);
  private service = inject(Pmdt12BService);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
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

  testTypeOptions: { value: string; text: string }[] = [];

  priorityOptions: { value: string; text: string }[] = [];

  private buildStaticOptions(): void {
    this.testTypeOptions = [
      { value: 'SIT', text: `🧪 ${this.translate.instant('PMDT12B_TEST_TYPE_SIT')}` },
      { value: 'UAT', text: `📋 ${this.translate.instant('PMDT12B_TEST_TYPE_UAT')}` },
    ];

    this.priorityOptions = [
      { value: 'High', text: this.translate.instant('PMDT12B_PRIORITY_HIGH') },
      { value: 'Medium', text: this.translate.instant('PMDT12B_PRIORITY_MEDIUM') },
      { value: 'Low', text: this.translate.instant('PMDT12B_PRIORITY_LOW') },
    ];
  }

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
  aiAttachedFiles = signal<File[]>([]);

  isSaved = false;
  pageDirty = () => this.isView() ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  ngOnInit(): void {
    this.buildStaticOptions();
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

    const page: Pmdt12BPageData = this.route.snapshot.data['pageData'];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.scenarioId = id;
      this.isEdit.set(!this.isView());
      if (page?.data) {
        this.applyScenarioData(page.data);
      } else {
        this.loadScenario(id);
      }
    }

    this.route.queryParams.subscribe((params) => {
      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params,
        router: this.router,
        route: this.route,
        moduleType: 'TEST_SCENARIO',
        canOpen: () => !this.isView(),
        setPrompt: (p) => this.aiAssistPrompt.set(p),
        open: () => this.openAiAssist(),
        generate: () => this.generateWithAi(),
      });
    });
  }

  loadTasks(projectId?: string): void {
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

  async generateWithAi(): Promise<void> {
    const pId = this.formData.form.get('projectId')?.value || this.customerState.getProjectId();
    const selectedTaskId = this.aiAssistTaskId() || this.formData.form.get('taskId')?.value;
    const currentName = this.formData.form.get('scenarioName')?.value;
    const targetId = this.scenarioId || this.formData?.form?.get('id')?.value || 'new';

    this.isGeneratingAiAssist.set(true);

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: pId || undefined,
      taskId: selectedTaskId || undefined,
      scenarioName: currentName || undefined,
      prompt: this.aiAssistPrompt() || undefined,
      model: this.aiAssistModel() || undefined,
      attachments,
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
          this.applyDraftToForm(fullDraft);
        }
      },
      error: (err) => {
        this.isGeneratingAiAssist.set(false);
        this.dialog.error(this.translate.instant('PMDT12B_AI_GENERATE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT12B_AI_CONTACT_ERROR_MSG'));
      }
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    // scenarioCode เป็นฟิลด์ที่ผู้ใช้กรอกเองได้ (ไม่ใช่รหัสระบบเหมือน testCaseCode/contractNo)
    // จึงยังให้ AI ช่วยกรอกได้ถ้าช่องนี้ว่างอยู่
    smartPatchFormAiDraft(
      this.formData.form,
      {
        scenarioName: draft.scenarioName,
        scenarioCode: draft.scenarioCode,
        description: draft.description,
        priority: draft.priority,
      },
      ['id'],
      { priority: this.priorityApiUrl },
      this.aiHttp,
    );

    if (draft.taskId && draft.taskId !== this.formData.form.get('taskId')?.value) {
      this.onTaskChange(draft.taskId);
    }
  }

  pasteTestScenarioDraft(draft: any): void {
    if (!draft) return;
    this.applyDraftToForm(draft);
    this.closeAiAssist();
    this.dialog.success(this.translate.instant('PMDT12B_PASTE_SUCCESS_TITLE'), this.translate.instant('PMDT12B_PASTE_SUCCESS_MSG'));
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
        this.applyScenarioData(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error(this.translate.instant('PMDT12B_LOAD_ERROR_TITLE'), this.translate.instant('PMDT12B_LOAD_ERROR_MSG'));
        this.onBack();
      },
    });
  }

  private applyScenarioData(data: PmTestScenarioModel): void {
    this.formData.form.patchValue({
      ...data,
      status: data.status || 'Active',
    });
    this.formData.resetModel(this.formData.form.getRawValue() as any);
    // โหลด Task list ใหม่ด้วย projectId ของ record จริง เผื่อตอน ngOnInit ยังไม่มี projectId ใน cache
    if (data.projectId) {
      this.loadTasks(data.projectId);
    }
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT12B_FORM_INCOMPLETE_TITLE'), this.translate.instant('PMDT12B_FORM_INCOMPLETE_MSG'));
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
        this.dialog.success(this.translate.instant('PMDT12B_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT12B_SAVE_SUCCESS_MSG')).then(() => {
          this.onBack();
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('PMDT12B_SAVE_ERROR_TITLE'), err.message || this.translate.instant('PMDT12B_SAVE_ERROR_MSG'));
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/test-management']);
  }
}

export default Pmdt12BComponent;
