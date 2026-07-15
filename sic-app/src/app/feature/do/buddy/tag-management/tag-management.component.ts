import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Tag } from '../../services/organization.service';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-management.component.html',
  styleUrls: ['./tag-management.component.css']
})
export class TagManagementComponent implements OnInit {
  items: Tag[] = [];
  isLoading = false;

  newName = '';
  newDescription = '';
  newColor = '#1E90FF';
  isCreating = false;
  createError = '';

  editingId: string | null = null;
  editName = '';
  editDescription = '';
  editColor = '';

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.orgService.getTags().subscribe({
      next: (res) => { this.items = res; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.isCreating = true;
    this.createError = '';
    this.orgService.createTag({ name: this.newName.trim(), description: this.newDescription.trim(), color_code: this.newColor }).subscribe({
      next: () => { this.newName = ''; this.newDescription = ''; this.newColor = '#1E90FF'; this.isCreating = false; this.load(); },
      error: (err) => { this.createError = err.message || 'Create failed'; this.isCreating = false; this.cdr.detectChanges(); }
    });
  }

  startEdit(item: Tag): void { this.editingId = item.id; this.editName = item.name; this.editDescription = item.description || ''; this.editColor = item.color_code; }

  saveEdit(item: Tag): void {
    this.orgService.updateTag(item.id, { name: this.editName, description: this.editDescription, color_code: this.editColor }).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: (err) => alert('Update failed: ' + err.message)
    });
  }

  cancelEdit(): void { this.editingId = null; }

  delete(item: Tag): void {
    if (!confirm(`Delete tag "${item.name}"?`)) return;
    this.orgService.deleteTag(item.id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Delete failed: ' + err.message)
    });
  }
}
