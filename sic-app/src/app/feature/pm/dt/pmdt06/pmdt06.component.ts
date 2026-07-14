// src/app/feature/pm/dt/pmdt06/pmdt06.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { ThemeService } from '../../../../core/services/theme.service';
import type { DiagramProject } from './diagram.model';
import { DiagramService } from './diagram.service';
import { Pmdt06AComponent } from './pmdt06A/pmdt06A.component';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [CommonModule, Pmdt06AComponent],
  templateUrl: './pmdt06.component.html',
  styleUrls: ['./pmdt06.component.css'],
})
export class Pmdt06Component implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private diagramService = inject(DiagramService);
  private themeService = inject(ThemeService);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private destroy$ = new Subject<void>();

  currentProject = signal<DiagramProject | null>(null);
  isDark = signal(false);
  isLoading = signal(true);
  projectId = signal<string | null>(null);

  ngOnInit() {
    this.isDark.set(this.themeService.isDark());

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      let projectId = params['projectId'] || this.customerState.getProjectId();
      let projectName = params['projectName'] || this.customerState.getProjectName() || '';

      if (!projectId) {
        this.dialog.warn('กรุณาเลือกโครงการ', 'กรุณาเลือกโครงการก่อนเข้าหน้านี้').then(() => {
          this.router.navigate(['/feature/pm/pmrt02']);
        });
        return;
      }

      this.projectId.set(projectId);
      this.isLoading.set(true);

      // โหลด tabs เพื่อเช็คว่า projectId นี้มีอยู่จริง
      this.diagramService.getTabs(projectId).subscribe({
        next: (tabs) => {
          // ✅ ดึง projectName จาก response ถ้ามี
          const projectNameFromApi = tabs.length > 0 ? tabs[0].projectName : null;
          const finalProjectName = projectNameFromApi || projectName || 'โครงการ';

          this.currentProject.set({
            id: projectId,
            name: finalProjectName, // ← ใช้ค่าจาก API
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Load tabs error:', err);
          const msg = err.error?.message || err.message || 'ไม่พบโครงการนี้ในระบบ';
          this.dialog.error('ไม่พบโครงการ', msg).then(() => {
            this.router.navigate(['/feature/pm/pmrt02']);
          });
        },
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme() {
    this.themeService.toggleDark();
    this.isDark.set(this.themeService.isDark());
  }

  goBack() {
    const projectId = this.projectId();
    if (projectId) {
      this.router.navigate(['/feature/pm/pmrt03'], { queryParams: { projectId } });
    } else {
      this.router.navigate(['/feature/pm/pmrt02']);
    }
  }
}
