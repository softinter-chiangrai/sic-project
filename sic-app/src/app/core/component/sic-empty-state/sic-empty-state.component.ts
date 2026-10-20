import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sic-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sic-empty-state.component.html',
  styleUrl: './sic-empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicEmptyStateComponent {
  @Input() icon = 'bi bi-inbox';
  @Input() title = 'ไม่พบรายการข้อมูล';
  @Input() description = 'เริ่มต้นด้วยการสร้างรายการใหม่ หรือปรับเปลี่ยนตัวกรองค้นหา';
  @Input() actionLabel = '';
  @Input() actionIcon = 'bi bi-plus-lg';
  @Input() actionRouterLink?: string | any[];
  @Input() dashed = true;
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';

  @Output() action = new EventEmitter<void>();
}
