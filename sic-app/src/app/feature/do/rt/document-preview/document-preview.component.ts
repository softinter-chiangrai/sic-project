import { Component, Input, OnChanges, SimpleChanges, SecurityContext, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { DocumentService } from '../../services/document.service';
import * as XLSX from 'xlsx';
// @ts-ignore
import * as mammoth from 'mammoth';

type FileCategory = 'image' | 'pdf' | 'text' | 'word' | 'excel' | 'unknown';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.css']
})
export class DocumentPreviewComponent implements OnChanges {
  // Can be a local File object (during upload)
  @Input() file: File | null = null;
  // Or a remote document ID (for existing documents)
  @Input() documentId: string | null = null;
  // Used to extract extension if only ID is provided (needs to be passed from parent)
  @Input() fileName: string | null = null;

  fileCategory: FileCategory = 'unknown';
  previewUrl: SafeResourceUrl | null = null;
  textContent: string | null = null;
  htmlContent: SafeHtml | null = null;
  isLoading = false;
  error = '';

  private objectUrl: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['file'] || changes['documentId']) {
      this.generatePreview();
    }
  }

  private generatePreview(): void {
    this.cleanUp();
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    if (!this.file && !this.documentId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const name = this.file ? this.file.name : (this.fileName || '');
    this.fileCategory = this.determineCategory(name);

    if (this.file) {
      this.handleLocalFile(this.file);
    } else if (this.documentId) {
      this.handleRemoteFile(this.documentId);
    }
  }

  private determineCategory(filename: string): FileCategory {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['txt', 'md', 'csv', 'json'].includes(ext || '')) return 'text';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
    return 'unknown';
  }

  private handleLocalFile(file: File): void {
    if (this.fileCategory === 'image' || this.fileCategory === 'pdf') {
      this.objectUrl = URL.createObjectURL(file);
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
      this.isLoading = false;
      this.cdr.detectChanges();
    } else if (this.fileCategory === 'text') {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.textContent = e.target?.result as string;
        this.isLoading = false;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        this.error = 'Failed to read text file.';
        this.isLoading = false;
        this.cdr.detectChanges();
      };
      reader.readAsText(file);
    } else if (this.fileCategory === 'word' || this.fileCategory === 'excel') {
      this.processOfficeBlob(file);
    } else {
      // Unknown or unsupported files won't have a direct local preview
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private handleRemoteFile(id: string): void {
    // Instead of setting the URL directly on the iframe (which skips Angular's auth interceptors),
    // we fetch the file as a Blob through our service, then create a local Object URL.
    if (this.fileCategory === 'image' || this.fileCategory === 'pdf' || this.fileCategory === 'text' || this.fileCategory === 'word' || this.fileCategory === 'excel') {
      this.documentService.viewFileBlob(id).subscribe({
        next: (blob) => {
          if (this.fileCategory === 'text') {
            blob.text().then(text => {
              this.ngZone.run(() => {
                this.textContent = text;
                this.isLoading = false;
                this.cdr.detectChanges();
              });
            });
          } else if (this.fileCategory === 'word' || this.fileCategory === 'excel') {
            this.processOfficeBlob(blob);
          } else {
            this.objectUrl = URL.createObjectURL(blob);
            this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.error = 'Failed to load preview (Unauthorized or Not Found).';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async processOfficeBlob(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      let newHtmlContent: SafeHtml | null = null;
      
      if (this.fileCategory === 'word') {
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        newHtmlContent = this.sanitizer.bypassSecurityTrustHtml(result.value);
      } else if (this.fileCategory === 'excel') {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const html = XLSX.utils.sheet_to_html(worksheet);
        const styledHtml = `<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; }</style>` + html;
        newHtmlContent = this.sanitizer.bypassSecurityTrustHtml(styledHtml);
      }
      
      this.ngZone.run(() => {
        this.htmlContent = newHtmlContent;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      console.error('Error parsing office document:', err);
      this.ngZone.run(() => {
        this.error = 'Failed to parse office document for preview.';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  private cleanUp(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.previewUrl = null;
    this.textContent = null;
    this.htmlContent = null;
    this.fileCategory = 'unknown';
  }
}
