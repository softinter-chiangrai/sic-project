// src/app/core/component/sic-context-switcher/sic-context-switcher.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

import { CustomerStateService } from '../../services/customer-state.service';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';
import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';

@Component({
  selector: 'sic-context-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sic-context-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicContextSwitcherComponent {
  private readonly customerState = inject(CustomerStateService);
  private readonly projectService = inject(Pmrt02Service);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly currentProjectName = this.customerState.currentProjectName;
  readonly currentProjectId = this.customerState.currentProjectId;
  readonly currentCustomerName = this.customerState.currentCustomerName;

  readonly isOpen = signal(false);
  readonly keyword = signal('');
  readonly results = signal<PmCustomerProject[]>([]);
  readonly isLoading = signal(false);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((keyword) => {
          this.isLoading.set(true);
          return this.projectService.getProjects({ keyword, page: 0, size: 8 });
        }),
      )
      .subscribe({
        next: (res) => {
          this.results.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.results.set([]);
          this.isLoading.set(false);
        },
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.isOpen.set(true);
    this.keyword.set('');
    this.search$.next('');
  }

  close(): void {
    this.isOpen.set(false);
  }

  onKeywordChange(value: string): void {
    this.keyword.set(value);
    this.search$.next(value);
  }

  selectProject(project: PmCustomerProject): void {
    this.customerState.setContext(
      project.customerId,
      project.customerName,
      project.id,
      project.projectName,
    );
    this.close();
    this.router.navigate(['/feature/pm/project-dashboard'], {
      queryParams: { projectId: project.id },
    });
  }

  clearContext(event: Event): void {
    event.stopPropagation();
    this.customerState.clearProject();
    this.customerState.clearCustomer();
    this.close();
  }
}
