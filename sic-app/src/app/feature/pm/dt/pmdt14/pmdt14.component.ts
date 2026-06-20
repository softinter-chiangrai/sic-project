import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicInputAreaComponent } from '../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../core/component/sic-input/sic-input.component';
import type { CanComponentDeactivate } from '../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../core/services/dialog.service';

// ===== Model =====
export interface DiscussionPost {
  id: string;
  author: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  replies: DiscussionReply[];
  isEditing?: boolean;
}

export interface DiscussionReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isEditing?: boolean;
}

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt14Service {
  private mockPosts: DiscussionPost[] = [
    {
      id: '1',
      author: 'สมชาย ใจดี',
      content: 'ใครช่วยเช็ค API Create Customer ให้หน่อยครับ ตอนนี้ Test แล้ว Error กรณี Tax ID ซ้ำ',
      attachments: [],
      createdAt: '2024-02-20 09:00:00',
      replies: [
        {
          id: 'r1',
          author: 'สมหญิง รักเรียน',
          content: 'เดี๋ยวเช็คให้ครับ',
          createdAt: '2024-02-20 09:15:00',
        },
        {
          id: 'r2',
          author: 'วิชัย พัฒนาชัย',
          content: 'น่าจะเป็นที่ Validation ใน Backend ครับ',
          createdAt: '2024-02-20 09:30:00',
        },
      ],
    },
    {
      id: '2',
      author: 'มานี มีทรัพย์',
      content: 'Specification ของโมดูล Customer Management เสร็จแล้ว รบกวนช่วย Review หน่อยครับ',
      attachments: ['SPEC-001.pdf'],
      createdAt: '2024-02-21 10:00:00',
      replies: [],
    },
  ];

  getPosts(): Observable<DiscussionPost[]> {
    return of(this.mockPosts).pipe(delay(300));
  }

  addPost(post: any): Observable<DiscussionPost> {
    const newPost: DiscussionPost = {
      id: Date.now().toString(),
      author: 'สมชาย ใจดี', // TODO: inject AuthService
      content: post.content,
      attachments: post.attachments || [],
      createdAt: new Date().toISOString(),
      replies: [],
    };
    this.mockPosts.unshift(newPost);
    return of(newPost).pipe(delay(300));
  }

  updatePost(postId: string, content: string): Observable<DiscussionPost> {
    const post = this.mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    post.content = content;
    return of(post).pipe(delay(300));
  }

  deletePost(postId: string): Observable<boolean> {
    const index = this.mockPosts.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error('Post not found');
    this.mockPosts.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  addReply(postId: string, replyContent: string): Observable<DiscussionReply> {
    const post = this.mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const newReply: DiscussionReply = {
      id: 'r' + Date.now(),
      author: 'สมชาย ใจดี',
      content: replyContent,
      createdAt: new Date().toISOString(),
    };
    post.replies.unshift(newReply);
    return of(newReply).pipe(delay(300));
  }

  updateReply(postId: string, replyId: string, content: string): Observable<DiscussionReply> {
    const post = this.mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const reply = post.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error('Reply not found');
    reply.content = content;
    return of(reply).pipe(delay(300));
  }

  deleteReply(postId: string, replyId: string): Observable<boolean> {
    const post = this.mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const index = post.replies.findIndex((r) => r.id === replyId);
    if (index === -1) throw new Error('Reply not found');
    post.replies.splice(index, 1);
    return of(true).pipe(delay(300));
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt14',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicInputAreaComponent,
  ],
  templateUrl: './pmdt14.component.html',
  styles: [],
})
export class Pmdt14Component implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private service = inject(Pmdt14Service);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  posts = signal<DiscussionPost[]>([]);
  isLoading = signal(false);

  postForm!: FormGroup;
  replyForm!: FormGroup;
  editForm!: FormGroup;
  replyingTo = signal<string | null>(null);
  editingPost = signal<string | null>(null);
  editingReply = signal<{ postId: string; replyId: string } | null>(null);

  currentUser = 'สมชาย ใจดี'; // TODO: inject AuthService

  ngOnInit(): void {
    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(4000)]],
      attachments: [[]],
    });
    this.replyForm = this.fb.group({
      replyContent: ['', [Validators.required, Validators.maxLength(4000)]],
    });
    this.editForm = this.fb.group({
      editContent: ['', [Validators.required, Validators.maxLength(4000)]],
    });

    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.service.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err);
      },
    });
  }

  submitPost() {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    const data = this.postForm.value;
    this.service.addPost(data).subscribe({
      next: () => {
        this.postForm.reset();
        this.loadPosts();
        this.dialog.success('โพสต์สำเร็จ', 'ข้อความของคุณถูกเผยแพร่แล้ว');
      },
      error: (err) => {
        this.dialog.error('โพสต์ไม่สำเร็จ', err);
      },
    });
  }

  startEditPost(postId: string) {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    this.editingPost.set(postId);
    this.editForm.patchValue({ editContent: post.content });
  }

  cancelEditPost() {
    this.editingPost.set(null);
    this.editForm.reset();
  }

  submitEditPost(postId: string) {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const content = this.editForm.value.editContent;
    this.service.updatePost(postId, content).subscribe({
      next: () => {
        this.editingPost.set(null);
        this.editForm.reset();
        this.loadPosts();
        this.dialog.success('แก้ไขสำเร็จ', 'ข้อความถูกอัปเดตแล้ว');
      },
      error: (err) => {
        this.dialog.error('แก้ไขไม่สำเร็จ', err);
      },
    });
  }

  // ✅ ใช้ window.confirm แทน dialog.confirm เพื่อไม่ต้องแก้ translation
  deletePost(postId: string) {
    if (confirm('คุณต้องการลบโพสต์นี้ใช่หรือไม่?')) {
      this.service.deletePost(postId).subscribe({
        next: () => {
          this.loadPosts();
          this.dialog.success('ลบสำเร็จ', 'โพสต์ถูกลบแล้ว');
        },
        error: (err) => {
          this.dialog.error('ลบไม่สำเร็จ', err);
        },
      });
    }
  }

  startReply(postId: string) {
    this.replyingTo.set(postId);
    this.replyForm.reset();
  }

  cancelReply() {
    this.replyingTo.set(null);
  }

  submitReply(postId: string) {
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }
    const content = this.replyForm.value.replyContent;
    this.service.addReply(postId, content).subscribe({
      next: () => {
        this.replyForm.reset();
        this.replyingTo.set(null);
        this.loadPosts();
        this.dialog.success('ตอบกลับสำเร็จ', 'ข้อความของคุณถูกเพิ่มแล้ว');
      },
      error: (err) => {
        this.dialog.error('ตอบกลับไม่สำเร็จ', err);
      },
    });
  }

  startEditReply(postId: string, replyId: string) {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;
    const reply = post.replies.find((r) => r.id === replyId);
    if (!reply) return;
    this.editingReply.set({ postId, replyId });
    this.editForm.patchValue({ editContent: reply.content });
  }

  cancelEditReply() {
    this.editingReply.set(null);
    this.editForm.reset();
  }

  submitEditReply(postId: string, replyId: string) {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const content = this.editForm.value.editContent;
    this.service.updateReply(postId, replyId, content).subscribe({
      next: () => {
        this.editingReply.set(null);
        this.editForm.reset();
        this.loadPosts();
        this.dialog.success('แก้ไขสำเร็จ', 'ข้อความถูกอัปเดตแล้ว');
      },
      error: (err) => {
        this.dialog.error('แก้ไขไม่สำเร็จ', err);
      },
    });
  }

  // ✅ ใช้ window.confirm แทน
  deleteReply(postId: string, replyId: string) {
    if (confirm('คุณต้องการลบข้อความนี้ใช่หรือไม่?')) {
      this.service.deleteReply(postId, replyId).subscribe({
        next: () => {
          this.loadPosts();
          this.dialog.success('ลบสำเร็จ', 'ข้อความถูกลบแล้ว');
        },
        error: (err) => {
          this.dialog.error('ลบไม่สำเร็จ', err);
        },
      });
    }
  }

  isAuthor(author: string): boolean {
    return author === this.currentUser;
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  onBack(): void {
    this.router.navigate(['/feature/pm/task']);
  }

  pageDirty = () => false;
}

export default Pmdt14Component;