// src/app/feature/pm/dt/pmdt09/pmdt09.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SicSidebarService } from '../../../../core/component/sic-sidebar/sic-sidebar.service';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { SicInputUploadComponent } from '../../../../core/component/sic-input-upload/sic-input-upload.component';
import { Post, Reply } from './discussion.model';
import { DiscussionService } from './discussion.service';
import { Pmdt09AComponent } from './pmdt09A/pmdt09A.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-pmdt09',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicButtonComponent,
    SicInputAreaComponent,
    SicDatePipe,
    SicInputUploadComponent,
    Pmdt09AComponent,
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
  private authService = inject(AuthService);
  private sidebarService = inject(SicSidebarService);

  readonly apiBaseUrl = environment.apiBaseUrl;

  posts = signal<Post[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  projectId = signal<string | null>(null);
  expandedPostId = signal<string | null>(null);
  
  // Facebook Style Comment & Reply state
  editingCommentId = signal<string | null>(null);
  replyingPostId = signal<string | null>(null);
  replyToUser = signal<string | null>(null);

  // Dialog Pmdt09A Modal state
  isModalOpen = signal(false);
  postToEdit = signal<Post | null>(null);

  // User info
  currentUserId = signal<string | null>(null);
  currentUserName = signal<string>('ผู้ใช้งาน');
  currentUserAvatar = signal<string | null>(null);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  // Forms for replies and quick edit inline
  replyForm!: FormGroup;
  editForm!: FormGroup;

  ngOnInit(): void {
    // โหลดข้อมูลผู้ใช้จริง
    this.currentUserId.set(this.authService.getUserId());
    this.sidebarService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          const name = profile.name || profile.id || 'ผู้ใช้';
          this.currentUserName.set(name);
          if (profile.uploadGroupData && profile.uploadGroupData.length > 0 && profile.uploadGroupData[0].accessUrl) {
            this.currentUserAvatar.set(profile.uploadGroupData[0].accessUrl);
          }
        }
      },
      error: () => {},
    });

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
      error: () => {},
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

  // --- Dialog (Pmdt09A) Actions ---
  openCreateModal(): void {
    this.postToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(post: Post): void {
    this.postToEdit.set(post);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.postToEdit.set(null);
  }

  onPostSaved(savedPost: Post): void {
    this.closeModal();
    const existing = this.posts().find((p) => p.id === savedPost.id);
    if (existing) {
      // อัปเดตรายการเดิม
      this.posts.update((posts) =>
        posts.map((p) => (p.id === savedPost.id ? { ...p, ...savedPost } : p))
      );
    } else {
      // โพสต์ใหม่ เติม userAvatarUrl
      savedPost.userAvatarUrl = this.currentUserAvatar() || undefined;
      savedPost.createdByName = savedPost.createdByName || this.currentUserName();
      this.posts.update((posts) => [savedPost, ...posts]);
    }
  }

  // --- Reply & Comment Actions ---
  startReply(postId: string, replyToUser?: string): void {
    this.replyingPostId.set(postId);
    this.replyToUser.set(replyToUser || null);
    this.replyForm.reset({ content: replyToUser ? `@${replyToUser} ` : '', attachmentGroupId: null });
    
    // Auto expand
    if (this.expandedPostId() !== postId) {
      this.expandedPostId.set(postId);
      const post = this.posts().find((p) => p.id === postId);
      if (post && !post.replies) {
        this.loadReplies(postId);
      }
    }
  }

  cancelReply(): void {
    this.replyingPostId.set(null);
    this.replyToUser.set(null);
    this.replyForm.reset();
  }

  submitReply(): void {
    if (this.replyForm.invalid) {
      this.dialog.warn('กรุณาใส่ข้อความ', 'ต้องระบุข้อความในการตอบกลับ');
      return;
    }
    const postId = this.replyingPostId();
    if (!postId) return;

    this.isSubmitting.set(true);
    const formValue = this.replyForm.value;
    let attachmentGroupId: string | undefined = undefined;
    if (Array.isArray(formValue.attachmentGroupId) && formValue.attachmentGroupId.length > 0) {
      attachmentGroupId = formValue.attachmentGroupId[0]?.uploadGroupId || formValue.attachmentGroupId[0]?.id;
    } else if (typeof formValue.attachmentGroupId === 'string') {
      attachmentGroupId = formValue.attachmentGroupId;
    }

    const request = {
      postId: postId,
      content: formValue.content,
      attachmentGroupId: attachmentGroupId,
    };

    this.service
      .createReply(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newReply) => {
          this.dialog.success('ตอบกลับสำเร็จ', 'ข้อความของคุณถูกเพิ่มแล้ว');
          this.replyingPostId.set(null);
          this.replyToUser.set(null);
          this.replyForm.reset();
          
          if (!newReply.userAvatarUrl && this.currentUserAvatar()) {
            newReply.userAvatarUrl = this.currentUserAvatar() || undefined;
          }
          if (!newReply.createdByName) {
            newReply.createdByName = this.currentUserName();
          }

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

  startEditReply(postId: string, replyId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    const reply = post.replies?.find((r) => r.id === replyId);
    if (!reply) return;
    this.editingCommentId.set(replyId);
    this.editForm.patchValue({ content: reply.content });
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
      .updateComment(commentId, { content })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.dialog.success('แก้ไขสำเร็จ', 'ข้อความถูกอัปเดตแล้ว');
          this.editingCommentId.set(null);
          const postId = (this.editForm as any).__postId;
          this.editForm.reset();
          (this.editForm as any).__postId = null;

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
                    return { ...p, replies: updatedReplies, replyCount: Math.max(0, p.replyCount - 1) };
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

  // ตรวจสอบว่าเป็นเจ้าของโพสต์/ตอบกลับจริง
  isAuthor(createdBy: string): boolean {
    const currentId = this.currentUserId();
    if (currentId && createdBy === currentId) {
      return true;
    }
    return createdBy === this.currentUserName();
  }

  // แปลงรูป Avatar URL เป็น Full URL (ถ้าเป็น relative)
  getAvatarUrl(url?: string): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.apiBaseUrl}${url}`;
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