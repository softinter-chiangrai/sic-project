import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, HostBinding, Input, QueryList } from '@angular/core';
import { SicCollapseComponent } from '../sic-collapse/sic-collapse.component';

/**
 * Coordinates a set of projected <sic-collapse> children so only one stays
 * open at a time, unless `multi` is set.
 */
@Component({
  selector: 'sic-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content select="sic-collapse"></ng-content>`,
  styleUrl: './sic-accordion.component.css',
})
export class SicAccordionComponent implements AfterContentInit {
  @Input() multi = false;

  @ContentChildren(SicCollapseComponent) panels!: QueryList<SicCollapseComponent>;

  @HostBinding('class.sic-accordion-host') readonly hostClass = true;

  ngAfterContentInit(): void {
    this.panels.forEach((panel) => {
      panel.expandedChange.subscribe((expanded) => {
        if (expanded && !this.multi) {
          this.panels.filter((p) => p !== panel).forEach((p) => (p.expanded = false));
        }
      });
    });
  }
}
