import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService, DocumentItem } from '../../services/document.service';
import { OrganizationService, Tag, Category } from '../../services/organization.service';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';

/**
 * @description
 * Screen: DOC_03 - Document Detail
 * This component shows the preview and metadata of a specific document, with actions to Download, Share, or Delete.
 */
@Component({
  selector: 'app-dort03',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentPreviewComponent],
  templateUrl: './dort03.component.html',
  styleUrls: ['./dort03.component.css']
})
export class Dort03Component implements OnInit {
  documentId: string = '';
  document: DocumentItem | null = null;
  isLoading = true;
  error = '';

  // Data
  tags: Tag[] = [];
  categories: Category[] = [];

  docDescription: string = '';
  isDescriptionDirty: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.documentId = params.get('id') || '';
      if (this.documentId) {
        this.loadDocumentData();
      }
    });

    this.orgService.getTags().subscribe({ next: t => { this.tags = t; this.cdr.detectChanges(); }, error: () => {} });
    this.orgService.getCategories().subscribe({ next: c => { this.categories = c; this.cdr.detectChanges(); }, error: () => {} });
  }

  loadDocumentData(): void {
    this.isLoading = true;
    this.error = '';
    
    this.documentService.getDocuments().subscribe({
      next: (res) => {
        const found = res.documents.find(d => d.id === this.documentId);
        if (found) {
          this.document = found;
          this.docDescription = found.description || '';
          this.isDescriptionDirty = false;
        } else {
          this.error = 'Document not found.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load document: ' + err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDescriptionChange(): void {
    this.isDescriptionDirty = this.docDescription !== (this.document?.description || '');
  }

  onSaveDescription(): void {
    if (!this.document) return;
    this.documentService.updateDocument(this.documentId, { description: this.docDescription }).subscribe({
      next: () => {
        this.document!.description = this.docDescription;
        this.isDescriptionDirty = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to save description: ' + err.message);
      }
    });
  }

  onDownload(): void {
    if (!this.documentId || !this.document) return;
    this.documentService.downloadFileBlob(this.documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document!.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        alert('Failed to download document. ' + err.message);
      }
    });
  }

  onShare(): void {
    alert('Share functionality placeholder');
  }

  onDelete(): void {
    if (!this.document || !confirm(`Are you sure you want to delete ${this.document.file_name}?`)) return;
    
    this.documentService.deleteDocument(this.documentId).subscribe({
      next: () => {
        this.router.navigate(['/feature/buddy/documents']);
      },
      error: (err) => {
        alert('Delete failed: ' + err.message);
      }
    });
  }
}
