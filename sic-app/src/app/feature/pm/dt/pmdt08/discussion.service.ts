import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreatePostRequest, CreateReplyRequest, Post, Reply, UpdateCommentRequest } from './discussion.model';
import { ApiResponse } from './pmdt08.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';


@Injectable({ providedIn: 'root' })
export class DiscussionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/discussion';

  getPosts(projectId: string, page = 0, size = 10): Observable<PaginationResponse<Post>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginationResponse<Post>>(`${this.baseUrl}/project/${projectId}`, { params });
  }

  getReplies(postId: string): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.baseUrl}/post/${postId}/replies`);
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<ApiResponse<Post>>(`${this.baseUrl}/post`, data).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  createReply(data: CreateReplyRequest): Observable<Reply> {
    return this.http.post<ApiResponse<Reply>>(`${this.baseUrl}/reply`, data).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  updateComment(commentId: string, data: UpdateCommentRequest): Observable<Post> {
    return this.http.put<ApiResponse<Post>>(`${this.baseUrl}/comment/${commentId}`, data).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comment/${commentId}`);
  }
}