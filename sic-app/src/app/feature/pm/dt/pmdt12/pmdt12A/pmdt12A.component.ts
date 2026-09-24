import { HttpClient } from '@angular/common/http';
// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { AiHistoryService } from '../../../../../core/services/ai-history.service';
import { Pmdt12AForm } from './pmdt12A.form';
import { PmTestCaseModel } from './pmdt12A.model';
import { Pmdt12APageData } from './pmdt12A.resolver';
import { Pmdt12AService } from './pmdt12A.service';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
  selector: 'app-pmdt12a',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicTiptapEditorComponent,
    SicTraceLinkPanelComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt12A.component.html',
  styleUrls: ['./pmdt12A.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt12AComponent implements OnInit, CanComponentDeactivate {
  private readonly aiHttp = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt12AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);
  private readonly translate = inject(TranslateService);
  readonly aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<PmTestCaseModel>;
  isEdit = signal(false);
  isView = signal(false);
  isExecution = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  testCaseId: string | null = null;

  get projectIdForTrace(): string {
    return this.formData?.form?.get('projectId')?.value || this.customerState.getProjectId() || '';
  }

  taskOptions = signal<{ value: string; text: string }[]>([]);
  taskLoading = signal(false);
  linkedTaskStatus = signal<string | null>(null);
  isTaskReadyForTest = signal(true);

  scenarioOptions = signal<{ value: string; text: string }[]>([]);
  scenarioLoading = signal(false);

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

  // Multi-tester support
  businessId = signal<string | null>(null);
  testerValues = signal<string[]>([]);
  testerApiUrl = computed(() => {
    const bId = this.businessId();
    return bId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${bId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;
  });

  isSaved = false;
  pageDirty = () => this.isView() ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  priorityApiUrl = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=PRIORITY`;

  priorityOptions = [
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' },
  ];

  get testTypeOptions() {
    return [
      { value: 'SIT', text: '🧪 ' + this.translate.instant('PMDT12A_TEST_TYPE_SIT') },
      { value: 'UAT', text: '📋 ' + this.translate.instant('PMDT12A_TEST_TYPE_UAT') },
    ];
  }

  get statusOptions() {
    return [
      { value: 'Pending', text: this.translate.instant('PMDT12A_STATUS_PENDING') },
      { value: 'Pass', text: this.translate.instant('PMDT12A_STATUS_PASS') },
      { value: 'Fail', text: this.translate.instant('PMDT12A_STATUS_FAIL') },
      { value: 'Blocked', text: this.translate.instant('PMDT12A_STATUS_BLOCKED') },
    ];
  }

  ngOnInit(): void {
    this.formData = new SicFromData<PmTestCaseModel>(Pmdt12AForm.createForm(this.fb));

    const currentUrl = this.router.url;
    if (currentUrl.includes('/view')) {
      this.isView.set(true);
    } else if (currentUrl.includes('/test-execution')) {
      this.isExecution.set(true);
    }

    const bId = localStorage.getItem('businessId');
    if (bId) {
      this.businessId.set(bId);
    }

    const pId = this.customerState.getProjectId();
    if (pId) {
      this.formData.patchValue({ projectId: pId } as any);
      this.loadTasks(pId);
      this.loadScenarios(pId);
    } else {
      this.loadTasks();
      this.loadScenarios();
    }

    const page: Pmdt12APageData = this.route.snapshot.data['pageData'];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.testCaseId = id;
      this.isEdit.set(!this.isView() && !this.isExecution());
      if (page?.data) {
        this.applyTestCaseData(page.data);
      } else {
        this.loadTestCase(id);
      }
    }

    this.route.queryParams.subscribe((queryParams) => {
      const scenarioId = queryParams['scenarioId'];
      if (scenarioId && !this.testCaseId) {
        this.formData.patchValue({ scenarioId } as any);
        this.updateTestTypeLockState(scenarioId);
      }

      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params: queryParams,
        router: this.router,
        route: this.route,
        moduleType: 'TEST_CASE',
        canOpen: () => !this.isView() && !this.isExecution(),
        setPrompt: (p) => this.aiAssistPrompt.set(p),
        open: () => this.openAiAssist(),
        generate: () => this.generateWithAi(),
      });
    });
  }

  loadScenarios(projectId?: string): void {
    this.scenarioLoading.set(true);
    this.service.getTestScenarios(projectId).subscribe({
      next: (scenarios) => {
        const list = (scenarios || []).map((s: any) => ({
          value: s.id,
          text: s.scenarioName,
          testType: s.testType || 'SIT',
        }));
        this.scenarioOptions.set(list);
        this.scenarioLoading.set(false);

        // Pre-fill scenarioName and testType if scenarioId was passed via queryParams
        const currentScenarioId = this.formData.form.get('scenarioId')?.value;
        if (currentScenarioId) {
          const found = list.find((s) => s.value === currentScenarioId);
          if (found) {
            this.formData.form.patchValue({
              scenarioName: found.text,
              testType: found.testType || this.formData.form.get('testType')?.value || 'SIT',
            });
          }
        }
        this.updateTestTypeLockState(currentScenarioId);
      },
      error: () => {
        this.scenarioLoading.set(false);
      },
    });
  }

  updateTestTypeLockState(scenarioId?: string | null): void {
    const effectiveScenarioId = scenarioId !== undefined ? scenarioId : this.formData.form.get('scenarioId')?.value;
    const testTypeCtrl = this.formData.form.get('testType');
    if (this.isView() || this.isExecution() || !!effectiveScenarioId) {
      testTypeCtrl?.disable({ emitEvent: false });
    } else {
      testTypeCtrl?.enable({ emitEvent: false });
    }
  }

  onScenarioChange(scenarioId: string | null): void {
    if (!scenarioId) {
      this.formData.form.patchValue({ scenarioId: null, scenarioName: null });
      this.updateTestTypeLockState(null);
      return;
    }
    const found = (this.scenarioOptions() as any[]).find((s) => s.value === scenarioId);
    this.formData.form.patchValue({
      scenarioId: scenarioId,
      scenarioName: found ? found.text : null,
      testType: found?.testType || this.formData.form.get('testType')?.value || 'SIT',
    });
    this.updateTestTypeLockState(scenarioId);
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
    const targetId = this.testCaseId || this.formData?.form?.get('id')?.value || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('test-case', targetId));
  }

  async generateWithAi(): Promise<void> {
    const pId = this.customerState.getProjectId() || this.formData.form.get('projectId')?.value;
    const selectedTaskId = this.aiAssistTaskId() || this.formData.form.get('taskId')?.value;
    const scenarioId = this.formData.form.get('scenarioId')?.value;
    const currentTitle = this.formData.form.get('title')?.value;
    const targetId = this.testCaseId || this.formData?.form?.get('id')?.value || 'new';

    this.isGeneratingAiAssist.set(true);

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: pId || undefined,
      taskId: selectedTaskId || undefined,
      scenarioId: scenarioId || undefined,
      title: currentTitle || undefined,
      prompt: this.aiAssistPrompt() || undefined,
      model: this.aiAssistModel() || undefined,
      attachments,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAiAssist.set(false);
        if (draft) {
          const titleToSet = (draft.title && draft.title.trim() !== '') ? draft.title : currentTitle;

          const fullDraft = {
            ...draft,
            title: titleToSet,
            taskId: selectedTaskId,
            priority: draft.priority || 'MEDIUM',
          };

          const historyItem = this.aiHistoryService.addHistory(
            'test-case',
            targetId,
            fullDraft,
            this.aiAssistPrompt(),
            this.aiAssistModel(),
            titleToSet
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
        this.dialog.error(this.translate.instant('PMDT12A_AI_GENERATE_FAILED_TITLE'), err.error?.message || this.translate.instant('PMDT12A_AI_CONNECTION_ERROR_MSG'));
      }
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    // และห้ามแตะ id / testCaseCode (ระบบเป็นผู้กำหนด)
    smartPatchFormAiDraft(
      this.formData.form,
      {
        title: draft.title,
        priority: draft.priority,
        testStep: draft.testStep,
        expectedResult: draft.expectedResult,
        actualResult: draft.actualResult,
        testCaseCode: draft.testCaseCode,
      },
      ['id'],
      { priority: this.priorityApiUrl },
      this.aiHttp,
    );

    if (draft.taskId && draft.taskId !== this.formData.form.get('taskId')?.value) {
      this.onTaskChange(draft.taskId);
    }
  }

  pasteTestCaseDraft(draft: any): void {
    if (!draft) return;
    this.applyDraftToForm(draft);
    this.closeAiAssist();
    this.dialog.success(this.translate.instant('PMDT12A_PASTE_SUCCESS_TITLE'), this.translate.instant('PMDT12A_PASTE_SUCCESS_MSG'));
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    const targetId = this.testCaseId || this.formData?.form?.get('id')?.value || 'new';
    this.aiHistoryService.deleteHistory('test-case', targetId, id);
    this.loadAiHistory();
  }

  togglePreview(id: string): void {
    this.previewHistoryId.update((curr) => (curr === id ? null : id));
  }

  copyDraft(draft: any, id?: string): void {
    if (!draft) return;
    const text = `Test Case: ${draft.title || ''}\nPriority: ${draft.priority || ''}\n\nTest Steps:\n${draft.testStep || ''}\n\nExpected Result:\n${draft.expectedResult || ''}`;
    navigator.clipboard?.writeText(text).then(() => {
      this.copiedId.set(id || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  onTesterChange(selected: any): void {
    if (Array.isArray(selected)) {
      const names = selected.map((item: any) => {
        if (typeof item === 'string') return item;
        return item.text || item.userName || item.name || item.value || '';
      }).filter((n: string) => !!n);
      this.testerValues.set(names);
      this.formData.form.patchValue({ tester: names.join(', ') || null });
    } else if (selected) {
      const name = selected.text || selected.userName || selected.name || selected.value || (typeof selected === 'string' ? selected : '');
      this.testerValues.set(name ? [name] : []);
      this.formData.form.patchValue({ tester: name || null });
    } else {
      this.testerValues.set([]);
      this.formData.form.patchValue({ tester: null });
    }
  }

  loadTasks(projectId?: string): void {
    this.taskLoading.set(true);
    this.service.getTasksCombobox(projectId).subscribe({
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
        relatedTask: null,
        taskCode: null,
        taskName: null,
      });
      return;
    }

    const selectedTaskOption = this.taskOptions().find((o) => o.value === taskId);
    const taskLabel = selectedTaskOption ? selectedTaskOption.text : '';

    this.formData.form.patchValue({
      taskId: taskId,
      relatedTask: taskLabel,
    });

    // Auto-fetch Task details for Specification & Requirement link
    this.service.getTaskById(taskId).subscribe({
      next: (taskDetail) => {
        if (taskDetail) {
          this.checkTaskStatus(taskDetail.status);
          const specId = taskDetail.specificationId;
          const specCode = taskDetail.specificationCode;
          const specTitle = taskDetail.specificationTitle;

          if (specCode || specTitle) {
            const specText = specCode && specTitle ? `${specCode} - ${specTitle}` : (specCode || specTitle);
            this.formData.form.patchValue({ relatedSpec: specText });
          }

          if (specId) {
            // Fetch spec detail to get Requirement information
            this.service.getSpecificationById(specId).subscribe({
              next: (specData) => {
                if (specData) {
                  const reqCode = specData.requirementCode;
                  const reqTitle = specData.requirementTitle;
                  if (reqCode || reqTitle) {
                    const reqText = reqCode && reqTitle ? `${reqCode} - ${reqTitle}` : (reqCode || reqTitle);
                    this.formData.form.patchValue({ relatedRequirement: reqText });
                  }
                }
              },
              error: (e) => console.error('Error loading spec for requirement auto-fill:', e),
            });
          }
        }
      },
      error: (e) => console.error('Error loading task details:', e),
    });
  }

  checkTaskStatus(status?: string | null): void {
    this.linkedTaskStatus.set(status || null);
  }

  checkActiveBug(tcCode?: string | null, projectId?: string | null, taskId?: string | null): void {
    if (!tcCode || !projectId) {
      this.isTaskReadyForTest.set(true);
      return;
    }
    this.service.getTasksCombobox(projectId).subscribe({
      next: (tasks: any[]) => {
        const hasBug = (tasks || []).some((t: any) => {
          if (t.isDelete) return false;
          const status = (t.status || '').toLowerCase();
          if (status === 'complete' || status === 'completed') return false;
          const code = (t.taskCode || '').toUpperCase();
          const name = (t.taskName || t.text || '').toUpperCase();
          const desc = (t.description || '').toUpperCase();
          return (
            (name.includes(tcCode.toUpperCase()) || desc.includes(tcCode.toUpperCase())) &&
            (code.startsWith('BUG-') || code.startsWith('BUG') || name.startsWith('[BUG]'))
          );
        });
        this.isTaskReadyForTest.set(!hasBug);
      },
      error: () => this.isTaskReadyForTest.set(true),
    });
  }

  loadTestCase(id: string): void {
    this.isLoading.set(true);
    this.service.getTestCaseById(id).subscribe({
      next: (data) => {
        this.applyTestCaseData(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error(this.translate.instant('PMDT12A_ERROR_TITLE'), this.translate.instant('PMDT12A_TEST_CASE_NOT_FOUND_MSG'));
        this.onBack();
      },
    });
  }

  private applyTestCaseData(data: PmTestCaseModel): void {
    if (data.projectId) {
      this.loadTasks(data.projectId);
      this.loadScenarios(data.projectId);
      this.checkActiveBug(data.testCaseCode, data.projectId, data.taskId);
    }
    if (data.taskId) {
      this.service.getTaskById(data.taskId).subscribe({
        next: (task) => {
          if (task) {
            this.checkTaskStatus(task.status);
          }
        },
      });
    }
    this.formData.form.patchValue(data);
    if (data.scenarioName && !data.scenarioId) {
      this.formData.form.patchValue({ scenarioName: data.scenarioName });
    }
    if (data.tester) {
      const names = data.tester.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
      this.testerValues.set(names);
    } else {
      this.testerValues.set([]);
    }
    this.formData.resetModel(this.formData.form.getRawValue() as any);
    this.updateTestTypeLockState(data.scenarioId);
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT12A_INCOMPLETE_DATA_TITLE'), this.translate.instant('PMDT12A_INCOMPLETE_DATA_MSG'));
      return;
    }

    if (this.isExecution() && !this.isTaskReadyForTest()) {
      this.dialog.warn(
        this.translate.instant('PMDT12A_CANNOT_SAVE_TEST_RESULT_TITLE'),
        this.translate.instant('PMDT12A_BUG_UNRESOLVED_MSG')
      );
      return;
    }

    if (this.isExecution() && this.formData.form.get('taskId')?.value) {
      const taskStatus = (this.linkedTaskStatus() || '').toLowerCase();
      if (taskStatus && taskStatus !== 'testing') {
        this.dialog.warn(
          this.translate.instant('PMDT12A_CANNOT_SAVE_TEST_RESULT_TITLE'),
          this.translate.instant('PMDT12A_TASK_NOT_TESTING_MSG')
        );
        return;
      }
    }

    const rawVal = this.formData.form.getRawValue();
    const targetId = this.testCaseId || rawVal.id;
    const isEditMode = !!targetId || this.isEdit() || this.isExecution();
    const data = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? 3 : 4,
    };
    this.saveExecution(data);
  }

  saveExecution(data: any) {
    this.isSaving.set(true);
    this.service.saveTestCase(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved = true;
        this.formData.markAsPristine();

        // Check if all test cases of this task now PASS, if so, move parent task to 'complete'
        if (data.taskId && (data.testStatus || '').toLowerCase() === 'pass') {
          this.checkAndAutoCompleteTask(data.taskId, data.projectId);
        }

        this.dialog.success(this.translate.instant('PMDT12A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT12A_SAVE_SUCCESS_MSG')).then(() => {
          this.onBack();
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('PMDT12A_SAVE_FAILED_TITLE'), err.message || this.translate.instant('PMDT12A_SAVE_FAILED_MSG'));
      },
    });
  }

  private checkAndAutoCompleteTask(taskId: string, projectId?: string) {
    this.service.getTestCases(projectId).subscribe({
      next: (res) => {
        const list: any[] = res?.content || res?.data || (Array.isArray(res) ? res : []);
        const siblingTestCases = list.filter((tc: any) => tc.taskId === taskId && !tc.isDelete);
        
        // If there are test cases and ALL of them are 'Pass'
        if (siblingTestCases.length > 0) {
          const allPassed = siblingTestCases.every((tc: any) => {
            const s = (tc.testStatus || '').toLowerCase();
            return s === 'pass' || s === 'passed';
          });

          if (allPassed) {
            this.service.getTaskById(taskId).subscribe({
              next: (parentTask) => {
                if (parentTask && parentTask.id && parentTask.status !== 'complete') {
                  const updatedParent = {
                    ...parentTask,
                    status: 'complete',
                  };
                  this.service.updateTask(parentTask.id, updatedParent).subscribe({
                    next: () => console.log(`Parent task ${parentTask.taskCode} auto-moved to complete because all test cases passed.`),
                    error: (err) => console.error('Failed to auto-complete parent task:', err),
                  });
                }
              },
            });
          }
        }
      },
    });
  }

  createBugTaskAndSave(data: any) {
    this.isSaving.set(true);

    // If test case has a related Task, fetch its details to copy workPackageId & specificationId
    if (data.taskId) {
      this.service.getTaskById(data.taskId).subscribe({
        next: (parentTask) => {
          this.dispatchCreateTask(data, parentTask);
        },
        error: () => {
          this.dispatchCreateTask(data, null);
        },
      });
    } else {
      this.dispatchCreateTask(data, null);
    }
  }

  private dispatchCreateTask(data: any, parentTask: any) {
    const todayStr = new Date().toISOString().split('T')[0];
    const bugCode = 'BUG-' + Math.floor(1000 + Math.random() * 9000);
    
    // Format description with rich details
    let desc = `<b>[${this.translate.instant('PMDT12A_BUG_FROM_TEST_RESULT')}: ${data.testCaseCode || ''}]</b><br/><br/>`;
    if (data.title) desc += `<b>${this.translate.instant('PMDT12A_TITLE_LABEL')}:</b> ${data.title}<br/>`;
    if (data.testStep) desc += `<b>${this.translate.instant('PMDT12A_TEST_STEPS_LABEL')}:</b><br/>${data.testStep}<br/>`;
    if (data.expectedResult) desc += `<b>${this.translate.instant('PMDT12A_EXPECTED_RESULT_LABEL2')}:</b><br/>${data.expectedResult}<br/>`;
    if (data.actualResult) desc += `<b>${this.translate.instant('PMDT12A_ACTUAL_RESULT_FOUND_LABEL')}:</b><br/>${data.actualResult}<br/>`;
    if (data.tester) desc += `<b>${this.translate.instant('PMDT12A_TESTER_LABEL')}:</b> ${data.tester}<br/>`;

    // 1. Create Bug Task with status 'To Do'
    const rawTitle = (data.title || data.testCaseCode || '').trim();
    const finalTaskName = rawTitle.toUpperCase().startsWith('[BUG]')
      ? rawTitle
      : `[BUG] ${rawTitle}`;

    const taskPayload: any = {
      taskCode: bugCode,
      taskName: finalTaskName,
      description: desc,
      priority: data.priority === 'High' ? 'Critical' : (data.priority || 'High'),
      status: 'To Do', // Bug starts in 'To Do' column for Dev to pick up
      startDate: `${todayStr}T09:00:00Z`,
      endDate: `${todayStr}T18:00:00Z`,
      estimateManday: 1,
      workPackageId: parentTask?.workPackageId || null,
      specificationId: parentTask?.specificationId || null,
      assignedTo: parentTask?.assignedTo || null,
      assigneeIds: parentTask?.assigneeIds || [],
    };

    // 2. If parentTask exists, move parent task to 'bugfix' column
    if (parentTask && parentTask.id && parentTask.status !== 'bugfix') {
      const updatedParent = {
        ...parentTask,
        status: 'bugfix',
      };
      this.service.updateTask(parentTask.id, updatedParent).subscribe({
        next: () => console.log('Parent task moved to bugfix status'),
        error: (err) => console.error('Failed to update parent task status to bugfix', err),
      });
    }

    // 3. Create dedicated PmBug entity linked directly to Test Case (Traceability)
    const bugPayload: any = {
      bugCode: bugCode,
      title: finalTaskName,
      description: desc,
      testCaseId: data.id || this.testCaseId,
      taskId: data.taskId || parentTask?.id || null,
      projectId: data.projectId || this.customerState.getProjectId(),
      severity: data.priority === 'High' ? 'Critical' : (data.priority || 'Medium'),
      priority: data.priority === 'High' ? 'Critical' : (data.priority || 'Medium'),
      status: 'Open',
      foundBy: data.tester || null,
      stepsToReproduce: data.testStep || null,
    };
    this.service.createBugFromTest(bugPayload).subscribe({
      next: () => console.log('Created dedicated PmBug entity linked to Test Case'),
      error: (e) => console.warn('Could not save PmBug entity:', e),
    });

    if (taskPayload.workPackageId) {
      this.service.createTask(taskPayload).subscribe({
        next: () => {
          this.saveExecution(data);
        },
        error: (err) => {
          console.error('Error creating bug task:', err);
          this.saveExecution(data);
        },
      });
    } else {
      this.saveExecution(data);
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/test-management']);
  }
}

export default Pmdt12AComponent;
