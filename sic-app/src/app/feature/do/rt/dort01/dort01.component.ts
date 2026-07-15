import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentItem } from '../../services/document.service';
import { OrganizationService, Tag, Category, Folder } from '../../services/organization.service';
import { RouterModule } from '@angular/router';

/**
 * @description
 * Screen: DOC_01 - Document Library (Management)
 * This component displays the folder navigation tree and existing documents list,
 * supporting folder creation, nested navigation, and global search.
 */
@Component({
  selector: 'app-dort01',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dort01.component.html',
  styleUrls: ['./dort01.component.css']
})
export class Dort01Component implements OnInit {
  documents: DocumentItem[] = [];
  folders: Folder[] = [];
  tags: Tag[] = [];
  categories: Category[] = [];
  
  // Navigation State
  currentFolderId: string | null = null;
  breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Home' }];
  
  // Displayed filtered items
  displayedFolders: Folder[] = [];
  displayedDocuments: DocumentItem[] = [];
  
  // Search & Filter State
  searchTerm = '';
  selectedCategoryName: string | null = null;
  selectedTagName: string | null = null;
  isSearching = false;

  isLoading = false;

  constructor(
    private documentService: DocumentService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Fetch documents, folders, tags, and categories
    this.documentService.getDocuments().subscribe({
      next: (docRes) => {
        this.documents = docRes.documents;
        this.orgService.getFolders().subscribe({
          next: (folderRes) => {
            this.folders = folderRes;
            
            this.orgService.getTags().subscribe({
              next: (tagRes) => {
                this.tags = tagRes;
                
                this.orgService.getCategories().subscribe({
                  next: (catRes) => {
                    this.categories = catRes;
                    this.isLoading = false;
                    this.updateDisplayedItems();
                    this.cdr.detectChanges();
                  },
                  error: () => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                  }
                });
              },
              error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateDisplayedItems(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const isFilteringActive = term !== '' || this.selectedCategoryName !== null || this.selectedTagName !== null;
    
    if (isFilteringActive) {
      this.isSearching = true;
      // Global flat search: folders match name term only (folders don't have tags or categories)
      if (term !== '') {
        this.displayedFolders = this.folders.filter(f => f.name.toLowerCase().includes(term));
      } else {
        this.displayedFolders = [];
      }
      
      this.displayedDocuments = this.documents.filter(d => {
        if (term !== '' && !d.file_name.toLowerCase().includes(term)) {
          return false;
        }
        if (this.selectedCategoryName !== null) {
          const plainCategories = this.extractSpans(d.category);
          if (!plainCategories.includes(this.selectedCategoryName)) {
            return false;
          }
        }
        if (this.selectedTagName !== null) {
          const plainTags = this.extractSpans(d.tags);
          if (!plainTags.includes(this.selectedTagName)) {
            return false;
          }
        }
        return true;
      });
    } else {
      this.isSearching = false;
      
      // Filter Folders: Show if parent matches currentFolderId, 
      // or if currentFolderId is null and parent is empty/missing from current folders list (prevent orphans)
      this.displayedFolders = this.folders.filter(f => {
        if (this.currentFolderId === null) {
          return !f.parent_id || !this.folders.some(active => active.id === f.parent_id);
        } else {
          return f.parent_id === this.currentFolderId;
        }
      });

      // Filter Documents: Show if currentFolderId matches,
      // or if currentFolderId is null and document is not in any active folders
      this.displayedDocuments = this.documents.filter(d => {
        const docFolderIds = d.folder_ids || [];
        if (this.currentFolderId === null) {
          return docFolderIds.length === 0 || !docFolderIds.some(fid => this.folders.some(active => active.id === fid));
        } else {
          return docFolderIds.includes(this.currentFolderId);
        }
      });
    }
  }

  navigateToFolder(folder: Folder): void {
    this.currentFolderId = folder.id;
    this.searchTerm = ''; // Clear search when navigating
    this.selectedCategoryName = null;
    this.selectedTagName = null;
    this.buildBreadcrumbs();
    this.updateDisplayedItems();
    this.cdr.detectChanges();
  }

  navigateToBreadcrumb(crumb: { id: string | null; name: string }): void {
    this.currentFolderId = crumb.id;
    this.searchTerm = '';
    this.selectedCategoryName = null;
    this.selectedTagName = null;
    this.buildBreadcrumbs();
    this.updateDisplayedItems();
    this.cdr.detectChanges();
  }

  navigateUp(): void {
    if (!this.currentFolderId) return;
    const currentFolder = this.folders.find(f => f.id === this.currentFolderId);
    const parentId = currentFolder?.parent_id || null;
    const parentFolder = parentId ? this.folders.find(f => f.id === parentId) : null;
    this.navigateToBreadcrumb({
      id: parentId,
      name: parentFolder?.name || 'Home'
    });
  }

  buildBreadcrumbs(): void {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Home' }];
    if (this.currentFolderId !== null) {
      const path: Folder[] = [];
      let currId: string | null = this.currentFolderId;
      const seen = new Set<string>();

      while (currId && !seen.has(currId)) {
        seen.add(currId);
        const folder = this.folders.find(f => f.id === currId);
        if (folder) {
          path.unshift(folder);
          currId = folder.parent_id || null;
        } else {
          break;
        }
      }

      for (const f of path) {
        crumbs.push({ id: f.id, name: f.name });
      }
    }
    this.breadcrumbs = crumbs;
  }

  createFolder(): void {
    const name = prompt('Enter new folder name:');
    if (!name || name.trim() === '') return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.orgService.createFolder({
      name: name.trim(),
      parent_id: this.currentFolderId || undefined,
      color_code: '#007bff'
    }).subscribe({
      next: (newFolder) => {
        this.folders.push(newFolder);
        this.isLoading = false;
        this.updateDisplayedItems();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to create folder: ' + (err.message || JSON.stringify(err)));
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteFolder(folder: Folder, event: Event): void {
    event.stopPropagation(); // Avoid triggering row navigation click
    if (!confirm(`Delete folder "${folder.name}"? Child items will bubble up to the root folder.`)) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.orgService.deleteFolder(folder.id).subscribe({
      next: () => {
        this.folders = this.folders.filter(f => f.id !== folder.id);
        this.isLoading = false;
        this.updateDisplayedItems();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to delete folder: ' + (err.message || JSON.stringify(err)));
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteDocument(doc: DocumentItem, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.isLoading = false;
        this.updateDisplayedItems();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Delete failed: ' + err.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategoryName = null;
    this.selectedTagName = null;
    this.updateDisplayedItems();
    this.cdr.detectChanges();
  }

  selectCategory(categoryName: string | null): void {
    this.selectedCategoryName = categoryName;
    this.updateDisplayedItems();
    this.cdr.detectChanges();
  }

  selectTag(tagName: string | null): void {
    this.selectedTagName = tagName;
    this.updateDisplayedItems();
    this.cdr.detectChanges();
  }

  extractSpans(html: string | undefined): string[] {
    if (!html) return [];
    const results: string[] = [];
    const regex = /<span[^>]*>([^<]+)<\/span>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push(match[1].trim());
    }
    return results;
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'status-success';
      case 'PROCESSING': return 'status-processing';
      case 'ERROR': return 'status-error';
      default: return 'status-unknown';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}
