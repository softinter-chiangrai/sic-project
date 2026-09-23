import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AI_MODEL_OPTIONS } from '../../config/ai-models.config';
import {
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
export class SicAiProjectWizardComponent {
  readonly pipelineSvc = inject(AiProjectPipelineService);
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

  // Preview Data
  readonly previewData = signal<AiProjectPipelinePreviewResponse | null>(null);

  // Execution result
  readonly createdProjectId = signal<string | null>(null);
  readonly createdCounts = signal<Record<string, number>>({});

  readonly availableModels = AI_MODEL_OPTIONS;

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
      };

      this.pipelineSvc.executePipeline(req).subscribe({
        next: (res) => {
          this.createdProjectId.set(res.projectId);
          this.createdCounts.set(res.createdCounts || {});
          this.currentStep.set(4);
          this.isProcessing.set(false);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.currentStep.set(2);
          this.dialog.error('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสร้างโครงการ: ' + (err?.message || 'โปรดลองใหม่'));
        },
      });
    } catch {
      this.isProcessing.set(false);
      this.currentStep.set(2);
      this.dialog.error('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการประมวลผล');
    }
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
    this.pipelineSvc.closeWizard();
    this.currentStep.set(1);
    this.prompt.set('');
    this.projectName.set('');
    this.attachedFiles.set([]);
    this.previewData.set(null);
  }
}
