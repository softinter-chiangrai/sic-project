// src/app/feature/pm/dt/pmdt09/pmdt09.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { SicInputUploadComponent } from '../../../../core/component/sic-input-upload/sic-input-upload.component';
import { Post } from './discussion.model';
import { DiscussionService } from './discussion.service';

@Component({
  selector: 'app-pmdt09',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
    SicCardComponent,
    SicDatePipe,
    SicInputUploadComponent,
  ],
  templateUrl: './pmdt09.component.html',
  styleUrl: './pmdt09.component.css',
})
export class Pmdt09Component implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscussionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);

  posts = signal<Post[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  projectId = signal<string | null>(null);
  expandedPostId = signal<string | null>(null);
  editingCommentId = signal<string | null>(null);
  replyingPostId = signal<string | null>(null);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  // Forms
  postForm!: FormGroup;
  replyForm!: FormGroup;
  editForm!: FormGroup;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        this.loadPosts();
      } else {
        this.dialog.warn('ไม่พบ Project', 'กรุณาเลือก Project ก่อน');
        this.router.navigate(['/feature/pm/pmrt02']);
      }
    });

    this.postForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required],
      attachmentGroupId: [null],
    });

    this.replyForm = this.fb.group({
      content: ['', Validators.required],
      attachmentGroupId: [null],
    });

    this.editForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  loadPosts(): void {
    const projectId = this.projectId();
    if (!projectId) return;
    this.isLoading.set(true);
    this.service
      .getPosts(projectId, this.currentPage(), this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.posts.set(response.content || []);
          this.totalElements.set(response.totalElements || 0);
          this.totalPages.set(response.totalPages || 0);
        },
        error: (err) => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  loadReplies(postId: string): void {
    this.service.getReplies(postId).subscribe({
      next: (replies) => {
        this.posts.update((posts) =>
          posts.map((p) => (p.id === postId ? { ...p, replies } : p))
        );
      },
      error: () => {
        // silent fail
      },
    });
  }

  toggleExpand(postId: string): void {
    if (this.expandedPostId() === postId) {
      this.expandedPostId.set(null);
    } else {
      this.expandedPostId.set(postId);
      const post = this.posts().find((p) => p.id === postId);
      if (post && !post.replies) {
        this.loadReplies(postId);
      }
    }
  }

  startReply(postId: string): void {
    this.replyingPostId.set(postId);
    this.replyForm.reset({ content: '', attachmentGroupId: null });
  }

  cancelReply(): void {
    this.replyingPostId.set(null);
  }

  submitReply(): void {
    if (this.replyForm.invalid) {
      this.dialog.warn('กรุณาใส่ข้อความ', 'ต้องระบุข้อความในการตอบกลับ');
      return;
    }
    const postId = this.replyingPostId();
    if (!postId) return;

    this.isSubmitting.set(true);
    const request = this.replyForm.value;
    request.postId = postId;

    this.service
      .createReply(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newReply) => {
          this.dialog.success('ตอบกลับสำเร็จ', 'ข้อความของคุณถูกเพิ่มแล้ว');
          this.replyingPostId.set(null);
          this.replyForm.reset();
          // เพิ่ม reply ใน local
          this.posts.update((posts) =>
            posts.map((p) =>
              p.id === postId
                ? { ...p, replyCount: p.replyCount + 1, replies: [...(p.replies || []), newReply] }
                : p
            )
          );
        },
        error: (err) => {
          this.dialog.error('ตอบกลับไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      this.dialog.warn('กรุณาใส่ข้อมูล', 'ต้องระบุหัวข้อและเนื้อหา');
      return;
    }
    const projectId = this.projectId();
    if (!projectId) return;

    this.isSubmitting.set(true);
    const request = { ...this.postForm.value, projectId };

    this.service
      .createPost(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newPost) => {
          this.dialog.success('โพสต์สำเร็จ', 'ข้อความของคุณถูกเผยแพร่แล้ว');
          this.postForm.reset();
          // เพิ่มโพสต์ใหม่ที่ด้านบน
          this.posts.update((posts) => [newPost, ...posts]);
        },
        error: (err) => {
          this.dialog.error('โพสต์ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  startEdit(postId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    this.editingCommentId.set(postId);
    this.editForm.patchValue({ content: post.content });
  }

  startEditReply(postId: string, replyId: string): void {
    // เราจะใช้ editingCommentId เป็น `replyId` และเก็บ postId ไว้ใน editForm context
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    const reply = post.replies?.find((r) => r.id === replyId);
    if (!reply) return;
    this.editingCommentId.set(replyId);
    this.editForm.patchValue({ content: reply.content });
    // เก็บ postId ไว้ใน custom property ของ form (หรือใช้ตัวแปร)
    (this.editForm as any).__postId = postId;
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editForm.reset();
    (this.editForm as any).__postId = null;
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.dialog.warn('กรุณาใส่ข้อความ', 'ต้องระบุข้อความ');
      return;
    }
    const commentId = this.editingCommentId();
    if (!commentId) return;
    const content = this.editForm.value.content;

    this.isSubmitting.set(true);
    this.service
      .updateComment(commentId, content)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.dialog.success('แก้ไขสำเร็จ', 'ข้อความถูกอัปเดตแล้ว');
          this.editingCommentId.set(null);
          this.editForm.reset();
          // อัปเดต local
          const postId = (this.editForm as any).__postId;
          if (postId) {
            this.posts.update((posts) =>
              posts.map((p) => {
                if (p.id === postId) {
                  const updatedReplies = p.replies?.map((r) =>
                    r.id === commentId ? { ...r, content } : r
                  );
                  return { ...p, replies: updatedReplies };
                }
                return p;
              })
            );
          } else {
            // ถ้าเป็นโพสต์หลัก
            this.posts.update((posts) =>
              posts.map((p) => (p.id === commentId ? { ...p, content } : p))
            );
          }
        },
        error: (err) => {
          this.dialog.error('แก้ไขไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  deletePost(postId: string): void {
    this.dialog
      .confirm('ยืนยันการลบ', 'คุณต้องการลบโพสต์นี้ใช่หรือไม่?')
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteComment(postId).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'โพสต์ถูกลบแล้ว');
              this.posts.update((posts) => posts.filter((p) => p.id !== postId));
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        }
      });
  }

  deleteReply(postId: string, replyId: string): void {
    this.dialog
      .confirm('ยืนยันการลบ', 'คุณต้องการลบข้อความนี้ใช่หรือไม่?')
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteComment(replyId).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'ข้อความถูกลบแล้ว');
              this.posts.update((posts) =>
                posts.map((p) => {
                  if (p.id === postId) {
                    const updatedReplies = p.replies?.filter((r) => r.id !== replyId) || [];
                    return { ...p, replies: updatedReplies, replyCount: updatedReplies.length };
                  }
                  return p;
                })
              );
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/pmrt02']);
  }

  loadMore(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadPosts();
    }
  }

  // ตรวจสอบว่าเป็นเจ้าของ (ใช้ชื่อผู้ใช้)
  isAuthor(createdBy: string): boolean {
    // TODO: เปรียบเทียบกับ user id ของ current user (จาก AuthService)
    // ใช้ mock ชั่วคราว: สมมติว่า "สมชาย ใจดี" เป็นเจ้าของ (เพื่อทดสอบ)
    // ควรใช้ AuthService จริง
    return createdBy === 'สมชาย ใจดี' || createdBy === 'system';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}