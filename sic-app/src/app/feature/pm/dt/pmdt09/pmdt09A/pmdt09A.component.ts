import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicInputAreaComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { environment } from '../../../../../../environments/environment';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';
import { DesignReviewModel, Pmdt09APageData } from './pmdt09A.model';
import { Pmdt09AService } from './pmdt09A.service';

// ===== Component =====
@Component({
  selector: 'app-pmdt09a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    SicButtonComponent,
    SicVersionBadgeComponent,
    SicComboboxComponent,
    SicDatepickerComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicTraceLinkPanelComponent,
  ],
  templateUrl: './pmdt09A.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt09AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt09AService);
  readonly dialog = inject(DialogService);
  readonly customerState = inject(CustomerStateService);
  private readonly approvalService = inject(ApprovalService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  @ViewChild('figmaIframe') figmaIframe?: ElementRef<HTMLIFrameElement>;

  formData!: SicFromData<DesignReviewModel>;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isLocked = false;
  reviewId: string | null = null;
  isLoading = false;
  isSaving = false;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ===== Figma & Embed API State =====
  activeEmbedUrl: SafeResourceUrl | null = null;
  rawEmbedUrl = '';
  isFigmaLoading = false;
  isFullscreen = false;

  // ===== Options =====
  severityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    // Data is preloaded by pmdt09AResolver: form built + patched (create mode seeds
    // projectId/reviewableId from queryParams, edit mode fetches the real design review).
    const pageData: Pmdt09APageData = this.route.snapshot.data['pageData'];
    this.formData = pageData.formData;
    this.isEdit = pageData.isEdit;
    this.reviewId = pageData.reviewId;

    this.loadFlows();

    if (this.isEdit && this.reviewId) {
      const data = this.formData.value;
      if (data.isLocked) {
        this.isLocked = true;
        this.form.disable();
      } else {
        this.isLocked = false;
        const isViewRoute = this.router.url.includes('/view');
        if (isViewRoute) {
          this.form.disable();
        }
      }
      this.loadApprovalFlowForReview(this.reviewId);
    }
    this.updateEmbedUrl();

    this.form.get('reviewableType')?.valueChanges.subscribe(() => {
      this.form.patchValue({ reviewableId: null });
      this.cdr.markForCheck();
    });

    this.form.get('figmaUrl')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
      this.cdr.markForCheck();
    });

    this.form.get('embedMode')?.valueChanges.subscribe(() => {
      this.updateEmbedUrl();
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

  loadFlows(): void {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('DESIGN_REVIEW')
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          this.isLoadingFlows = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingFlows = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFlowChange(event: any): void {
    const flowId = event?.id ?? event?.value ?? event ?? null;
    this.selectedFlowId = flowId;
    this.form.patchValue({ approvalFlowId: flowId });
    this.cdr.markForCheck();
  }

  loadApprovalFlowForReview(reviewId: string): void {
    this.approvalService.getDocumentStatus('DESIGN_REVIEW', reviewId).subscribe({
      next: (approval) => {
        let flowId: string | null = null;
        if (approval && (approval as any).flowId) {
          flowId = (approval as any).flowId;
        } else if (approval && (approval as any).flow?.id) {
          flowId = (approval as any).flow.id;
        }
        if (flowId) {
          this.selectedFlowId = flowId;
          this.form.patchValue({ approvalFlowId: flowId });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {}

  // ===== Figma URL Formatter & Sanitizer =====
  updateEmbedUrl(): void {
    const rawUrl = this.form.get('figmaUrl')?.value;
    if (!rawUrl || !rawUrl.trim()) {
      this.activeEmbedUrl = null;
      this.rawEmbedUrl = '';
      this.cdr.markForCheck();
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
      this.cdr.markForCheck();
    }, 1200);
    this.cdr.markForCheck();
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

  requestChange(): void {
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.form.get('projectId')?.value,
        targetType: 'DESIGN_REVIEW',
        targetId: this.reviewId,
        targetTitle: this.form.get('title')?.value,
      },
    });
  }

  submit() {
    if (this.isLocked) return;
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      
      const fieldLabels: Record<string, string> = {
        reviewCode: this.translate.instant('PMDT09_REVIEW_CODE_LABEL'),
        title: this.translate.instant('PMDT09_TITLE_LABEL'),
        description: this.translate.instant('PMDT09_DESC_LABEL'),
        reviewableType: this.translate.instant('PMDT09_REVIEWABLE_TYPE_LABEL'),
        reviewableId: this.translate.instant('PMDT09_REVIEWABLE_ID_LABEL'),
        projectId: this.translate.instant('PMDT09_PROJECT_LABEL'),
        severity: this.translate.instant('PMDT09_SEVERITY_FIELD_LABEL'),
        status: this.translate.instant('PMDT09_STATUS_LABEL'),
        dueDate: this.translate.instant('PMDT09_DUE_DATE_LABEL'),
      };

      const invalidControls = Object.keys(this.form.controls)
        .filter((key) => this.form.get(key)?.invalid)
        .map((key) => fieldLabels[key] || key);

      console.warn('❌ Form Invalid! Invalid fields:', invalidControls);

      const errorMsg = invalidControls.length > 0
        ? `${this.translate.instant('PMDT09_REQUIRED_FIELDS_MSG')}\n• ${invalidControls.join('\n• ')}`
        : this.translate.instant('PMDT09_FILL_FORM_CORRECTLY');

      this.dialog.warn(this.translate.instant('PMDT09_FORM_INVALID_TITLE'), errorMsg);
      return;
    }

    this.isSaving = true;
    const rawVal = this.formData.form.getRawValue();
    const targetId = this.reviewId || rawVal.id;
    const isEditMode = !!targetId || this.isEdit;
    const data = {
      ...rawVal,
      id: targetId || undefined,
    };
    if (!data.reviewableType) {
      data.reviewableType = 'Specification';
    }
    if (Array.isArray(data.assignedTo)) {
      data.assignedTo = (data.assignedTo as any[]).join(', ');
    }
    data.state = isEditMode ? SicEntityState.Modified : SicEntityState.Added;

    this.service.save(data).subscribe({
      next: (response: any) => {
        const savedId = (typeof response === 'string' ? response : response?.id) || data.id || this.reviewId;
        
        if (this.selectedFlowId && savedId) {
          this.approvalService
            .submitForApproval({
              documentType: 'DESIGN_REVIEW',
              documentId: savedId,
              documentCode: data.reviewCode,
              documentTitle: data.title,
              flowId: this.selectedFlowId,
              comment: this.translate.instant('PMDT09_SUBMIT_APPROVAL_COMMENT'),
            })
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.isSaved = true;
                this.dialog.success(this.translate.instant('PMDT09_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT09_SAVE_SUCCESS_MSG')).then(() => {
                  this.formData.markAsPristine();
                  this.router.navigate(['/feature/pm/design-review']);
                });
              },
              error: (err) => {
                this.isSaving = false;
                this.isSaved = true;
                this.dialog.success(this.translate.instant('PMDT09_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT09_SAVE_SUCCESS_MSG')).then(() => {
                  this.formData.markAsPristine();
                  this.router.navigate(['/feature/pm/design-review']);
                });
              }
            });
        } else {
          this.isSaving = false;
          this.isSaved = true;
          this.dialog.success(this.translate.instant('PMDT09_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT09_SAVE_SUCCESS_MSG')).then(() => {
            this.formData.markAsPristine();
            this.router.navigate(['/feature/pm/design-review']);
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error(this.translate.instant('PMDT09_SAVE_ERROR_TITLE'), error);
      },
    });
  }

  onDelete(): void {
    if (!this.reviewId || this.isLocked) return;
    this.dialog.confirm(
      this.translate.instant('PMDT09_CONFIRM_DELETE_TITLE'),
      this.translate.instant('PMDT09_CONFIRM_DELETE_MSG', { code: this.form.get('reviewCode')?.value, title: this.form.get('title')?.value })
    ).then((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.http.delete(`${environment.apiBaseUrl}/api/pm/design-reviews/${this.reviewId}`).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT09_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT09_DELETE_SUCCESS_MSG')).then(() => {
              this.form.markAsPristine();
              this.router.navigate(['/feature/pm/design-review']);
            });
          },
          error: (err) => {
            console.error('Error deleting design review:', err);
            this.dialog.error(this.translate.instant('PMDT09_DELETE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT09_DELETE_ERROR_MSG'));
            this.isLoading = false;
          }
        });
      }
    });
  }
}

export default Pmdt09AComponent;