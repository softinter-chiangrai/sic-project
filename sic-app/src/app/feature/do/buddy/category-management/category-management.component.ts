import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Category } from '../../services/organization.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  items: Category[] = [];
  isLoading = false;

  // Create form
  newName = '';
  newDescription = '';
  newColor = '#1E90FF';
  isCreating = false;
  createError = '';

  // Edit state
  editingId: string | null = null;
  editName = '';
  editDescription = '';
  editColor = '';

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.orgService.getCategories().subscribe({
      next: (res) => { this.items = res; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.isCreating = true;
    this.createError = '';
    this.orgService.createCategory({ name: this.newName.trim(), description: this.newDescription.trim(), color_code: this.newColor }).subscribe({
      next: () => { this.newName = ''; this.newDescription = ''; this.newColor = '#1E90FF'; this.isCreating = false; this.load(); },
      error: (err) => { this.createError = err.message || 'Create failed'; this.isCreating = false; this.cdr.detectChanges(); }
    });
  }

  startEdit(item: Category): void {
    this.editingId = item.id;
    this.editName = item.name;
    this.editDescription = item.description || '';
    this.editColor = item.color_code;
  }

  saveEdit(item: Category): void {
    this.orgService.updateCategory(item.id, { name: this.editName, description: this.editDescription, color_code: this.editColor }).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: (err) => { alert('Update failed: ' + err.message); }
    });
  }

  cancelEdit(): void { this.editingId = null; }

  delete(item: Category): void {
    if (!confirm(`Delete category "${item.name}"?`)) return;
    this.orgService.deleteCategory(item.id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Delete failed: ' + err.message)
    });
  }
}
