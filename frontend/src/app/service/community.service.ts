import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from '../config';

export interface CommunityPost {
  _id: string;
  author: string;
  authorEmail: string;
  authorAvatar?: string;
  title: string;
  content: string;
  images?: string[];
  likes: number;
  likedBy: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  postId: string;
  author: string;
  authorEmail: string;
  authorAvatar?: string;
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = `${url}community/`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let email = '';
    const loggedInUserJson = sessionStorage.getItem('Loggedinuser');
    if (loggedInUserJson) {
      try {
        const parsed = JSON.parse(loggedInUserJson);
        email = parsed.email || '';
      } catch (e) {
        email = '';
      }
    }
    if (!email) {
      email = 'demo@tedbus.com';
    }
    return new HttpHeaders({ 'x-user-email': email });
  }

  getPosts(search?: string, sort?: string): Observable<CommunityPost[]> {
    let params: any = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    return this.http.get<CommunityPost[]>(`${this.apiUrl}posts`, { params });
  }

  getPostById(id: string): Observable<CommunityPost> {
    return this.http.get<CommunityPost>(`${this.apiUrl}posts/${id}`);
  }

  createPost(postData: { title: string; content: string; images?: string[]; authorAvatar?: string }): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts`, postData, { headers: this.getAuthHeaders() });
  }

  updatePost(id: string, postData: { title?: string; content?: string; images?: string[] }): Observable<CommunityPost> {
    return this.http.put<CommunityPost>(`${this.apiUrl}posts/${id}`, postData, { headers: this.getAuthHeaders() });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}posts/${id}`, { headers: this.getAuthHeaders() });
  }

  likePost(id: string): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts/${id}/like`, {}, { headers: this.getAuthHeaders() });
  }

  getComments(postId: string): Observable<CommentItem[]> {
    return this.http.get<CommentItem[]>(`${this.apiUrl}posts/${postId}/comments`);
  }

  createComment(postId: string, message: string, authorAvatar?: string): Observable<CommentItem> {
    return this.http.post<CommentItem>(`${this.apiUrl}posts/${postId}/comments`, { message, authorAvatar }, { headers: this.getAuthHeaders() });
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}comments/${commentId}`, { headers: this.getAuthHeaders() });
  }
}
