import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiAttachmentPayload } from '../utils/ai-attachment.util';

export interface AiProjectPipelineRequest {
  projectName?: string;
  prompt: string;
  customerId?: string | null;
  startDate?: string | null;
  durationWeeks?: number | null;
  model?: string;
  attachments?: AiAttachmentPayload[];
  includeRequirements?: boolean;
  includeSpecifications?: boolean;
  includeTasks?: boolean;
  includeGanttPhases?: boolean;
  includeDelivery?: boolean;
  includeContract?: boolean;
  includeTests?: boolean;
  includeManuals?: boolean;
  includeInvoices?: boolean;
  includeDiagrams?: boolean;
  includeDesignReviews?: boolean;
  includeMa?: boolean;
}

export interface PreviewRequirementItem {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  businessValue?: string;
}

export interface PreviewSpecificationItem {
  title?: string;
  specificationType?: string;
  priority?: string;
  estimatedManday?: number;
  description?: string;
}

export interface PreviewTaskItem {
  taskName?: string;
  description?: string;
  estimateManday?: number;
  weekOffset?: number;
  durationDays?: number;
}

export interface PreviewPhaseItem {
  phaseName?: string;
  weekStart?: number;
  weekEnd?: number;
  color?: string;
}

export interface PreviewDeliveryItem {
  deliveryTitle?: string;
  deliveryType?: string;
  summary?: string;
}

export interface AiProjectPipelinePreviewResponse {
  projectCode: string;
  projectName: string;
  description: string;
  estimatedDurationWeeks: number;
  previewRequirements: PreviewRequirementItem[];
  previewSpecifications: PreviewSpecificationItem[];
  previewTasks: PreviewTaskItem[];
  previewPhases: PreviewPhaseItem[];
  previewDeliveries: PreviewDeliveryItem[];
  message: string;
}

export interface AiProjectPipelineExecuteResponse {
  projectId: string;
  projectCode: string;
  projectName: string;
  status: string;
  createdCounts: Record<string, number>;
  message: string;
  success: boolean;
}

export interface AiPipelineJobStep {
  key: string;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | 'SKIPPED';
  count: number;
  message?: string | null;
}

export interface AiPipelineJob {
  jobId: string;
  status: 'RUNNING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
  finished: boolean;
  projectId?: string | null;
  projectCode?: string | null;
  projectName?: string | null;
  steps: AiPipelineJobStep[];
  createdCounts: Record<string, number>;
  message?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiProjectPipelineService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  readonly isWizardOpen = signal<boolean>(false);
  readonly initialPrompt = signal<string>('');

  openWizard(prompt: string = ''): void {
    this.initialPrompt.set(prompt);
    this.isWizardOpen.set(true);
  }

  closeWizard(): void {
    this.isWizardOpen.set(false);
  }

  generatePreview(request: AiProjectPipelineRequest): Observable<AiProjectPipelinePreviewResponse> {
    return this.http.post<AiProjectPipelinePreviewResponse>(`${this.apiBase}/api/pm/ai/pipeline/preview`, request);
  }

  startPipelineJob(request: AiProjectPipelineRequest): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(`${this.apiBase}/api/pm/ai/pipeline/execute-async`, request);
  }

  getPipelineJob(jobId: string): Observable<AiPipelineJob> {
    return this.http.get<AiPipelineJob>(`${this.apiBase}/api/pm/ai/pipeline/jobs/${jobId}`);
  }

  executePipeline(request: AiProjectPipelineRequest): Observable<AiProjectPipelineExecuteResponse> {
    return this.http.post<AiProjectPipelineExecuteResponse>(`${this.apiBase}/api/pm/ai/pipeline/execute`, request);
  }
}
