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

  // Template ที่ subscribe การเปลี่ยนแปลง context ได้โดยตรง (Global Context Switcher เป็นต้น)
  readonly currentCustomerId = this.customerId.asReadonly();
  readonly currentCustomerName = this.customerName.asReadonly();
  readonly currentProjectId = this.projectId.asReadonly();
  readonly currentProjectName = this.projectName.asReadonly();
  readonly currentRequirementId = this.requirementId.asReadonly();
  readonly currentRequirementTitle = this.requirementTitle.asReadonly();

  constructor() {
    this.cleanupStorage();
  }

  // ===== Customer =====
  setCustomer(id: string, name?: string): void {
    this.customerId.set(id);
    if (name) this.customerName.set(name);
  }

  getCustomerId(): string | null { return this.customerId(); }
  getCustomerName(): string { return this.customerName(); }

  clearCustomer(): void {
    this.customerId.set(null);
    this.customerName.set('');
  }

  // ===== Project =====
  setProject(id: string, name?: string): void {
    this.projectId.set(id);
    if (name) this.projectName.set(name);
  }

  getProjectId(): string | null { return this.projectId(); }
  getProjectName(): string { return this.projectName(); }

  clearProject(): void {
    this.projectId.set(null);
    this.projectName.set('');
  }

  // ===== Requirement =====
  setRequirement(id: string, title?: string): void {
    this.requirementId.set(id);
    if (title) this.requirementTitle.set(title);
  }

  getRequirementId(): string | null { return this.requirementId(); }
  getRequirementTitle(): string { return this.requirementTitle(); }

  clearRequirement(): void {
    this.requirementId.set(null);
    this.requirementTitle.set('');
  }

  // ===== Context (customer + project พร้อมกันใน call เดียว) =====
  setContext(customerId: string, customerName: string | undefined, projectId: string, projectName?: string): void {
    this.customerId.set(customerId);
    if (customerName) this.customerName.set(customerName);
    this.projectId.set(projectId);
    if (projectName) this.projectName.set(projectName);
  }

  // ===== Clear All =====
  clearAll(): void {
    this.clearCustomer();
    this.clearProject();
    this.clearRequirement();
    this.cleanupStorage();
  }

  private cleanupStorage(): void {
    try {
      localStorage.removeItem(this.CUSTOMER_KEY);
      localStorage.removeItem(this.PROJECT_KEY);
      localStorage.removeItem(this.REQUIREMENT_KEY);
    } catch { /* ignore */ }
  }
}
