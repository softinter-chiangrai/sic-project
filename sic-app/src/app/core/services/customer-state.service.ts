// customer-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly CUSTOMER_KEY = 'customerState';
  private readonly PROJECT_KEY = 'projectState';
  private readonly REQUIREMENT_KEY = 'requirementState'; // ✅ เพิ่ม

  private readonly customerId = signal<string | null>(null);
  private readonly customerName = signal<string>('');
  private readonly projectId = signal<string | null>(null);
  private readonly projectName = signal<string>('');
  private readonly requirementId = signal<string | null>(null);   // ✅ เพิ่ม
  private readonly requirementTitle = signal<string>('');        // ✅ เพิ่ม

  constructor() {
    this.loadFromStorage();
  }

  // ===== Customer =====
  setCustomer(id: string, name?: string): void {
    this.customerId.set(id);
    if (name) this.customerName.set(name);
    this.saveToStorage();
  }

  getCustomerId(): string | null { return this.customerId(); }
  getCustomerName(): string { return this.customerName(); }

  clearCustomer(): void {
    this.customerId.set(null);
    this.customerName.set('');
    sessionStorage.removeItem(this.CUSTOMER_KEY);
  }

  // ===== Project =====
  setProject(id: string, name?: string): void {
    this.projectId.set(id);
    if (name) this.projectName.set(name);
    this.saveToStorage();
  }

  getProjectId(): string | null { return this.projectId(); }
  getProjectName(): string { return this.projectName(); }

  clearProject(): void {
    this.projectId.set(null);
    this.projectName.set('');
    sessionStorage.removeItem(this.PROJECT_KEY);
  }

  // ===== Requirement =====
  setRequirement(id: string, title?: string): void {
    this.requirementId.set(id);
    if (title) this.requirementTitle.set(title);
    this.saveToStorage();
  }

  getRequirementId(): string | null { return this.requirementId(); }
  getRequirementTitle(): string { return this.requirementTitle(); }

  clearRequirement(): void {
    this.requirementId.set(null);
    this.requirementTitle.set('');
    sessionStorage.removeItem(this.REQUIREMENT_KEY);
  }

  // ===== Clear All =====
  clearAll(): void {
    this.clearCustomer();
    this.clearProject();
    this.clearRequirement();
  }

  // ===== Storage =====
  private saveToStorage(): void {
    sessionStorage.setItem(this.CUSTOMER_KEY, JSON.stringify({
      id: this.customerId(),
      name: this.customerName(),
    }));
    sessionStorage.setItem(this.PROJECT_KEY, JSON.stringify({
      id: this.projectId(),
      name: this.projectName(),
    }));
    sessionStorage.setItem(this.REQUIREMENT_KEY, JSON.stringify({
      id: this.requirementId(),
      title: this.requirementTitle(),
    }));
  }

  private loadFromStorage(): void {
    // Customer
    const customerRaw = sessionStorage.getItem(this.CUSTOMER_KEY);
    if (customerRaw) {
      try {
        const data = JSON.parse(customerRaw);
        this.customerId.set(data.id);
        this.customerName.set(data.name || '');
      } catch { /* ignore */ }
    }

    // Project
    const projectRaw = sessionStorage.getItem(this.PROJECT_KEY);
    if (projectRaw) {
      try {
        const data = JSON.parse(projectRaw);
        this.projectId.set(data.id);
        this.projectName.set(data.name || '');
      } catch { /* ignore */ }
    }

    // ✅ Requirement
    const requirementRaw = sessionStorage.getItem(this.REQUIREMENT_KEY);
    if (requirementRaw) {
      try {
        const data = JSON.parse(requirementRaw);
        this.requirementId.set(data.id);
        this.requirementTitle.set(data.title || '');
      } catch { /* ignore */ }
    }
  }
}