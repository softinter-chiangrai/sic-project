// src/app/feature/pm/dt/pmdt12/pmdt12C/pmdt12C.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { BusinessService } from '../../../../../core/services/business.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { TraceLinkService } from '../../../../../core/services/trace-link.service';
import { PmTestCaseModel, PmTestScenarioModel } from '../pmdt12.model';
import { Pmdt12Service } from '../pmdt12.service';
import { createBugForm } from './pmdt12C.form';

@Component({
  selector: 'app-pmdt12c',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SicComboboxComponent,
    SicUploadComponent,
    SicTraceLinkPanelComponent,
    TranslateModule,
  ],
  templateUrl: './pmdt12C.component.html',
  styleUrls: ['./pmdt12C.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt12CComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Pmdt12Service);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private businessService = inject(BusinessService);
  private traceLinkService = inject(TraceLinkService);
  private translate = inject(TranslateService);

  // ===== States =====
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEdit = signal(false);
  taskId = signal<string | null>(null);

  // Traceability & Relationship signals
  projectId = signal<string | null>(null);
  projectName = signal<string | null>(null);
  scenarioId = signal<string | null>(null);
  scenarioCode = signal<string | null>(null);
  scenarioName = signal<string | null>(null);
  testCaseId = signal<string | null>(null);
  testCaseCode = signal<string | null>(null);
  testCaseTitle = signal<string | null>(null);
  parentTaskId = signal<string | null>(null);
  parentTaskCode = signal<string | null>(null);
  parentTaskName = signal<string | null>(null);
  activeBugs = signal<any[]>([]);

  traceEntityId = computed(() => {
    return this.taskId() || this.parentTaskId() || this.testCaseId() || null;
  });

  traceEntityType = computed(() => {
    if (this.taskId() || this.parentTaskId()) return 'TASK';
    if (this.testCaseId()) return 'TEST_CASE';
    return 'TASK';
  });

  // Parent task record cached for updates
  private parentTaskRecord: any = null;
  private returnUrl = '/feature/pm/test-management';

  // Form
  form: FormGroup = createBugForm(this.fb);

  // Combobox APIs
  businessId = signal<string | null>(null);
  memberApiUrl = computed(() => {
    const bId = this.businessId();
    return bId
      ? `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${bId}`
      : `${environment.apiBaseUrl}/api/business/combobox-members`;
  });
  priorityApiUrl = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=PRIORITY`;

  priorityOptions = [
    { value: 'CRITICAL', text: 'วิกฤต (Critical)' },
    { value: 'HIGH', text: 'สูง (High)' },
    { value: 'MEDIUM', text: 'ปานกลาง (Medium)' },
    { value: 'LOW', text: 'ต่ำ (Low)' },
  ];

  // CanComponentDeactivate implementation
  get isSaved(): boolean {
    return !this.form.dirty || this.isSubmitting();
  }

  ngOnInit(): void {
    const currentBusiness = this.businessService.getCurrentBusinessId();
    if (currentBusiness) {
      this.businessId.set(currentBusiness);
    }

    const routeId = this.route.snapshot.paramMap.get('id');
    const qParams = this.route.snapshot.queryParams;

    if (qParams['returnUrl']) {
      this.returnUrl = qParams['returnUrl'];
    }

    if (routeId) {
      this.isEdit.set(true);
      this.taskId.set(routeId);
      this.loadExistingBug(routeId);
    } else {
      this.isEdit.set(false);
      this.initNewBug(qParams);
    }
  }

  private initNewBug(params: Record<string, any>): void {
    const tcId = params['testCaseId'] || null;
    const parentTId = params['taskId'] || null;
    const scId = params['scenarioId'] || null;
    let projId = params['projectId'] || this.customerState.getProjectId() || null;

    this.testCaseId.set(tcId);
    this.parentTaskId.set(parentTId);
    this.scenarioId.set(scId);
    this.projectId.set(projId);

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDayStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const bugCode = 'BUG-' + Math.floor(1000 + Math.random() * 9000);

    this.form.patchValue({
      taskCode: bugCode,
      startDate: todayStr,
      endDate: nextDayStr,
      estimateManday: 1,
      priority: 'HIGH',
      projectId: projId,
    });

    // 1. If testCaseId is provided, fetch its rich information
    if (tcId) {
      this.service.getTestCaseById(tcId).subscribe({
        next: (tc) => {
          this.applyTestCaseContext(tc);
          if (!parentTId && tc.taskId) {
            this.parentTaskId.set(tc.taskId);
            this.fetchParentTask(tc.taskId);
          }
          if (!scId && tc.scenarioId) {
            this.scenarioId.set(tc.scenarioId);
            this.fetchScenario(tc.scenarioId);
          }
          this.checkActiveBugs(tc.testCaseCode, tc.projectId);
          this.isLoading.set(false);
        },
        error: () => {
          // If fail, fall back to param values
          if (params['testCaseCode']) this.testCaseCode.set(params['testCaseCode']);
          this.form.patchValue({
            taskName: `[BUG] ${params['testCaseCode'] || ''}`.trim(),
          });
          this.isLoading.set(false);
        },
      });
    } else {
      this.isLoading.set(false);
    }

    // 2. If parentTaskId is provided, fetch task details
    if (parentTId) {
      this.fetchParentTask(parentTId);
    }

    // 3. If scenarioId is provided, fetch scenario details
    if (scId) {
      this.fetchScenario(scId);
    }
  }

  private applyTestCaseContext(tc: PmTestCaseModel): void {
    this.testCaseCode.set(tc.testCaseCode);
    this.testCaseTitle.set(tc.title || null);
    if (tc.projectId && !this.projectId()) {
      this.projectId.set(tc.projectId);
      this.form.patchValue({ projectId: tc.projectId });
    }

    const cleanHtml = (htmlStr?: string | null): string => {
      if (!htmlStr) return '-';
      return htmlStr
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    };

    let desc = `[ผลการทดสอบที่พบข้อผิดพลาด: ${tc.testCaseCode || ''}]\n\n`;
    if (tc.title) desc += `• หัวข้อเคสทดสอบ: ${tc.title}\n`;
    if (tc.testStep) desc += `• ขั้นตอนการทดสอบ (Steps):\n${cleanHtml(tc.testStep)}\n\n`;
    if (tc.expectedResult) desc += `• ผลลัพธ์ที่คาดหวัง (Expected):\n${cleanHtml(tc.expectedResult)}\n\n`;
    if (tc.actualResult) desc += `• ผลลัพธ์จริงที่พบ (Actual):\n${cleanHtml(tc.actualResult)}\n\n`;
    if (tc.tester) desc += `• ผู้ทดสอบที่รายงาน: ${tc.tester}\n`;

    const rawPriority = (tc.priority || 'HIGH').toUpperCase();
    let defaultPriority = 'HIGH';
    if (rawPriority.includes('CRITICAL') || rawPriority === 'HIGH') {
      defaultPriority = 'CRITICAL';
    } else if (rawPriority.includes('MED')) {
      defaultPriority = 'MEDIUM';
    } else if (rawPriority.includes('LOW')) {
      defaultPriority = 'LOW';
    }

    this.form.patchValue({
      taskName: `[BUG] ${tc.title || tc.testCaseCode}`,
      priority: defaultPriority,
      description: desc.trim(),
      testCaseId: tc.id,
      testCaseCode: tc.testCaseCode,
      scenarioId: tc.scenarioId,
    });
  }

  private fetchParentTask(tId: string): void {
    this.service.getTaskById(tId).subscribe({
      next: (t) => {
        this.parentTaskRecord = t;
        this.parentTaskCode.set(t.taskCode);
        this.parentTaskName.set(t.taskName);
        this.form.patchValue({
          parentTaskId: t.id,
          workPackageId: t.workPackageId,
          specificationId: t.specificationId,
          assignedTo: t.assignedTo || null,
        });
        if (!this.projectId() && t.projectId) {
          this.projectId.set(t.projectId);
        }
      },
      error: (err) => console.error('Fetch parent task error:', err),
    });
  }

  private fetchScenario(sId: string): void {
    this.service.getTestScenarioById(sId).subscribe({
      next: (s) => {
        this.scenarioCode.set(s.scenarioCode || null);
        this.scenarioName.set(s.scenarioName);
        if (!this.projectId() && s.projectId) {
          this.projectId.set(s.projectId);
        }
      },
      error: (err) => console.error('Fetch scenario error:', err),
    });
  }

  private checkActiveBugs(tcCode?: string, pId?: string): void {
    if (!tcCode && !pId) return;
    this.service.getTasksByProjectId(pId || this.projectId() || '').subscribe({
      next: (tasks) => {
        const bugs = (tasks || []).filter((t: any) => {
          const code = (t.taskCode || '').toUpperCase();
          const name = (t.taskName || '').toUpperCase();
          const desc = (t.description || '');
          const isBug = code.startsWith('BUG-') || code.startsWith('BUG') || name.startsWith('[BUG]');
          const matchesTc = (tcCode && desc.includes(tcCode)) || false;
          const isNotDone = t.status !== 'Done' && t.status !== 'Completed';
          return isBug && matchesTc && isNotDone;
        });
        this.activeBugs.set(bugs);
      },
      error: () => {},
    });
  }

  private loadExistingBug(id: string): void {
    this.service.getTaskById(id).subscribe({
      next: (task) => {
        this.parentTaskRecord = task;
        this.form.patchValue({
          id: task.id,
          taskCode: task.taskCode,
          taskName: task.taskName,
          priority: task.priority || 'HIGH',
          assignedTo: task.assignedTo || null,
          estimateManday: task.estimateManday || 1,
          startDate: task.startDate ? task.startDate.split('T')[0] : '',
          endDate: task.endDate ? task.endDate.split('T')[0] : '',
          description: task.description || '',
          attachmentGroupId: task.attachmentGroupId || null,
          workPackageId: task.workPackageId,
          specificationId: task.specificationId,
          projectId: task.projectId,
        });
        this.projectId.set(task.projectId || null);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.dialog.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูล Bug Task ได้');
        this.isLoading.set(false);
        this.goBack();
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลหัวข้อ Bug และรายละเอียดให้ครบถ้วน');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.form.getRawValue();

    const rawName = (formVal.taskName || '').trim();
    const finalTaskName = rawName.toUpperCase().startsWith('[BUG]')
      ? rawName
      : `[BUG] ${rawName}`;

    const taskPayload: any = {
      taskCode: formVal.taskCode,
      taskName: finalTaskName,
      description: formVal.description,
      priority: formVal.priority,
      status: 'To Do',
      startDate: formVal.startDate ? `${formVal.startDate}T09:00:00Z` : new Date().toISOString(),
      endDate: formVal.endDate ? `${formVal.endDate}T18:00:00Z` : new Date().toISOString(),
      estimateManday: formVal.estimateManday || 1,
      workPackageId: formVal.workPackageId || this.parentTaskRecord?.workPackageId || null,
      specificationId: formVal.specificationId || this.parentTaskRecord?.specificationId || null,
      assignedTo: formVal.assignedTo || null,
      assigneeIds: formVal.assignedTo ? [formVal.assignedTo] : (this.parentTaskRecord?.assigneeIds || []),
      attachmentGroupId: formVal.attachmentGroupId || null,
    };

    if (this.isEdit()) {
      // Update existing bug task
      this.service.updateTask(formVal.id, taskPayload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialog.success('บันทึกสำเร็จ', 'อัปเดตข้อมูล Bug Task เรียบร้อยแล้ว');
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'ไม่สามารถอัปเดตข้อมูลได้');
        },
      });
    } else {
      // 1. Move parent task to bugfix status if not already
      if (this.parentTaskRecord && this.parentTaskRecord.id && this.parentTaskRecord.status !== 'bugfix') {
        const updatedParent = {
          ...this.parentTaskRecord,
          status: 'bugfix',
        };
        this.service.updateTask(this.parentTaskRecord.id, updatedParent).subscribe({
          next: () => console.log('Parent task status updated to bugfix'),
          error: (err) => console.error('Failed to update parent task status', err),
        });
      }

      // 2. Create the Bug Task
      this.service.createTask(taskPayload).subscribe({
        next: (createdTask: any) => {
          const createdTaskId = createdTask?.id || createdTask;
          const pId = this.projectId() || formVal.projectId;
          const tcId = this.testCaseId() || formVal.testCaseId;

          // 3. Create Trace Link (FAILED_BY) if testCaseId & taskId are available
          if (pId && tcId && createdTaskId && typeof createdTaskId === 'string') {
            this.traceLinkService.createLink({
              projectId: pId,
              sourceType: 'TEST_CASE',
              sourceId: tcId,
              targetType: 'TASK',
              targetId: createdTaskId,
              relationshipType: 'FAILED_BY',
            }).subscribe({
              next: () => console.log('Trace link created successfully'),
              error: (e: any) => console.warn('Trace link creation skipped', e),
            });
          }

          this.isSubmitting.set(false);
          this.dialog.success(
            'บันทึกสำเร็จ',
            `สร้างรายการ Bug [${formVal.taskCode}] และเชื่อมโยงกับงานเรียบร้อยแล้ว`
          );
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.dialog.error('บันทึกไม่สำเร็จ', err.message || 'ไม่สามารถสร้าง Bug Task ได้');
        },
      });
    }
  }

  goBack(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/feature/pm/test-management']);
    }
  }
}
