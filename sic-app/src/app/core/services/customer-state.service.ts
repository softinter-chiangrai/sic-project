// customer-state.service.ts
import { Injectable, computed, signal } from '@angular/core';

export interface SelectedProjectContext {
  id: string;
  projectName: string;
  projectCode?: string;
  customerId?: string;
  customerName?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly CUSTOMER_KEY = 'customerState';
  private readonly PROJECT_KEY = 'projectState';
  private readonly REQUIREMENT_KEY = 'requirementState';

  private readonly customerId = signal<string | null>(null);
  private readonly customerName = signal<string>('');
  private readonly projectId = signal<string | null>(null);
  private readonly projectName = signal<string>('');
  private readonly selectedProjects = signal<SelectedProjectContext[]>([]);
  private readonly requirementId = signal<string | null>(null);
  private readonly requirementTitle = signal<string>('');

  // Template subscriptions
  readonly currentCustomerId = this.customerId.asReadonly();
  readonly currentCustomerName = this.customerName.asReadonly();
  readonly currentProjectId = this.projectId.asReadonly();
  readonly currentProjectName = this.projectName.asReadonly();
  readonly currentSelectedProjects = this.selectedProjects.asReadonly();
  readonly currentSelectedProjectIds = computed(() => this.selectedProjects().map((p) => p.id));
  readonly selectedProjectCount = computed(() => this.selectedProjects().length);
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

  // ===== Project & Multi-project =====
  setProject(id: string, name?: string): void {
    this.projectId.set(id);
    if (name) this.projectName.set(name);
    if (id) {
      this.selectedProjects.set([{ id, projectName: name || id }]);
    } else {
      this.selectedProjects.set([]);
    }
  }

  setProjects(projects: SelectedProjectContext[]): void {
    this.selectedProjects.set(projects);
    if (projects.length === 1) {
      this.projectId.set(projects[0].id);
      this.projectName.set(projects[0].projectName);
      if (projects[0].customerId) {
        this.customerId.set(projects[0].customerId);
        if (projects[0].customerName) this.customerName.set(projects[0].customerName);
      }
    } else if (projects.length > 1) {
      this.projectId.set(projects[0].id);
      this.projectName.set(`${projects.length} โปรเจกต์`);
    } else {
      this.projectId.set(null);
      this.projectName.set('');
    }
  }

  toggleProject(project: SelectedProjectContext): void {
    const list = this.selectedProjects();
    const exists = list.some((p) => p.id === project.id);
    let updated: SelectedProjectContext[];
    if (exists) {
      updated = list.filter((p) => p.id !== project.id);
    } else {
      updated = [...list, project];
    }
    this.setProjects(updated);
  }

  isProjectSelected(id: string): boolean {
    return this.selectedProjects().some((p) => p.id === id);
  }

  getProjectId(): string | null { return this.projectId(); }
  getProjectName(): string { return this.projectName(); }
  getSelectedProjects(): SelectedProjectContext[] { return this.selectedProjects(); }
  getSelectedProjectIds(): string[] { return this.selectedProjects().map((p) => p.id); }

  clearProject(): void {
    this.projectId.set(null);
    this.projectName.set('');
    this.selectedProjects.set([]);
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
    if (projectId) {
      this.selectedProjects.set([{
        id: projectId,
        projectName: projectName || projectId,
        customerId,
        customerName,
      }]);
    } else {
      this.selectedProjects.set([]);
    }
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

