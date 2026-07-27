// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.component.ts
import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Post } from '../discussion.model';
import { DiscussionService } from '../discussion.service';

import { finalize } from 'rxjs';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputUploadComponent } from '../../../../../core/component/sic-input-upload/sic-input-upload.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { DialogService } from '../../../../../core/services/dialog.service';

@Component({
  selector: 'app-pmdt09a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicInputUploadComponent,
  ],
  templateUrl: './pmdt09A.component.html',
  styleUrl: './pmdt09A.component.css',
})
export class Pmdt09AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscussionService);
  private dialog = inject(DialogService);

  @Input() projectId!: string;
  @Input() postToEdit: Post | null = null;
  @Input() currentUserAvatar: string | null = null;
  @Input() currentUserName: string = 'ผู้ใช้งาน';

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
      this.dialog.warn('กรุณากรอกข้อมูลให้ครบถ้วน', 'กรุณาระบุหัวข้อและเนื้อหาข้อความ');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.postForm.value;

    if (this.isEdit && this.postToEdit) {
      // แก้ไขโพสต์เดิม
      this.service
        .updateComment(this.postToEdit.id, { content: formValue.content })
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: (updatedPost) => {
            const result: Post = {
              ...this.postToEdit!,
              subject: formValue.subject,
              content: formValue.content,
              attachmentGroupId: formValue.attachmentGroupId,
            };
            this.dialog.success('สำเร็จ', 'อัปเดตโพสต์เรียบร้อยแล้ว');
            this.saved.emit(result);
          },
          error: (err) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถบันทึกข้อมูลได้');
          },
        });
    } else {
      let attachmentGroupId: string | undefined = undefined;
      if (Array.isArray(formValue.attachmentGroupId) && formValue.attachmentGroupId.length > 0) {
        attachmentGroupId = formValue.attachmentGroupId[0]?.uploadGroupId || formValue.attachmentGroupId[0]?.id;
      } else if (typeof formValue.attachmentGroupId === 'string') {
        attachmentGroupId = formValue.attachmentGroupId;
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
            this.dialog.success('สำเร็จ', 'สร้างโพสต์ใหม่เรียบร้อยแล้ว');
            this.saved.emit(newPost);
          },
          error: (err) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถสร้างโพสต์ได้');
          },
        });
    }
  }
}
