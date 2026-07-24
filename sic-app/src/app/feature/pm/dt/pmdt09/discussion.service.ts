import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreatePostRequest, CreateReplyRequest, Post, Reply, UpdateCommentRequest } from './discussion.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class DiscussionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/discussion';

  getPosts(projectId: string, page = 0, size = 10): Observable<PageResponse<Post>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Post>>(`${this.baseUrl}/project/${projectId}`, { params });
  }

  getReplies(postId: string): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.baseUrl}/post/${postId}/replies`);
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/post`, data);
  }

  createReply(data: CreateReplyRequest): Observable<Reply> {
    return this.http.post<Reply>(`${this.baseUrl}/reply`, data);
  }

  updateComment(commentId: string, data: UpdateCommentRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/comment/${commentId}`, data);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comment/${commentId}`);
  }
}