// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.component.ts
import { Component, EventEmitter, Input, Output, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Post } from '../discussion.model';
import { DiscussionService } from '../discussion.service';
import { finalize, Subscription } from 'rxjs';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicInputUploadComponent } from '../../../../../core/component/sic-input-upload/sic-input-upload.component';


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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pmdt09A.component.css',
})
export class Pmdt09AComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscussionService);
  private dialog = inject(DialogService);

  // ✅ Input properties - ต้องเป็น public (หรือไม่ใส่ modifier)
  @Input() projectId!: string;
  @Input() postToEdit: Post | null = null;   // ✅ ไม่ต้องมี private
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
            this.dialog.success('สำเร็จ', 'อัปเดตโพสต์เรียบร้อยแล้ว');
            this.saved.emit(result);
          },
          error: (err) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถบันทึกข้อมูลได้');
          },
        });
    } else {
      // สร้างโพสต์ใหม่
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
