// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Pmdt12AForm } from './pmdt12A.form';
import { PmTestCaseModel } from './pmdt12A.model';
import { Pmdt12AService } from './pmdt12A.service';

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
  ],
  templateUrl: './pmdt12A.component.html',
  styleUrls: ['./pmdt12A.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt12AComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt12AService);
  private readonly dialog = inject(DialogService);
  private readonly customerState = inject(CustomerStateService);

  formData!: SicFromData<PmTestCaseModel>;
  isEdit = signal(false);
  isView = signal(false);
  isExecution = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  testCaseId: string | null = null;
  taskOptions = signal<{ value: string; text: string }[]>([]);
  taskLoading = signal(false);
  linkedTaskStatus = signal<string | null>(null);
  isTaskReadyForTest = signal(true);

  scenarioOptions = signal<{ value: string; text: string }[]>([]);
  scenarioLoading = signal(false);

  // AI Assistant State
  showAiAssistModal = signal(false);
  isGeneratingAiAssist = signal(false);
  aiAssistTaskId = signal<string | null>(null);
  aiAssistPrompt = signal<string>('');

  // Multi-tester support
  businessId = signal<string | null>(null);
  testerValues = signal<string[]>([]);
  testerApiUrl = computed(() => {
    const bId = this.businessId();
    return bId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${bId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;
  });

  pageDirty = () => this.formData?.dirty ?? false;

  priorityOptions = [
    { value: 'High', text: 'High' },
    { value: 'Medium', text: 'Medium' },
    { value: 'Low', text: 'Low' },
  ];

  statusOptions = [
    { value: 'Pending', text: 'Pending (รอทดสอบ)' },
    { value: 'Pass', text: 'Pass (ผ่าน)' },
    { value: 'Fail', text: 'Fail (ไม่ผ่าน)' },
    { value: 'Blocked', text: 'Blocked (ติดปัญหา)' },
  ];

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
      this.formData.form.patchValue({ projectId: pId });
      this.loadTasks(pId);
      this.loadScenarios(pId);
    } else {
      this.loadTasks();
      this.loadScenarios();
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.testCaseId = id;
        this.isEdit.set(!this.isView() && !this.isExecution());
        this.loadTestCase(id);
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      const scenarioId = queryParams['scenarioId'];
      if (scenarioId && !this.testCaseId) {
        this.formData.form.patchValue({ scenarioId });
      }
    });
  }

  loadScenarios(projectId?: string): void {
    this.scenarioLoading.set(true);
    this.service.getTestScenarios(projectId).subscribe({
      next: (scenarios) => {
        const list = (scenarios || []).map((s: any) => ({
          value: s.id,
          text: s.scenarioName,
        }));
        this.scenarioOptions.set(list);
        this.scenarioLoading.set(false);

        // Pre-fill scenarioName if scenarioId was passed via queryParams
        const currentScenarioId = this.formData.form.get('scenarioId')?.value;
        if (currentScenarioId) {
          const found = list.find((s) => s.value === currentScenarioId);
          if (found) {
            this.formData.form.patchValue({ scenarioName: found.text });
          }
        }
      },
      error: () => {
        this.scenarioLoading.set(false);
      },
    });
  }

  onScenarioChange(scenarioId: string | null): void {
    if (!scenarioId) {
      this.formData.form.patchValue({ scenarioId: null, scenarioName: null });
      return;
    }
    const found = this.scenarioOptions().find((s) => s.value === scenarioId);
    this.formData.form.patchValue({
      scenarioId: scenarioId,
      scenarioName: found ? found.text : null,
    });
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
    const scenarioId = this.formData.form.get('scenarioId')?.value;
    const currentTitle = this.formData.form.get('title')?.value;

    this.isGeneratingAiAssist.set(true);

    this.service.generateDraft({
      projectId: pId || undefined,
      taskId: selectedTaskId || undefined,
      scenarioId: scenarioId || undefined,
      title: currentTitle || undefined,
      prompt: this.aiAssistPrompt() || undefined,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAiAssist.set(false);
        if (draft) {
          const currentTitleValue = this.formData.form.get('title')?.value;
          if (draft.title && (!currentTitleValue || currentTitleValue.trim() === '')) {
            this.formData.form.patchValue({ title: draft.title });
          }

          if (draft.priority) {
            this.formData.form.patchValue({ priority: draft.priority });
          }

          if (draft.testStep) {
            this.formData.form.patchValue({ testStep: draft.testStep });
          }

          if (draft.expectedResult) {
            this.formData.form.patchValue({ expectedResult: draft.expectedResult });
          }

          // If a task was selected in AI modal that wasn't previously linked, link it
          if (selectedTaskId && selectedTaskId !== this.formData.form.get('taskId')?.value) {
            this.onTaskChange(selectedTaskId);
          }

          this.formData.markAsDirty();
          this.closeAiAssist();
          this.dialog.success('สร้างเนื้อหาด้วย AI สำเร็จ', 'นำเข้าข้อมูลขั้นตอนการทดสอบและผลที่คาดหวังลงในแบบฟอร์มเรียบร้อยแล้ว');
        }
      },
      error: (err) => {
        this.isGeneratingAiAssist.set(false);
        this.dialog.error('AI ไม่สามารถสร้างเนื้อหาได้', err.error?.message || 'เกิดข้อผิดพลาดในการติดต่อ AI');
      }
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
        this.formData.markAsPristine();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่พบข้อมูล Test Case นี้');
        this.onBack();
      },
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นให้ถูกต้อง');
      return;
    }

    if (this.isExecution() && !this.isTaskReadyForTest()) {
      this.dialog.warn(
        'ไม่สามารถบันทึกผลการทดสอบได้',
        'Test Case นี้มีรายการ Bug ที่ยังแก้ไขไม่เสร็จสิ้น กรุณารอให้ทีมพัฒนาแก้ไขและปิด Bug ก่อนจึงจะสามารถทดสอบซ้ำ (Retest) ได้'
      );
      return;
    }

    const data = { ...this.formData.value };
    data.state = this.isEdit() || this.isExecution() ? 3 : 4;
    this.saveExecution(data);
  }

  saveExecution(data: any) {
    this.isSaving.set(true);
    this.service.saveTestCase(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formData.markAsPristine();

        // Check if all test cases of this task now PASS, if so, move parent task to 'complete'
        if (data.taskId && (data.testStatus || '').toLowerCase() === 'pass') {
          this.checkAndAutoCompleteTask(data.taskId, data.projectId);
        }

        this.dialog.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Test Case เรียบร้อยแล้ว').then(() => {
          this.onBack();
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการบันทึก');
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
    let desc = `<b>[BUG จากผลการทดสอบ: ${data.testCaseCode || ''}]</b><br/><br/>`;
    if (data.title) desc += `<b>หัวข้อ:</b> ${data.title}<br/>`;
    if (data.testStep) desc += `<b>ขั้นตอนการทดสอบ:</b><br/>${data.testStep}<br/>`;
    if (data.expectedResult) desc += `<b>ผลลัพธ์ที่คาดหวัง:</b><br/>${data.expectedResult}<br/>`;
    if (data.actualResult) desc += `<b>ผลลัพธ์ที่พบจริง:</b><br/>${data.actualResult}<br/>`;
    if (data.tester) desc += `<b>ผู้ทดสอบ:</b> ${data.tester}<br/>`;

    // 1. Create Bug Task with status 'To Do'
    const taskPayload: any = {
      taskCode: bugCode,
      taskName: `[BUG] ${data.title || data.testCaseCode}`,
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
    this.router.navigate(['/feature/pm/test-case']);
  }
}

export default Pmdt12AComponent;
