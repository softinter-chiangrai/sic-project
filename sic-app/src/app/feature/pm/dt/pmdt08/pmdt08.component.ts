// src/app/feature/pm/dt/pmdt09/pmdt09.component.ts
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SicSidebarService } from '../../../../core/component/sic-sidebar/sic-sidebar.service';
import { SicButtonComponent } from 'sic-ng';
import { SicInputAreaComponent } from 'sic-ng';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { Post, Reply } from './discussion.model';
import { DiscussionService } from './discussion.service';
import { Pmdt08AComponent } from './pmdt08A/pmdt08A.component';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SicInputUploadComponent } from '../../../../core/component/sic-input-upload/sic-input-upload.component';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { AttachmentFile, Pmdt08PageData } from './pmdt08.model';

@Component({
  selector: 'app-pmdt08',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicButtonComponent,
    SicInputAreaComponent,
    SicDatePipe,
    Pmdt08AComponent,
    SicInputUploadComponent,
    TranslateModule,
  ],
  templateUrl: './pmdt08.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pmdt08.component.css'],
})
export class Pmdt08Component implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DiscussionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private authService = inject(AuthService);
  private sidebarService = inject(SicSidebarService);
  private http = inject(HttpClient);
  private customerState = inject(CustomerStateService);
  private translate = inject(TranslateService);

  readonly apiBaseUrl = environment.apiBaseUrl;

  posts = signal<Post[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  projectId = signal<string | null>(null);
  expandedPostId = signal<string | null>(null);

  editingCommentId = signal<string | null>(null);
  replyingPostId = signal<string | null>(null);
  replyToUser = signal<string | null>(null);

  isModalOpen = signal(false);
  postToEdit = signal<Post | null>(null);

  currentUserId = signal<string | null>(null);
  currentUserName = signal<string>(this.translate.instant('PMDT08_DEFAULT_USER_NAME'));
  currentUserAvatar = signal<string | null>(null);

  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  // ฟอร์มสำหรับแสดงความคิดเห็น (comment) – ใช้เมื่อกด "แสดงความคิดเห็น"
  commentForm!: FormGroup;
  // ฟอร์มสำหรับตอบกลับ (reply) – ใช้เมื่อกด "ตอบกลับ" ข้างใต้ comment
  replyForm!: FormGroup;
  editForm!: FormGroup;

  // Cache for attachments (key = groupId)
  private attachmentCache = new Map<string, AttachmentFile[]>();

  // guards against re-fetching on the first (synchronous) queryParams emission,
  // since that initial value was already preloaded by pmdt08Resolver
  private hasConsumedResolverData = false;

  ngOnInit(): void {
    this.currentUserId.set(this.authService.getUserId());
    this.sidebarService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          const name = profile.name || profile.id || this.translate.instant('PMDT08_DEFAULT_USER_NAME_SHORT');
          this.currentUserName.set(name);
          if (profile.uploadGroupData && profile.uploadGroupData.length > 0 && profile.uploadGroupData[0].accessUrl) {
            this.currentUserAvatar.set(profile.uploadGroupData[0].accessUrl);
          }
        }
      },
      error: () => {},
    });

    // ฟอร์มสำหรับแสดงความคิดเห็น (comment)
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      attachmentGroupId: [null],
    });

    // ฟอร์มสำหรับตอบกลับ (reply) – ใช้เมื่อกด "ตอบกลับ" ข้างใต้ comment
    this.replyForm = this.fb.group({
      content: ['', Validators.required],
      attachmentGroupId: [null],
    });

    this.editForm = this.fb.group({
      content: ['', Validators.required],
    });

    // Seed initial state from the resolver (preloaded first page of posts) instead of
    // fetching again here.
    const pageData: Pmdt08PageData = this.route.snapshot.data['pageData'];
    if (pageData?.projectId) {
      this.projectId.set(pageData.projectId);
      this.posts.set(pageData.posts || []);
      this.totalElements.set(pageData.totalElements || 0);
      this.totalPages.set(pageData.totalPages || 0);
      this.posts().forEach((post) => {
        if (post.attachmentGroupId) {
          this.loadAttachments(post.attachmentGroupId);
        }
      });
      this.hasConsumedResolverData = true;
    }

    // ดึง projectId จาก queryParams (รองรับกรณีเปลี่ยน projectId โดยไม่ reload route)
    this.route.queryParams.subscribe((params) => {
      const pId = params['projectId'] || params['id'] || null;
      if (pId && pId === this.projectId() && this.hasConsumedResolverData) {
        // first emission already satisfied by the resolver, skip duplicate fetch
        this.hasConsumedResolverData = false;
        return;
      }
      if (pId) {
        this.projectId.set(pId);
        this.currentPage.set(0);
        this.loadPosts();
      }
    });

    this.route.params.subscribe((params) => {
      const pId = params['projectId'] || params['id'];
      if (pId && !this.projectId()) {
        this.projectId.set(pId);
        this.loadPosts();
      }
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
          this.posts.set(response.data || []);
          this.totalElements.set(response.pageable?.totalElements || 0);
          this.totalPages.set(response.pageable?.totalPages || 0);
          // Preload attachments
          this.posts().forEach(post => {
            if (post.attachmentGroupId) {
              this.loadAttachments(post.attachmentGroupId);
            }
          });
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('PMDT08_LOAD_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
        },
      });
  }

  // ===== Load attachments with Authorization header =====
  loadAttachments(groupId: string): void {
    if (this.attachmentCache.has(groupId)) return;

    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http
      .get<AttachmentFile[]>(`${this.apiBaseUrl}/api/storage/group/${groupId}`, { headers })
      .subscribe({
        next: (files) => {
          this.attachmentCache.set(groupId, files);
        },
        error: (err) => {
          console.error('Failed to load attachments:', err);
          // fallback without token
          this.http
            .get<AttachmentFile[]>(`${this.apiBaseUrl}/api/storage/group/${groupId}`)
            .subscribe({
              next: (files) => this.attachmentCache.set(groupId, files),
              error: () => this.attachmentCache.set(groupId, []),
            });
        },
      });
  }

  // ===== Get attachments from cache =====
  getAttachments(groupId: string): AttachmentFile[] {
    return this.attachmentCache.get(groupId) || [];
  }

  // ===== File type helpers =====
  isImage(file: AttachmentFile): boolean {
    return file.contentType?.startsWith('image/') ?? false;
  }

  isVideo(file: AttachmentFile): boolean {
    return file.contentType?.startsWith('video/') ?? false;
  }

  isAudio(file: AttachmentFile): boolean {
    return file.contentType?.startsWith('audio/') ?? false;
  }

  isPdf(file: AttachmentFile): boolean {
    return file.contentType === 'application/pdf' || file.fileName?.endsWith('.pdf');
  }

  isWord(file: AttachmentFile): boolean {
    return file.contentType?.includes('word') || file.fileName?.match(/\.(doc|docx)$/i) !== null;
  }

  isExcel(file: AttachmentFile): boolean {
    return file.contentType?.includes('excel') || file.fileName?.match(/\.(xls|xlsx)$/i) !== null;
  }

  isPowerPoint(file: AttachmentFile): boolean {
    return file.contentType?.includes('powerpoint') || file.fileName?.match(/\.(ppt|pptx)$/i) !== null;
  }

  isOtherDocument(file: AttachmentFile): boolean {
    return !this.isImage(file) && !this.isVideo(file) && !this.isAudio(file) &&
           !this.isPdf(file) && !this.isWord(file) && !this.isExcel(file) && !this.isPowerPoint(file);
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  previewFile(file: AttachmentFile): void {
    if (this.isImage(file) || this.isVideo(file)) {
      window.open(file.accessUrl, '_blank');
    }
  }

  downloadFile(url: string, fileName?: string): void {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ===== Load Replies =====
  loadReplies(postId: string): void {
    this.service.getReplies(postId).subscribe({
      next: (replies) => {
        // โหลดไฟล์แนบของ reply ทุกอันที่มี attachmentGroupId
        replies.forEach(reply => {
          if (reply.attachmentGroupId) {
            this.loadAttachments(reply.attachmentGroupId);
          }
        });
        this.posts.update((posts) =>
          posts.map((p) => (p.id === postId ? { ...p, replies: replies || [], replyCount: (replies || []).length } : p))
        );
      },
      error: () => {},
    });
  }

  // ===== Toggle Expand =====
  toggleExpand(postId: string): void {
    if (this.expandedPostId() === postId) {
      this.expandedPostId.set(null);
    } else {
      this.expandedPostId.set(postId);
      this.loadReplies(postId);
    }
  }

  // ===== Dialog Actions =====
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
    this.currentPage.set(0);
    this.loadPosts();
  }

  // ===== ฟังก์ชันสำหรับแสดงความคิดเห็น (comment) – ใช้ expandedPostId =====
  submitComment(): void {
    this.commentForm.updateValueAndValidity();
    this.commentForm.markAllAsTouched();

    if (this.commentForm.invalid) {
      this.dialog.warn(this.translate.instant('PMDT08_PLEASE_ENTER_TEXT_TITLE'), this.translate.instant('PMDT08_COMMENT_TEXT_REQUIRED_MSG'));
      return;
    }

    const postId = this.expandedPostId();
    if (!postId) {
      this.dialog.warn(this.translate.instant('PMDT08_POST_NOT_FOUND_TITLE'), this.translate.instant('PMDT08_SELECT_POST_COMMENT_MSG'));
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.commentForm.value;
    let attachmentGroupId: string | undefined = undefined;

    if (Array.isArray(formValue.attachmentGroupId) && formValue.attachmentGroupId.length > 0) {
      const first = formValue.attachmentGroupId[0];
      attachmentGroupId = first?.uploadGroupId || first?.id || null;
    } else if (typeof formValue.attachmentGroupId === 'string') {
      attachmentGroupId = formValue.attachmentGroupId;
    } else if (formValue.attachmentGroupId && typeof formValue.attachmentGroupId === 'object') {
      attachmentGroupId = formValue.attachmentGroupId.uploadGroupId || formValue.attachmentGroupId.id || null;
    }

    const request = {
      postId: postId,
      content: formValue.content?.trim() || '',
      attachmentGroupId: attachmentGroupId,
    };

    this.service
      .createReply(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newReply) => {
          this.dialog.success(this.translate.instant('PMDT08_COMMENT_SUCCESS_TITLE'), this.translate.instant('PMDT08_MESSAGE_ADDED_MSG'));
          this.commentForm.reset({ content: '', attachmentGroupId: null });
          if (newReply?.attachmentGroupId) {
            this.loadAttachments(newReply.attachmentGroupId);
          }
          this.loadReplies(postId);
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('PMDT08_COMMENT_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
        },
      });
  }

  // ===== ฟังก์ชันสำหรับตอบกลับ (reply) – ใช้ replyingPostId =====
  submitReply(): void {
    this.replyForm.updateValueAndValidity();
    this.replyForm.markAllAsTouched();

    if (this.replyForm.invalid) {
      this.dialog.warn(this.translate.instant('PMDT08_PLEASE_ENTER_TEXT_TITLE'), this.translate.instant('PMDT08_REPLY_TEXT_REQUIRED_MSG'));
      return;
    }

    const postId = this.replyingPostId();
    if (!postId) {
      this.dialog.warn(this.translate.instant('PMDT08_POST_NOT_FOUND_TITLE'), this.translate.instant('PMDT08_SELECT_POST_REPLY_MSG'));
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.replyForm.value;
    let attachmentGroupId: string | undefined = undefined;

    if (Array.isArray(formValue.attachmentGroupId) && formValue.attachmentGroupId.length > 0) {
      const first = formValue.attachmentGroupId[0];
      attachmentGroupId = first?.uploadGroupId || first?.id || null;
    } else if (typeof formValue.attachmentGroupId === 'string') {
      attachmentGroupId = formValue.attachmentGroupId;
    } else if (formValue.attachmentGroupId && typeof formValue.attachmentGroupId === 'object') {
      attachmentGroupId = formValue.attachmentGroupId.uploadGroupId || formValue.attachmentGroupId.id || null;
    }

    const request = {
      postId: postId,
      content: formValue.content?.trim() || '',
      attachmentGroupId: attachmentGroupId,
    };

    this.service
      .createReply(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newReply) => {
          this.dialog.success(this.translate.instant('PMDT08_REPLY_SUCCESS_TITLE'), this.translate.instant('PMDT08_MESSAGE_ADDED_MSG'));
          this.replyingPostId.set(null);
          this.replyToUser.set(null);
          this.replyForm.reset({ content: '', attachmentGroupId: null });
          if (newReply?.attachmentGroupId) {
            this.loadAttachments(newReply.attachmentGroupId);
          }
          this.loadReplies(postId);
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('PMDT08_REPLY_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
        },
      });
  }

  // ===== ฟังก์ชันสำหรับเริ่มตอบกลับ (reply) =====
  startReply(postId: string, replyToUser?: string): void {
    this.replyingPostId.set(postId);
    this.replyToUser.set(replyToUser || null);
    this.replyForm.reset({ content: replyToUser ? `@${replyToUser} ` : '', attachmentGroupId: null });
    // ถ้ายังไม่ได้ขยายโพสต์ ให้ขยายอัตโนมัติ
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

  // ===== Edit Reply =====
  startEditReply(postId: string, replyId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    const reply = post.replies?.find((r: Reply) => r.id === replyId);
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
      this.dialog.warn(this.translate.instant('PMDT08_PLEASE_ENTER_TEXT_TITLE'), this.translate.instant('PMDT08_TEXT_REQUIRED_MSG'));
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
          this.dialog.success(this.translate.instant('PMDT08_EDIT_SUCCESS_TITLE'), this.translate.instant('PMDT08_MESSAGE_UPDATED_MSG'));
          this.editingCommentId.set(null);
          const postId = (this.editForm as any).__postId;
          this.editForm.reset();
          (this.editForm as any).__postId = null;
          if (postId) {
            this.posts.update((posts) =>
              posts.map((p) => {
                if (p.id === postId) {
                  const updatedReplies = p.replies?.map((r: Reply) =>
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
          this.dialog.error(this.translate.instant('PMDT08_EDIT_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
        },
      });
  }

  // ===== Delete =====
  deletePost(postId: string): void {
    this.dialog
      .confirm(this.translate.instant('PMDT08_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT08_CONFIRM_DELETE_POST_MSG'))
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteComment(postId).subscribe({
            next: () => {
              this.dialog.success(this.translate.instant('PMDT08_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT08_POST_DELETED_MSG'));
              this.posts.update((posts) => posts.filter((p) => p.id !== postId));
            },
            error: (err) => {
              this.dialog.error(this.translate.instant('PMDT08_DELETE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
            },
          });
        }
      });
  }

  deleteReply(postId: string, replyId: string): void {
    this.dialog
      .confirm(this.translate.instant('PMDT08_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT08_CONFIRM_DELETE_MSG_MSG'))
      .then((confirmed) => {
        if (confirmed) {
          this.service.deleteComment(replyId).subscribe({
            next: () => {
              this.dialog.success(this.translate.instant('PMDT08_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT08_MESSAGE_DELETED_MSG'));
              this.posts.update((posts) =>
                posts.map((p) => {
                  if (p.id === postId) {
                    const updatedReplies = p.replies?.filter((r: Reply) => r.id !== replyId) || [];
                    return { ...p, replies: updatedReplies, replyCount: Math.max(0, p.replyCount - 1) };
                  }
                  return p;
                })
              );
            },
            error: (err) => {
              this.dialog.error(this.translate.instant('PMDT08_DELETE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMDT08_GENERIC_ERROR_MSG'));
            },
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/project']);
  }

  loadMore(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadPosts();
    }
  }

  isAuthor(createdBy: string): boolean {
    const currentId = this.currentUserId();
    if (currentId && createdBy === currentId) {
      return true;
    }
    return createdBy === this.currentUserName();
  }

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
