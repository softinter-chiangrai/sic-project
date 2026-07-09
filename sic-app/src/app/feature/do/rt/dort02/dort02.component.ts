import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { OrganizationService, Tag, Category, Folder } from '../../services/organization.service';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';

/**
 * @description
 * Screen: DOC_02 - Document Upload
 * This component provides the UI for selecting a file, setting its category/tags, and uploading it.
 */
@Component({
  selector: 'app-dort02',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentPreviewComponent],
  templateUrl: './dort02.component.html',
  styleUrls: ['./dort02.component.css']
})
export class Dort02Component implements OnInit {
  isUploading = false;
  uploadMessage = '';
  uploadError = '';

  // Upload context
  tags: Tag[] = [];
  categories: Category[] = [];
  folders: Folder[] = [];
  uploadFolderId = '';
  uploadCategoryId = '';
  uploadTagIds: string[] = [];
  
  description = '';
  
  selectedFile: File | null = null;
  
  constructor(
    private documentService: DocumentService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for query parameter from the main list screen
    this.route.queryParams.subscribe(params => {
      if (params['folderId']) {
        this.uploadFolderId = params['folderId'];
        this.cdr.detectChanges();
      }
    });

    this.orgService.getTags().subscribe({ next: t => { this.tags = t; this.cdr.detectChanges(); }, error: () => {} });
    this.orgService.getCategories().subscribe({ next: c => { this.categories = c; this.cdr.detectChanges(); }, error: () => {} });
    this.orgService.getFolders().subscribe({ next: f => { this.folders = f; this.cdr.detectChanges(); }, error: () => {} });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  doUpload(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.uploadMessage = '';
    this.uploadError = '';

    const tagIdsStr = Array.isArray(this.uploadTagIds) ? this.uploadTagIds.join(',') : this.uploadTagIds;

    this.documentService.uploadDocuments(
      [this.selectedFile],
      this.uploadFolderId || undefined,
      this.uploadCategoryId || undefined,
      tagIdsStr || undefined
    ).subscribe({
      next: (res: any) => {
        this.uploadMessage = res.message || 'File uploaded successfully.';
        this.isUploading = false;
        this.selectedFile = null;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/feature/buddy/documents']), 1500);
      },
      error: (err: any) => {
        this.uploadError = 'Upload failed: ' + (err.message || JSON.stringify(err));
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTagUpload(tagId: string): void {
    const idx = this.uploadTagIds.indexOf(tagId);
    if (idx === -1) this.uploadTagIds.push(tagId);
    else this.uploadTagIds.splice(idx, 1);
  }

  isTagUploadSelected(tagId: string): boolean {
    return this.uploadTagIds.includes(tagId);
  }
}
