import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommunityService, CommunityPost } from '../../../service/community.service';

@Component({
  selector: 'app-create-post-dialog',
  standalone: false,
  templateUrl: './create-post-dialog.html',
})
export class CreatePostDialog {
  title: string = '';
  content: string = '';
  imageUrl: string = '';
  isEditing: boolean = false;
  postId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreatePostDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { post?: CommunityPost },
    private communityService: CommunityService
  ) {
    if (data && data.post) {
      this.isEditing = true;
      this.postId = data.post._id;
      this.title = data.post.title;
      this.content = data.post.content;
      this.imageUrl = data.post.images && data.post.images.length > 0 ? data.post.images[0] : '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = 'Title and story content are required!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const images = this.imageUrl.trim() ? [this.imageUrl.trim()] : [];

    if (this.isEditing) {
      this.communityService.updatePost(this.postId, {
        title: this.title.trim(),
        content: this.content.trim(),
        images
      }).subscribe({
        next: (updatedPost) => {
          this.isLoading = false;
          this.dialogRef.close(updatedPost);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.error || 'Failed to update post. Please try again.';
        }
      });
    } else {
      this.communityService.createPost({
        title: this.title.trim(),
        content: this.content.trim(),
        images
      }).subscribe({
        next: (newPost) => {
          this.isLoading = false;
          this.dialogRef.close(newPost);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.error || 'Failed to create post. Please log in.';
        }
      });
    }
  }
}
