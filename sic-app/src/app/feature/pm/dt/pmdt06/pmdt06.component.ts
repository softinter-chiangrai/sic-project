// src/app/features/pmdt06/pmdt06.component.ts
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Pmdt06AComponent } from './pmdt06A/pmdt06A.component';
import { DiagramService } from './diagram.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { DialogService } from '../../../../core/services/dialog.service';
import type { DiagramProject } from './diagram.model';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, Pmdt06AComponent],
  templateUrl: './pmdt06.component.html',
  styleUrls: ['./pmdt06.component.css']
})
export class Pmdt06Component implements OnInit, OnDestroy {
  private router = inject(Router);
  private diagramService = inject(DiagramService);
  private themeService = inject(ThemeService);
  private dialog = inject(DialogService);
  private destroy$ = new Subject<void>();

  currentProject = signal<DiagramProject | null>(null);
  isDark = signal(false);

  ngOnInit() {
    this.isDark.set(this.themeService.isDark());
    this.loadDefaultProject();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDefaultProject() {
    this.diagramService.getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          if (projects.length > 0) {
            const defaultProject = projects.find(p => p.isFavorite) || projects[0];
            this.currentProject.set(defaultProject);
            this.diagramService.getTabs(defaultProject.id).subscribe();
          } else {
            this.createFirstProject();
          }
        },
        error: () => {
          // Handle error
        }
      });
  }

  private createFirstProject() {
    this.dialog.confirm('Create Project', 'You don\'t have any project yet. Create one to get started?')
      .then(confirmed => {
        if (confirmed) {
          this.diagramService.createProject('My First Project', 'AI Diagram Studio')
            .subscribe({
              next: (project) => {
                this.currentProject.set(project);
                this.diagramService.getTabs(project.id).subscribe();
              }
            });
        }
      });
  }

  toggleTheme() {
    this.themeService.toggleDark();
    this.isDark.set(this.themeService.isDark());
  }

  goBack() {
    this.router.navigate(['/feature/dashboard']);
  }
}