// customer-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly CUSTOMER_KEY = 'customerState';
  private readonly PROJECT_KEY = 'projectState';

  private readonly customerId = signal<string | null>(null);
  private readonly customerName = signal<string>('');
  private readonly projectId = signal<string | null>(null);
  private readonly projectName = signal<string>('');

  constructor() {
    this.loadFromStorage();
  }

  setCustomer(id: string, name?: string): void {
    this.customerId.set(id);
    if (name) this.customerName.set(name);
    this.saveToStorage();
  }

  setProject(id: string, name?: string): void {
    this.projectId.set(id);
    if (name) this.projectName.set(name);
    this.saveToStorage();
  }

  getCustomerId(): string | null { return this.customerId(); }
  getCustomerName(): string { return this.customerName(); }
  getProjectId(): string | null { return this.projectId(); }
  getProjectName(): string { return this.projectName(); }

  clearCustomer(): void {
    this.customerId.set(null);
    this.customerName.set('');
    sessionStorage.removeItem(this.CUSTOMER_KEY);
  }

  clearProject(): void {
    this.projectId.set(null);
    this.projectName.set('');
    sessionStorage.removeItem(this.PROJECT_KEY);
  }

  clearAll(): void {
    this.clearCustomer();
    this.clearProject();
  }

  private saveToStorage(): void {
    sessionStorage.setItem(this.CUSTOMER_KEY, JSON.stringify({
      id: this.customerId(),
      name: this.customerName(),
    }));
    sessionStorage.setItem(this.PROJECT_KEY, JSON.stringify({
      id: this.projectId(),
      name: this.projectName(),
    }));
  }

  private loadFromStorage(): void {
    const customerRaw = sessionStorage.getItem(this.CUSTOMER_KEY);
    if (customerRaw) {
      try {
        const data = JSON.parse(customerRaw);
        this.customerId.set(data.id);
        this.customerName.set(data.name || '');
      } catch { /* ignore */ }
    }

    const projectRaw = sessionStorage.getItem(this.PROJECT_KEY);
    if (projectRaw) {
      try {
        const data = JSON.parse(projectRaw);
        this.projectId.set(data.id);
        this.projectName.set(data.name || '');
      } catch { /* ignore */ }
    }
  }
}