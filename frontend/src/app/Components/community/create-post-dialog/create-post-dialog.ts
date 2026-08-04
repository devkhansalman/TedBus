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
  isDragging: boolean = false;

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processImageFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processImageFile(input.files[0]);
    }
  }

  private processImageFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please drop a valid image file (PNG, JPG, WEBP, GIF, etc.).';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image size should be less than 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      this.errorMessage = '';
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageUrl = '';
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
