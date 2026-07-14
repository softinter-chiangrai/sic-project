// src/app/feature/pm/dt/pmdt06/pmdt06E/pmdt06E.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { DIAGRAM_DEFAULTS, type DiagramType } from '../diagram.model';
import { DiagramService } from '../diagram.service';

interface DiagramTypeInfo {
  type: DiagramType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-pmdt06e',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent],
  templateUrl: './pmdt06E.component.html',
  styleUrls: ['./pmdt06E.component.css'],
})
export class Pmdt06EComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private diagramService = inject(DiagramService);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);

  projectId = signal<string | null>(null);
  isLoading = signal(false);
  selectedType = signal<DiagramType | null>(null);

  diagramTypes: DiagramTypeInfo[] = [
    {
      type: 'Flowchart',
      label: 'Flowchart',
      icon: 'bi-diagram-2',
      description: 'แผนภาพการไหลของกระบวนการ',
      color: '#4A90D9',
    },
    {
      type: 'Sequence',
      label: 'Sequence Diagram',
      icon: 'bi-arrow-left-right',
      description: 'ลำดับการทำงานระหว่างวัตถุ',
      color: '#2ECC71',
    },
    {
      type: 'Class',
      label: 'Class Diagram',
      icon: 'bi-boxes',
      description: 'โครงสร้างคลาสและความสัมพันธ์',
      color: '#E67E22',
    },
    {
      type: 'ER',
      label: 'ER Diagram',
      icon: 'bi-table',
      description: 'ความสัมพันธ์ของข้อมูลในฐานข้อมูล',
      color: '#9B59B6',
    },
    {
      type: 'DFD',
      label: 'DFD',
      icon: 'bi-diagram-3',
      description: 'แผนภาพกระแสข้อมูล',
      color: '#1ABC9C',
    },
    {
      type: 'State',
      label: 'State Diagram',
      icon: 'bi-circle',
      description: 'สถานะและการเปลี่ยนแปลง',
      color: '#E74C3C',
    },
    {
      type: 'Journey',
      label: 'User Journey',
      icon: 'bi-map',
      description: 'เส้นทางของผู้ใช้งาน',
      color: '#F39C12',
    },
    {
      type: 'Mindmap',
      label: 'Mindmap',
      icon: 'bi-diagram-3',
      description: 'แผนภาพความคิด',
      color: '#3498DB',
    },
    {
      type: 'Timeline',
      label: 'Timeline',
      icon: 'bi-clock-history',
      description: 'ลำดับเหตุการณ์ตามเวลา',
      color: '#2C3E50',
    },
    {
      type: 'Requirement',
      label: 'Requirement Diagram',
      icon: 'bi-clipboard-check',
      description: 'ความต้องการและความสัมพันธ์',
      color: '#16A085',
    },
    {
      type: 'C4',
      label: 'C4 Model',
      icon: 'bi-layers',
      description: 'สถาปัตยกรรมซอฟต์แวร์ 4 มุมมอง',
      color: '#8E44AD',
    },
    {
      type: 'Git Graph',
      label: 'Git Graph',
      icon: 'bi-git',
      description: 'ประวัติการเปลี่ยนแปลง Git',
      color: '#E67E22',
    },
    {
      type: 'Pie',
      label: 'Pie Chart',
      icon: 'bi-pie-chart',
      description: 'แผนภูมิวงกลม',
      color: '#27AE60',
    },
    {
      type: 'Gantt',
      label: 'Gantt Chart',
      icon: 'bi-bar-chart',
      description: 'แผนภูมิกำหนดการโครงการ',
      color: '#2980B9',
    },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['projectId'] || this.customerState.getProjectId();
      if (projectId) {
        this.projectId.set(projectId);
      } else {
        this.dialog.warn('ไม่พบโครงการ', 'กรุณาเลือกโครงการก่อนสร้าง Diagram');
        this.navigation.navigate(['/feature/pm/pmrt02']);
      }
    });
  }

  createDiagram(type: DiagramType): void {
    const projectId = this.projectId();
    if (!projectId) {
      this.dialog.warn('ไม่พบโครงการ', 'กรุณาเลือกโครงการก่อน');
      return;
    }

    this.selectedType.set(type);
    this.isLoading.set(true);

    const name = `${type} Diagram`;
    const defaultScript = DIAGRAM_DEFAULTS[type] || 'graph TD\n  A[Start] --> B[Process]';

    this.diagramService
      .createTab(projectId, name, type, defaultScript)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tab) => {
          this.dialog.success('สร้าง Diagram สำเร็จ', `สร้าง Diagram "${name}" เรียบร้อย`);
          this.router.navigate(['/feature/pm/diagram'], {
            queryParams: {
              diagramId: tab.id,
              projectId: projectId,
            },
          });
        },
        error: (err) => {
          this.dialog.error('สร้าง Diagram ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  getIcon(type: DiagramType): string {
    const found = this.diagramTypes.find((t) => t.type === type);
    return found?.icon || 'bi-file-earmark';
  }

  getColor(type: DiagramType): string {
    const found = this.diagramTypes.find((t) => t.type === type);
    return found?.color || '#6C757D';
  }

  goBack(): void {
    this.navigation.navigate(['/feature/pm/pmrt03'], {
      queryParams: { projectId: this.projectId() },
    });
  }
}
