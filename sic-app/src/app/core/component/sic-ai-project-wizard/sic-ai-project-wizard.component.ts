import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AI_MODEL_OPTIONS } from '../../config/ai-models.config';
import { AiModelsService } from '../../services/ai-models.service';
import {
  AiPipelineJobStep,
  AiProjectPipelinePreviewResponse,
  AiProjectPipelineRequest,
  AiProjectPipelineService,
} from '../../services/ai-project-pipeline.service';
import { DialogService } from '../../services/dialog.service';
import { filesToAiAttachments } from '../../utils/ai-attachment.util';

@Component({
  selector: 'sic-ai-project-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './sic-ai-project-wizard.component.html',
  styleUrl: './sic-ai-project-wizard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicAiProjectWizardComponent implements OnDestroy {
  readonly pipelineSvc = inject(AiProjectPipelineService);
  private readonly aiModelsSvc = inject(AiModelsService);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);

  // Steps: 1 = Input/Prompt, 2 = Plan Preview, 3 = Generating/Executing, 4 = Success
  readonly currentStep = signal<number>(1);
  readonly isProcessing = signal<boolean>(false);

  readonly prompt = signal<string>('');
  readonly projectName = signal<string>('');
  readonly durationWeeks = signal<number>(12);
  readonly selectedModel = signal<string>('gemini-2.5-flash-lite');
  readonly attachedFiles = signal<File[]>([]);

  // Modules toggles
  readonly incReqs = signal<boolean>(true);
  readonly incSpecs = signal<boolean>(true);
  readonly incTasks = signal<boolean>(true);
  readonly incGantt = signal<boolean>(true);
  readonly incDelivery = signal<boolean>(true);
  readonly incContract = signal<boolean>(true);
  readonly incTests = signal<boolean>(true);
  readonly incManuals = signal<boolean>(true);
  readonly incInvoices = signal<boolean>(true);
  readonly incDiagrams = signal<boolean>(true);
  readonly incDesignReviews = signal<boolean>(true);
  readonly incMa = signal<boolean>(true);

  // Background job progress (step 3)
  readonly jobSteps = signal<AiPipelineJobStep[]>([]);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly countLabels: Record<string, string> = {
    project: 'Project',
    contract: 'สัญญา',
    wbs: 'Phase / Milestone / WP',
    requirement: 'Requirements',
    specification: 'Specifications',
    task: 'Tasks',
    test: 'Test Scenario / Case',
    delivery: 'Deliveries',
    manual: 'คู่มือ',
    invoice: 'ใบแจ้งหนี้ร่าง',
    diagram: 'Diagrams',
    design_review: 'Design Review',
    ma: 'MA Ticket / ต่ออายุ',
  };

  // Preview Data
  readonly previewData = signal<AiProjectPipelinePreviewResponse | null>(null);

  // Execution result
  readonly createdProjectId = signal<string | null>(null);
  readonly createdCounts = signal<Record<string, number>>({});

  get availableModels() {
    return this.aiModelsSvc.models();
  }

  async generatePreview(): Promise<void> {
    if (!this.prompt().trim() && !this.projectName().trim()) return;

    this.isProcessing.set(true);
    try {
      const attachments = await filesToAiAttachments(this.attachedFiles());
      const req: AiProjectPipelineRequest = {
        projectName: this.projectName(),
        prompt: this.prompt(),
        durationWeeks: this.durationWeeks(),
        model: this.selectedModel(),
        attachments,
        includeRequirements: this.incReqs(),
        includeSpecifications: this.incSpecs(),
        includeTasks: this.incTasks(),
        includeGanttPhases: this.incGantt(),
        includeDelivery: this.incDelivery(),
      };

      this.pipelineSvc.generatePreview(req).subscribe({
        next: (res) => {
          this.previewData.set(res);
          if (res.projectName && !this.projectName()) {
            this.projectName.set(res.projectName);
          }
          this.currentStep.set(2);
          this.isProcessing.set(false);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.dialog.error('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการวิเคราะห์โครงการ: ' + (err?.message || 'โปรดลองใหม่'));
        },
      });
    } catch (err: any) {
      this.isProcessing.set(false);
      this.dialog.error('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการประมวลผลไฟล์แนบ');
    }
  }

  async executeFullPipeline(): Promise<void> {
    this.isProcessing.set(true);
    this.jobSteps.set([]);
    this.currentStep.set(3);

    try {
      const attachments = await filesToAiAttachments(this.attachedFiles());
      const req: AiProjectPipelineRequest = {
        projectName: this.projectName(),
        prompt: this.prompt(),
        durationWeeks: this.durationWeeks(),
        model: this.selectedModel(),
        attachments,
        includeRequirements: this.incReqs(),
        includeSpecifications: this.incSpecs(),
        includeTasks: this.incTasks(),
        includeGanttPhases: this.incGantt(),
        includeDelivery: this.incDelivery(),
        includeContract: this.incContract(),
        includeTests: this.incTests(),
        includeManuals: this.incManuals(),
        includeInvoices: this.incInvoices(),
        includeDiagrams: this.incDiagrams(),
        includeDesignReviews: this.incDesignReviews(),
        includeMa: this.incMa(),
      };

      // งานทำเบื้องหลังหลายนาที: เริ่มงานแล้ว poll ความคืบหน้าทีละขั้นแทนการรอ request เดียว
      this.pipelineSvc.startPipelineJob(req).subscribe({
        next: ({ jobId }) => this.pollJob(jobId),
        error: (err) => this.failToPreview('เกิดข้อผิดพลาดในการเริ่มสร้างโครงการ: ' + (err?.message || 'โปรดลองใหม่')),
      });
    } catch {
      this.failToPreview('เกิดข้อผิดพลาดในการประมวลผลไฟล์แนบ');
    }
  }

  private pollJob(jobId: string): void {
    this.stopPolling();
    const tick = () =>
      this.pipelineSvc.getPipelineJob(jobId).subscribe({
        next: (job) => {
          this.jobSteps.set(job.steps);
          if (!job.finished) return;
          this.stopPolling();
          this.isProcessing.set(false);
          if (job.status === 'FAILED') {
            this.failToPreview(job.message || 'สร้างโครงการไม่สำเร็จ');
            return;
          }
          this.createdProjectId.set(job.projectId ?? null);
          this.createdCounts.set(job.createdCounts || {});
          this.currentStep.set(4);
          if (job.status === 'COMPLETED_WITH_ERRORS') {
            this.dialog.warn('สร้างเสร็จบางส่วน', job.message || 'บางขั้นตอนไม่สำเร็จ');
          }
        },
        error: () => {
          this.stopPolling();
          this.failToPreview('ไม่สามารถติดตามความคืบหน้าได้ (งานอาจยังทำงานอยู่เบื้องหลัง ตรวจสอบรายการโครงการอีกครั้ง)');
        },
      });
    tick();
    this.pollTimer = setInterval(tick, 2000);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private failToPreview(message: string): void {
    this.stopPolling();
    this.isProcessing.set(false);
    this.currentStep.set(2);
    this.dialog.error('ข้อผิดพลาด', message);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  goToProject(): void {
    const id = this.createdProjectId();
    this.close();
    if (id) {
      this.router.navigate(['/pm/dt/pmdt01A'], { queryParams: { id } });
    } else {
      this.router.navigate(['/pm/rt/pmrt01']);
    }
  }

  goToGantt(): void {
    this.close();
    this.router.navigate(['/pm/rt/pmrt07']);
  }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.attachedFiles.set([...this.attachedFiles(), ...Array.from(target.files)]);
    }
  }

  removeFile(index: number): void {
    const next = [...this.attachedFiles()];
    next.splice(index, 1);
    this.attachedFiles.set(next);
  }

  close(): void {
    this.stopPolling();
    this.pipelineSvc.closeWizard();
    this.currentStep.set(1);
    this.prompt.set('');
    this.projectName.set('');
    this.attachedFiles.set([]);
    this.previewData.set(null);
  }
}
