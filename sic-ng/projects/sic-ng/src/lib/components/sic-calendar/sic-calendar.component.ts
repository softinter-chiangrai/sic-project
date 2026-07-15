import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

interface SicCalendarCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'sic-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-calendar.component.html',
  styleUrl: './sic-calendar.component.css',
})
export class SicCalendarComponent {
  @Input() selected: Date | null = null;
  @Input() weekStartsOn: 0 | 1 = 1;

  @Output() selectedChange = new EventEmitter<Date>();

  @HostBinding('class.sic-calendar-host') readonly hostClass = true;

  viewDate = new Date();

  readonly weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  get monthLabel(): string {
    return this.viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  get orderedWeekdayLabels(): string[] {
    const labels = [...this.weekdayLabels];
    return [...labels.slice(this.weekStartsOn), ...labels.slice(0, this.weekStartsOn)];
  }

  get cells(): SicCalendarCell[] {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() - this.weekStartsOn + 7) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);
    const today = new Date();

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);

      return {
        date,
        inMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }

  isSelected(cell: SicCalendarCell): boolean {
    return !!this.selected && cell.date.toDateString() === this.selected.toDateString();
  }

  selectDate(cell: SicCalendarCell): void {
    this.selected = cell.date;
    this.selectedChange.emit(cell.date);
  }

  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
  }
}
