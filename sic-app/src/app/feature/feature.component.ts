import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SicSidebarComponent } from '../core/component/sic-sidebar/sic-sidebar.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import type { SicCalendarTask } from '../core/component/sic-calendar/sic-calendar.component';
import { SicTaskConfig, SicTaskPersistState } from '../core/component/sic-task/sic-task.component';
import { SicOrganizationalChartNode } from '../core/component/sic-organizational-chart/sic-organizational-chart.model';
import { SicHeadchatComponent } from "../core/component/sic-headchat/sic-headchat.component";
import { SicCommandPaletteComponent } from "../core/component/sic-command-palette/sic-command-palette.component";
import { SicShortcutHelpComponent } from "../core/component/sic-shortcut-help/sic-shortcut-help.component";
import { SicAiNavigatorComponent } from "../core/component/sic-ai-navigator/sic-ai-navigator.component";
import { APP_TRANSLATE_MODULE_CODE, APP_TRANSLATE_PROGRAM_CODE, AppTranslateLoader } from '../core/services/app-translate-loader.service';

type TaskPersistMeta = {
  taskId: string | null;
  rowVersion: number | null;
  startTime: string | null;
  endTime: string | null;
};

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [RouterOutlet, SicSidebarComponent,ReactiveFormsModule, CommonModule, SicHeadchatComponent, SicCommandPaletteComponent, SicShortcutHelpComponent, SicAiNavigatorComponent],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Feature {
  private readonly taskPersistMeta = new Map<string, TaskPersistMeta>();

  protected readonly title = signal('sic-app');

  readonly form = new FormGroup({
    inputMail: new FormControl(null, [Validators.required, Validators.email]),
    amount: new FormControl(null, [Validators.required, Validators.max(10000)]),
    comboId: new FormControl(null, [Validators.required]),
    date: new FormControl(null, [Validators.required]),
    time: new FormControl(null, [Validators.required]),
    color: new FormControl(null, [Validators.required]),
    checkbox: new FormControl(null, [Validators.required]),
    textarea: new FormControl(null, [Validators.required, Validators.minLength(10)]),
    answer: new FormControl(null, [Validators.required]),
    uploads: new FormControl([], [Validators.required]),
    uploadGroupId: new FormControl('019da987-2878-76ab-8b5d-972f936047dc', [Validators.required]),
  });

  submitAttempted = false;

  maxDate: Date = new Date();

  organizationData = signal<SicOrganizationalChartNode>({
	"id": "",
	"nameEn": "Admin",
	"nameLocal": "ผู้ดูแลระบบ",
	"color": "#FF6B6B",
	"children": [
		{
			"id": "118fdacb-7f5f-48c1-9f38-cd25962f1ca5",
			"nameEn": "Project Manager",
			"nameLocal": "ผู้จัดการโครงการ",
			"color": "#AF7BEF",
			"children": [
				{
					"id": "fae6b36f-f316-42d3-9c54-179ffc5a2470",
					"nameEn": "system analyst",
					"nameLocal": "นักวิเคราะห์ระบบ",
					"color": "#97E2D6",
					"children": [
						{
							"id": "62d58fef-df01-4e75-ae32-ee2ea3c15648",
							"nameEn": "Senior Developer",
							"nameLocal": "นักพัฒนาซอฟต์แวร์อาวุโส",
							"color": "#CD88E2",
							"children": [
								{
									"id": "a1b4c637-1697-479a-8d55-9c80bc9898b1",
									"nameEn": "Developer",
									"nameLocal": "นักพัฒนาซอฟต์แวร์",
									"color": "#CCA3CC",
									"children": []
								}
							]
						}
					]
				},
        {
			"id": "d22d7b15-2082-4d2e-bd02-7601f1515f98",
			"nameEn": "Project Executive",
			"nameLocal": "เจ้าหน้าที่บริหารโครงการ",
			"color": "#F089D7",
			"children": [
				{
					"id": "2d193767-7345-4fcd-ac8e-cb9572f9261d",
					"nameEn": "Project Coordinator (PC)",
					"nameLocal": "ผู้ประสานงานโครงการ",
					"color": "#E7DD84",
					"children": []
				}
			]
		},
		{
			"id": "cfc57dc2-591d-4ec2-883c-860f4e7d8462",
			"nameEn": "Business Analyst",
			"nameLocal": "นักวิเคราะห์ธุรกิจ",
			"color": "#FFA07A",
			"children": []
		}
			]
		}
	]
});

  apiCombobox:string = `${environment.apiBaseUrl}/api/ex/examples/lov`;
  apiRadio:string = `${environment.apiBaseUrl}/api/db/parameter/lov`;

  readonly taskConfig: SicTaskConfig = {
    api: `${environment.apiBaseUrl}/api/su/tasks/search`,
    id: 'id',
    params: {
      // Optional: set taskId when creating new rows so save can include a master task.
      // taskId: '00000000-0000-0000-0000-000000000000',
    },
    startDateParam: 'startDate',
    endDateParam: 'endDate',
    saveApi: `${environment.apiBaseUrl}/api/su/tasks/save`,
    saveMethod: 'POST',
    mapSearchItem: (row) => this.mapCalendarTask(row),
    savePayload: (task, state) => this.buildCalendarSavePayload(task, state),
  };


  currentStep = 0;

  readonly steps = [
    { title: 'โปรไฟล์' },
    { title: 'บริษัท' , disabled:true},
    { title: 'ปลั๊กอิน', skippable: true},
    { title: 'ประมวลผล' },
  ];

  get inputMail(): FormControl {
    return this.form.controls.inputMail;
  }

  get amount(): FormControl {
    return this.form.controls.amount;
  }

  get comboId(): FormControl {
    return this.form.controls.comboId;
  }

  get date(): FormControl {
    return this.form.controls.date;
  }

  get time(): FormControl {
    return this.form.controls.time;
  }

  get color(): FormControl {
    return this.form.controls.color;
  }

  get checkbox(): FormControl {
    return this.form.controls.checkbox;
  }

  get textarea(): FormControl {
    return this.form.controls.textarea;
  }

  get uploads(): FormControl {
    return this.form.controls.uploads;
  }

  get uploadGroupId(): FormControl {
    return this.form.controls.uploadGroupId;
  }

  get answer(): FormControl {
    return this.form.controls.answer;
  }

  onStepperFinish(): void {
    console.log('Stepper finished');
  }

  onStepSkip(): void {
    console.log('Step skipped');
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    console.log('Form submitted');
    console.log('Email:', this.inputMail.value);
    console.log('Amount:', this.amount.value);
    console.log('Combobox ID:', this.comboId.value);
    console.log('Date:', this.date.value);
    console.log('Time:', this.time.value);
    console.log('Color:', this.color.value);
    console.log('Checkbox:', this.checkbox.value);
    console.log('Textarea:', this.textarea.value);
    console.log('Uploads:', this.uploads.value);
    console.log('Answer:', this.answer.value);
  }

  onCalendarTasksChange(tasks: SicCalendarTask[]): void {
    console.log('Calendar tasks changed:', tasks);
  }

  onGridRowsChange(rows: any[]): void {
    console.log('Grid rows changed:', rows);
  }

  onGridAction(event: { action: string; row?: Record<string, unknown> | null; rows?: Record<string, unknown>[] }): void {
    console.log('Grid action:', event.action, event.row, event.rows);
  }

  onBusinessChartDataChanged(data: SicOrganizationalChartNode): void {
    this.organizationData.set(data);
    console.log('Organization chart updated:', data);
  }

  private mapCalendarTask(row: Record<string, unknown>): SicCalendarTask {
    const id = this.toText(row['id']) || crypto.randomUUID();
    const startTime = this.toText(row['startTime']);
    const endTime = this.toText(row['endTime']);

    this.taskPersistMeta.set(id, {
      taskId: this.toText(row['taskId']),
      rowVersion: this.toNumber(row['rowVersion']),
      startTime,
      endTime,
    });

    const rawDate = startTime ?? endTime ?? new Date().toISOString();
    return {
      id,
      title: this.toText(row['title']) || this.toText(row['taskNameEn']) || this.toText(row['taskCode']) || 'Untitled task',
      description: typeof row['description'] === 'string' ? row['description'] : undefined,
      date: this.normalizeCalendarDate(rawDate),
      color: '#4ECDC4',
      completed: false,
    };
  }

  private buildCalendarSavePayload(task: SicCalendarTask, state: SicTaskPersistState) {
    const metadata = this.taskPersistMeta.get(task.id);
    const configuredTaskId = this.toText(this.taskConfig.params?.['taskId']);
    const taskId = metadata?.taskId ?? configuredTaskId;

    return {
      id: metadata ? task.id : null,
      taskId,
      title: task.title,
      startTime: task.date,
      endTime: task.date,
      description: task.description ?? null,
      rowVersion: metadata?.rowVersion ?? null,
      state,
    };
  }

  private normalizeCalendarDate(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  private toText(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }

    return null;
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  getTreeSize(node: SicOrganizationalChartNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.getTreeSize(child);
      }
    }
    return count;
  }

  getMaxDepth(node: SicOrganizationalChartNode, depth = 1): number {
    if (!node.children || node.children.length === 0) {
      return depth;
    }

    let maxDepth = depth;
    for (const child of node.children) {
      maxDepth = Math.max(maxDepth, this.getMaxDepth(child, depth + 1));
    }
    return maxDepth;
  }
}
