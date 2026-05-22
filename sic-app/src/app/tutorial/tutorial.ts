import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../core/services/theme.service';

export type TutorialSection =
  | 'overview'
  | 'app-components'
  | 'app-cli'
  | 'app-page-form'
  | 'app-bilingual'
  | 'api-entity'
  | 'api-feature'
  | 'api-services'
  | 'api-utility'
  | 'gridpanel';

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

interface NavItem {
  id: TutorialSection;
  label: string;
}

@Component({
  selector: 'app-tutorial',
  imports: [CommonModule],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial {
  private readonly themeService = inject(ThemeService);

  readonly activeSection = signal<TutorialSection>('overview');
  readonly sidebarOpen = signal(true);
  readonly expandedGroups = signal<Set<string>>(new Set(['app', 'api']));

  readonly navGroups: NavGroup[] = [
    {
      label: 'sic-app',
      icon: 'bi-layers',
      items: [
        { id: 'app-components', label: 'Components' },
        { id: 'app-cli', label: 'CLI Commands' },
        { id: 'app-page-form', label: 'Page & Form Pattern' },
        { id: 'app-bilingual', label: 'Bilingual' },
      ],
    },
    {
      label: 'sic-api',
      icon: 'bi-server',
      items: [
        { id: 'api-entity', label: 'Entity & DbContext' },
        { id: 'api-feature', label: 'Feature & Controller' },
        { id: 'api-services', label: 'Services' },
        { id: 'api-utility', label: 'Utility' },
      ],
    },
    {
      label: 'GridPanel',
      icon: 'bi-grid-3x3',
      items: [{ id: 'gridpanel', label: 'sic-gridpanel' }],
    },
  ];

  navigate(section: TutorialSection): void {
    this.activeSection.set(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleGroup(label: string): void {
    const groups = new Set(this.expandedGroups());
    if (groups.has(label)) {
      groups.delete(label);
    } else {
      groups.add(label);
    }
    this.expandedGroups.set(groups);
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
