import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommunityService, CommunityPost, CommentItem } from '../../service/community.service';
import { CreatePostDialog } from './create-post-dialog/create-post-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: false,
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class CommunityPage implements OnInit {
  posts: CommunityPost[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  searchQuery: string = '';
  selectedSort: string = 'latest';

  // Comment state map: postId -> CommentItem[]
  commentsMap: { [postId: string]: CommentItem[] } = {};
  expandedComments: { [postId: string]: boolean } = {};
  newCommentText: { [postId: string]: string } = {};

  currentUserEmail: string = '';
  currentUserName: string = '';
  currentUserAvatar: string = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  constructor(
    private communityService: CommunityService,
    public dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserAuth();
    this.loadPosts();
  }

  checkUserAuth(): void {
    const savedUserJson = sessionStorage.getItem('Loggedinuser');
    if (savedUserJson) {
      try {
        const user = JSON.parse(savedUserJson);
        this.currentUserEmail = user.email || '';
        this.currentUserName = user.name || (user.email ? user.email.split('@')[0] : 'Demo User');
      } catch (e) {
        this.currentUserEmail = '';
      }
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserEmail;
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.communityService.getPosts(this.searchQuery, this.selectedSort).subscribe({
      next: (data) => {
        this.posts = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching community posts:', err);
        this.errorMessage = 'Failed to load community feed. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.loadPosts();
  }

  onSortChange(sortOption: string): void {
    this.selectedSort = sortOption;
    this.loadPosts();
  }

  openCreatePostDialog(postToEdit?: CommunityPost): void {
    if (!this.isLoggedIn()) {
      alert('Please log in to create a post!');
      return;
    }

    const dialogRef = this.dialog.open(CreatePostDialog, {
      width: '520px',
      data: { post: postToEdit }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  toggleLike(post: CommunityPost): void {
    if (!this.isLoggedIn()) {
      alert('Please log in to like posts!');
      return;
    }

    // Optimistic UI update
    const userEmail = this.currentUserEmail;
    const likedIdx = post.likedBy.indexOf(userEmail);
    if (likedIdx > -1) {
      post.likedBy.splice(likedIdx, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userEmail);
      post.likes += 1;
    }
    this.cdr.detectChanges();

    // Call backend API
    this.communityService.likePost(post._id).subscribe({
      next: (updatedPost) => {
        post.likes = updatedPost.likes;
        post.likedBy = updatedPost.likedBy;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error liking post:', err);
        this.loadPosts(); // revert on error
      }
    });
  }

  isLikedByCurrentUser(post: CommunityPost): boolean {
    return this.isLoggedIn() && post.likedBy.includes(this.currentUserEmail);
  }

  toggleComments(post: CommunityPost): void {
    const postId = post._id;
    this.expandedComments[postId] = !this.expandedComments[postId];

    if (this.expandedComments[postId] && !this.commentsMap[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: string): void {
    this.communityService.getComments(postId).subscribe({
      next: (comments) => {
        this.commentsMap[postId] = comments || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
      }
    });
  }

  submitComment(post: CommunityPost): void {
    if (!this.isLoggedIn()) {
      alert('Please log in to comment!');
      return;
    }

    const postId = post._id;
    const message = (this.newCommentText[postId] || '').trim();
    if (!message) return;

    this.communityService.createComment(postId, message, this.currentUserAvatar).subscribe({
      next: (newComment) => {
        if (!this.commentsMap[postId]) {
          this.commentsMap[postId] = [];
        }
        this.commentsMap[postId].push(newComment);
        post.commentCount += 1;
        this.newCommentText[postId] = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        alert('Failed to post comment.');
      }
    });
  }

  deleteComment(postId: string, commentId: string): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.communityService.deleteComment(commentId).subscribe({
      next: () => {
        if (this.commentsMap[postId]) {
          this.commentsMap[postId] = this.commentsMap[postId].filter(c => c._id !== commentId);
        }
        const post = this.posts.find(p => p._id === postId);
        if (post) {
          post.commentCount = Math.max(0, post.commentCount - 1);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
      }
    });
  }

  deletePost(post: CommunityPost): void {
    if (!confirm('Are you sure you want to delete this story?')) return;

    this.communityService.deletePost(post._id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p._id !== post._id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        alert('Failed to delete post.');
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
