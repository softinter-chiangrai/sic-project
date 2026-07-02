// core/services/customer-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly customerId = signal<string | null>(null);
  private readonly customerName = signal<string>('');

  setCustomer(id: string, name?: string): void {
    this.customerId.set(id);
    if (name) this.customerName.set(name);
  }

  getCustomerId(): string | null {
    return this.customerId();
  }

  getCustomerName(): string {
    return this.customerName();
  }

  clear(): void {
    this.customerId.set(null);
    this.customerName.set('');
  }
}