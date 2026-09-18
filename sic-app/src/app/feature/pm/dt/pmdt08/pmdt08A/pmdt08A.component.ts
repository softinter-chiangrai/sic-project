// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.component.ts
import { Component, EventEmitter, Input, Output, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Post } from '../discussion.model';
import { DiscussionService } from '../discussion.service';
import { finalize, Subscription } from 'rxjs';
import { SicButtonComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicInputUploadComponent } from '../../../../../core/component/sic-input-upload/sic-input-upload.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt08a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicButtonComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicInputUploadComponent,
    TranslateModule,
  ],
  templateUrl: './pmdt08A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pmdt08A.component.css',
})
export class Pmdt08AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscussionService);
  private dialog = inject(DialogService);
  private translate = inject(TranslateService);

  // ✅ Input properties - ต้องเป็น public (หรือไม่ใส่ modifier)
  @Input() projectId!: string;
  @Input() postToEdit: Post | null = null;   // ✅ ไม่ต้องมี private
  @Input() currentUserAvatar: string | null = null;
  @Input() currentUserName: string = 'User';

  @Output() saved = new EventEmitter<Post>();
  @Output() closed = new EventEmitter<void>();

  postForm!: FormGroup;
  isSubmitting = false;

  get isEdit(): boolean {
    return !!this.postToEdit;
  }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      subject: [this.postToEdit?.subject || '', Validators.required],
      content: [this.postToEdit?.content || '', Validators.required],
      attachmentGroupId: [this.postToEdit?.attachmentGroupId || null],
    });
  }

  closeModal(): void {
    this.closed.emit();
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      this.dialog.warn(this.translate.instant('PMDT08A_FORM_INCOMPLETE_TITLE'), this.translate.instant('PMDT08A_FORM_INCOMPLETE_MSG'));
      return;
    }

    this.isSubmitting = true;
    const formValue = this.postForm.value;

    // ✅ อ่าน attachmentGroupId จาก control โดยตรง
    let attachmentGroupId: string | undefined = undefined;
    const rawGroupId = formValue.attachmentGroupId;

    if (Array.isArray(rawGroupId) && rawGroupId.length > 0) {
      const firstFile = rawGroupId[0];
      attachmentGroupId = firstFile?.uploadGroupId || firstFile?.id || null;
    } else if (typeof rawGroupId === 'string' && rawGroupId.trim()) {
      attachmentGroupId = rawGroupId;
    } else if (rawGroupId && typeof rawGroupId === 'object' && rawGroupId.uploadGroupId) {
      attachmentGroupId = rawGroupId.uploadGroupId;
    }

    if (!attachmentGroupId && this.postForm.get('attachmentGroupId')?.value) {
      const val = this.postForm.get('attachmentGroupId')?.value;
      if (typeof val === 'string') attachmentGroupId = val;
    }

    if (this.isEdit && this.postToEdit) {
      // แก้ไขโพสต์
      this.service
        .updateComment(this.postToEdit.id, { content: formValue.content })
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: () => {
            const result: Post = {
              ...this.postToEdit!,
              subject: formValue.subject,
              content: formValue.content,
              attachmentGroupId: attachmentGroupId || this.postToEdit!.attachmentGroupId,
            };
            this.dialog.success(this.translate.instant('PMDT08A_SUCCESS_TITLE'), this.translate.instant('PMDT08A_UPDATE_SUCCESS_MSG'));
            this.saved.emit(result);
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT08A_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08A_SAVE_FAILED_MSG'));
          },
        });
    } else {
      // สร้างโพสต์ใหม่
      if (!this.projectId) {
        this.isSubmitting = false;
        this.dialog.warn(this.translate.instant('PMDT08A_PROJECT_ID_NOT_FOUND_TITLE'), this.translate.instant('PMDT08A_PROJECT_ID_NOT_FOUND_MSG'));
        return;
      }

      const request = {
        targetId: this.projectId,
        subject: formValue.subject,
        content: formValue.content,
        attachmentGroupId: attachmentGroupId,
      };

      this.service
        .createPost(request)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: (newPost) => {
            this.dialog.success(this.translate.instant('PMDT08A_SUCCESS_TITLE'), this.translate.instant('PMDT08A_CREATE_SUCCESS_MSG'));
            this.saved.emit(newPost);
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT08A_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08A_CREATE_FAILED_MSG'));
          },
        });
    }
  }
}
