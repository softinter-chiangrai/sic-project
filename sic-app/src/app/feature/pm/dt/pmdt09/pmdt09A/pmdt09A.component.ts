import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from '../../../../../core/component/sic-datepicker/sic-datepicker.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { environment } from '../../../../../../environments/environment';

// ===== Model =====
export interface ReviewCommentModel {
  id: string;
  author: string;
  text: string;
  type: string;
  createdAt: string;
}

export interface DesignReviewModel {
  id: string;
  reviewCode: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  reviewableType: string;
  reviewableId: string;
  reviewableName?: string;
  reviewer?: string;
  assignedTo?: string;
  severity: string;
  status: string;
  dueDate: string;
  figmaUrl?: string;
  embedMode?: 'design' | 'prototype';
  isActive: boolean;
  comments?: ReviewCommentModel[];
  state?: number;
  rowVersion?: number;
}

// ===== Form =====
class Pmdt09AForm {
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      reviewCode: [null, [Validators.required, Validators.maxLength(30)]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null, [Validators.required]],
      reviewableType: [null, [Validators.required]],
      reviewableId: [null, [Validators.required]],
      reviewableName: [null],
      projectId: [null, [Validators.required]],
      projectName: [null],
      reviewer: [null],
      assignedTo: [null],
      severity: ['Medium', [Validators.required]],
      status: ['Open', [Validators.required]],
      dueDate: [null, [Validators.required]],
      figmaUrl: ['https://www.figma.com/proto/sample-ui-flow-demo'],
      embedMode: ['prototype'],
      comments: [[]],
      isActive: [true],
      state: [null],
      rowVersion: [null],
    });
  }
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt09AService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/pm/design-reviews`;

  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/projects/combobox`;
  apiGetComboboxReviewable = `${environment.apiBaseUrl}/api/pm/specifications/combobox`;
  apiGetUsers = `${environment.apiBaseUrl}/api/users/available`;

  readonly reviewableTypeOptions = [
    { value: 'SPECIFICATION', label: 'Specification' },
    { value: 'REQUIREMENT', label: 'Requirement' },
    { value: 'UI_SCREEN', label: 'UI Screen / Figma Mockup' },
    { value: 'DFD', label: 'Data Flow Diagram (DFD)' },
    { value: 'ER_DIAGRAM', label: 'ER Diagram' },
  ];

  readonly severityOptions = [
    { value: 'Low', label: 'Low (ต่ำ)' },
    { value: 'Medium', label: 'Medium (ปานกลาง)' },
    { value: 'High', label: 'High (สูง)' },
    { value: 'Critical', label: 'Critical (วิกฤต)' },
  ];

  readonly statusOptions = [
    { value: 'Open', label: 'Open (เปิดอยู่)' },
    { value: 'In Progress', label: 'In Progress (กำลังตรวจสอบ)' },
    { value: 'Resolved', label: 'Resolved (แก้ไขเรียบร้อย)' },
    { value: 'Closed', label: 'Closed (ปิดงาน)' },
  ];

  save(data: any): Observable<any> {
    console.log('📝 Saving design review to DB:', data);
    return this.http.post<string>(this.baseUrl, data);
  }

  getDesignReview(id: string): Observable<DesignReviewModel> {
    return this.http.get<DesignReviewModel>(`${this.baseUrl}/${id}`);
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt09a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicTiptapEditorComponent,
  ],
  templateUrl: './pmdt09A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class Pmdt09AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt09AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('figmaIframe') figmaIframe?: ElementRef<HTMLIFrameElement>;

  form!: FormGroup;
  isEdit = false;
  reviewId: string | null = null;
  isLoading = false;

  // ===== Figma & Embed API State =====
  activeEmbedUrl: SafeResourceUrl | null = null;
  rawEmbedUrl = '';
  isFigmaLoading = false;
  lastEventReceived: string | null = null;
  eventsLog: string[] = [];
  isFullscreen = false;

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  commentTypeOptions = ['Suggestion', 'Correction', 'Risk', 'Question', 'Approval Note'];

  private messageEventListener = (event: MessageEvent) => {
    if (event.origin && event.origin.includes('figma.com')) {
      console.log('⚡ Figma Event Received:', event.data);
      const logText = `[${new Date().toLocaleTimeString()}] ${typeof event.data === 'string' ? event.data : JSON.stringify(event.data)}`;
      this.lastEventReceived = logText;
      this.eventsLog.unshift(logText);
      if (this.eventsLog.length > 5) this.eventsLog.pop();
    }
  };

  pageDirty = () => this.form?.dirty ?? false;

  ngOnInit(): void {
    this.initForm();

    // Listen to Figma Embed postMessage events
    window.addEventListener('message', this.messageEventListener);

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.reviewId = id;
        this.loadDesignReview(id);
      } else {
        this.updateEmbedUrl();
      }
    });

    // รับค่า queryParams (เช่น projectId, requirementId) เมื่อกดสร้างมาจากหน้ารายละเอียด Requirement (PMRT05)
    this.route.queryParams.subscribe((queryParams) => {
      if (!this.isEdit) {
        if (queryParams['projectId']) {
          this.form.patchValue({ projectId: queryParams['projectId'] });
        }
        if (queryParams['requirementId']) {
          this.form.patchValue({
            reviewableType: 'Requirement',
            reviewableId: queryParams['requirementId'],
          });
        }
      }
    });

    this.form.get('reviewableType')?.valueChanges.subscribe(() => {
      this.form.patchValue({ reviewableId: null });
    });

    this.form.get('figmaUrl')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
    });

    this.form.get('embedMode')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageEventListener);
  }

  initForm(): void {
    this.form = Pmdt09AForm.createForm(this.fb);
  }

  loadDesignReview(id: string) {
    this.isLoading = true;
    this.service.getDesignReview(id).subscribe({
      next: (data) => {
        const formData: any = { ...data };
        if (typeof formData.assignedTo === 'string' && formData.assignedTo.trim()) {
          formData.assignedTo = formData.assignedTo.split(',').map((s: string) => s.trim());
        }
        this.form.patchValue(formData);
        this.isLoading = false;
        this.updateEmbedUrl();
        console.log('✅ โหลดข้อมูล Design Review สำเร็จ:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูล Design Review รหัสนี้');
        this.router.navigate(['/feature/pm/design-review']);
      },
    });
  }

  // ===== Figma URL Formatter & Sanitizer =====
  updateEmbedUrl(): void {
    const rawUrl = this.form.get('figmaUrl')?.value;
    if (!rawUrl || !rawUrl.trim()) {
      this.activeEmbedUrl = null;
      this.rawEmbedUrl = '';
      return;
    }

    this.isFigmaLoading = true;
    let target = rawUrl.trim();

    // หากยังไม่ได้แปลงเป็น Figma Embed URL
    const clientId = environment.figma?.clientId ? `&client-id=${environment.figma.clientId}` : '';
    if (!target.includes('figma.com/embed')) {
      const encoded = encodeURIComponent(target);
      target = `https://www.figma.com/embed?embed_host=softflow${clientId}&url=${encoded}`;
    } else if (environment.figma?.clientId && !target.includes('client-id=')) {
      target += `&client-id=${environment.figma.clientId}`;
    }

    this.rawEmbedUrl = target;
    this.activeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(target);

    setTimeout(() => {
      this.isFigmaLoading = false;
    }, 1200);
  }

  setEmbedMode(mode: 'design' | 'prototype'): void {
    this.form.patchValue({ embedMode: mode });
  }

  // ===== Figma Embed API Controls (postMessage) =====
  sendFigmaCommand(commandType: string): void {
    if (!this.figmaIframe?.nativeElement?.contentWindow) {
      console.warn('Figma Iframe not ready');
      return;
    }
    const message = { type: commandType };
    this.figmaIframe.nativeElement.contentWindow.postMessage(message, 'https://www.figma.com');
    console.log(`🚀 Sent Figma Embed Command: [${commandType}]`);
  }

  prototypeNext(): void {
    this.sendFigmaCommand('next');
  }

  prototypePrev(): void {
    this.sendFigmaCommand('prev');
  }

  prototypeRestart(): void {
    this.sendFigmaCommand('restart');
  }

  prototypeToggleHints(): void {
    this.sendFigmaCommand('toggleHints');
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  openExternalFigma(): void {
    const url = this.form.get('figmaUrl')?.value;
    if (url) {
      window.open(url, '_blank');
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/design-review']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const data = { ...this.form.value };
    if (Array.isArray(data.assignedTo)) {
      data.assignedTo = data.assignedTo.join(', ');
    }

    this.service.save(data).subscribe({
      next: () => {
        this.dialog.success('บันทึกสำเร็จ', 'ข้อมูล Design Review ถูกบันทึกเรียบร้อย').then(() => {
          this.form.markAsPristine();
          this.router.navigate(['/feature/pm/design-review']);
        });
      },
      error: (error) => {
        this.dialog.error('บันทึกไม่สำเร็จ', error);
      },
    });
  }
}

export default Pmdt09AComponent;