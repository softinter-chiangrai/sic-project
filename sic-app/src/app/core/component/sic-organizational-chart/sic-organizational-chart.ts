import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input as AngularInput,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SicOrganizationalChartNode } from './sic-organizational-chart.model';
import { DialogService } from '../../services/dialog.service';
import { FormsModule } from '@angular/forms';
import { SicButton } from '../sic-button/sic-button';
import { SicInput } from '../sic-input/sic-input';
import { SicColorpicker } from '../sic-colorpicker/sic-colorpicker';

type NodeEditPayload = {
  name_en: string;
  name_local: string;
  color: string;
};

@Component({
  selector: 'sic-organizational-chart-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicButton, SicInput, SicColorpicker],
  template: `
    <div
      class="w-[min(92vw,28rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl"
      style="border-color: var(--border);"
    >
      <div class="px-5 py-4 border-b" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)]">Edit Node</h3>
      </div>

      <div class="space-y-3 px-5 py-4">
        <sic-input
          label="name_en"
          [required]="true"
          [(ngModel)]="nameEn"
          [ngModelOptions]="{ standalone: true }"
        ></sic-input>

        <sic-input
          label="name_local"
          [required]="true"
          [(ngModel)]="nameLocal"
          [ngModelOptions]="{ standalone: true }"
        ></sic-input>

        <sic-colorpicker
          label="color"
          [required]="true"
          [(ngModel)]="color"
          [ngModelOptions]="{ standalone: true }"
        ></sic-colorpicker>
      </div>

      <div class="flex justify-end gap-2 border-t px-5 py-4" style="border-color: var(--border);">
        <sic-button variant="secondary" size="sm" (click)="cancel()">Cancel</sic-button>
        <sic-button variant="primary" size="sm" [disabled]="!canSave" (click)="save()">Save</sic-button>
      </div>
    </div>
  `,
})
export class SicOrganizationalChartEditDialog implements OnInit {
  @AngularInput({ required: true }) node!: SicOrganizationalChartNode;
  @AngularInput({ required: true }) onSave!: (payload: NodeEditPayload) => void;

  nameEn = '';
  nameLocal = '';
  color = '';

  constructor(private readonly dialogService: DialogService) {}

  ngOnInit(): void {
    this.nameEn = this.node.name_en;
    this.nameLocal = this.node.name_local;
    this.color = this.node.color;
  }

  get canSave(): boolean {
    return this.nameEn.trim().length > 0 && this.nameLocal.trim().length > 0 && this.color.trim().length > 0;
  }

  save(): void {
    if (!this.canSave) {
      return;
    }

    this.onSave({
      name_en: this.nameEn.trim(),
      name_local: this.nameLocal.trim(),
      color: this.color.trim(),
    });

    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}

@Component({
  selector: 'sic-organizational-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-organizational-chart.html',
  styleUrl: './sic-organizational-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicOrganizationalChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() root!: SicOrganizationalChartNode;
  @Output() nodeAdded = new EventEmitter<{ parentId: string; node: SicOrganizationalChartNode }>();
  @Output() nodeRemoved = new EventEmitter<{ parentId: string; nodeId: string }>();
  @Output() nodeUpdated = new EventEmitter<{ nodeId: string; node: SicOrganizationalChartNode }>();
  @Output() dataChanged = new EventEmitter<SicOrganizationalChartNode>();

  private resizeObserver?: ResizeObserver;
  private hasCenteredInitialScroll = false;
  private languageChangeSubscription: Subscription | null = null;
  private currentLanguage: 'th' | 'en' = 'en';
  private readonly isBrowser: boolean;

  constructor(
    private readonly hostElementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialogService: DialogService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.currentLanguage = this.resolveLanguage(this.translate.getCurrentLang());
    this.languageChangeSubscription = this.translate.onLangChange.subscribe(({ lang }) => {
      this.ngZone.run(() => {
        this.currentLanguage = this.resolveLanguage(lang);
        this.cdr.detectChanges();
      });
    });

    if (!this.isBrowser) {
      return;
    }

    this.scheduleConnectorLayout(true);

    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleConnectorLayout();
      });

      this.resizeObserver.observe(this.hostElementRef.nativeElement);
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.isBrowser) {
      return;
    }

    this.scheduleConnectorLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.languageChangeSubscription?.unsubscribe();
  }

  resolveNodeLabel(node: SicOrganizationalChartNode): string {
    if (this.currentLanguage === 'th') {
      const localLabel = node.name_local?.trim();
      return localLabel || node.name_en || '';
    }

    const englishLabel = node.name_en?.trim();
    return englishLabel || node.name_local || '';
  }

  addChild(parentNode: SicOrganizationalChartNode): void {
    const draftNode: SicOrganizationalChartNode = {
      id: this.generateId(),
      name_en: '',
      name_local: '',
      color: this.getRandomColor(),
      children: [],
    };

    this.dialogService.open({
      type: 'confirm',
      component: SicOrganizationalChartEditDialog,
      componentInputs: {
        node: draftNode,
        onSave: (payload: NodeEditPayload) => {
          const newChild: SicOrganizationalChartNode = {
            ...draftNode,
            name_en: payload.name_en,
            name_local: payload.name_local,
            color: payload.color,
          };
          parentNode.children.push(newChild);
          this.nodeAdded.emit({ parentId: parentNode.id, node: newChild });
          this.dataChanged.emit(this.root);
          this.scheduleConnectorLayout();
        },
      },
    });
  }

  removeChild(parentNode: SicOrganizationalChartNode, childId: string, childIndex: number): void {
    parentNode.children.splice(childIndex, 1);
    this.nodeRemoved.emit({ parentId: parentNode.id, nodeId: childId });
    this.dataChanged.emit(this.root);
    this.scheduleConnectorLayout();
  }

  editNode(node: SicOrganizationalChartNode): void {
    this.dialogService.open({
      type: 'confirm',
      component: SicOrganizationalChartEditDialog,
      componentInputs: {
        node,
        onSave: (payload: NodeEditPayload) => {
          this.updateNode(node, {
            name_local: payload.name_local,
            name_en: payload.name_en,
            color: payload.color,
          });
        },
      },
    });
  }

  updateNode(node: SicOrganizationalChartNode, updates: Partial<SicOrganizationalChartNode>): void {
    Object.assign(node, updates);
    this.nodeUpdated.emit({ nodeId: node.id, node });
    this.dataChanged.emit(this.root);
    this.scheduleConnectorLayout();
  }

  private scheduleConnectorLayout(centerScroll = false): void {
    if (!this.isBrowser) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.layoutHorizontalConnectors();
          if (centerScroll && !this.hasCenteredInitialScroll) {
            this.centerHorizontalScroll();
            this.hasCenteredInitialScroll = true;
          }
        });
      });
    });
  }

  private centerHorizontalScroll(): void {
    const host = this.hostElementRef.nativeElement;
    if (host.scrollWidth <= host.clientWidth) {
      return;
    }

    host.scrollLeft = (host.scrollWidth - host.clientWidth) / 2;
  }

  private layoutHorizontalConnectors(): void {
    const host = this.hostElementRef.nativeElement;
    const childrenContainers = host.querySelectorAll<HTMLElement>('.sic-organizational-chart__children');

    childrenContainers.forEach((childrenContainer) => {
      const horizontalConnector = childrenContainer.querySelector<HTMLElement>(':scope > .sic-organizational-chart__connector-horizontal');
      if (!horizontalConnector) {
        return;
      }

      const childNodes = childrenContainer.querySelectorAll<HTMLElement>(
        ':scope > .sic-organizational-chart__child-wrapper > .sic-organizational-chart__child-content > .sic-organizational-chart__node-container > .sic-organizational-chart__node-shell > .sic-organizational-chart__node',
      );

      if (childNodes.length < 2) {
        horizontalConnector.style.width = '0px';
        return;
      }

      const lineSizeRaw = getComputedStyle(host).getPropertyValue('--sic-organizational-line-size').trim();
      const lineSize = Number.parseFloat(lineSizeRaw) || 2;

      const containerRect = childrenContainer.getBoundingClientRect();
      const firstNodeRect = childNodes[0].getBoundingClientRect();
      const lastNodeRect = childNodes[childNodes.length - 1].getBoundingClientRect();

      const firstCenterX = firstNodeRect.left + firstNodeRect.width / 2 - containerRect.left;
      const lastCenterX = lastNodeRect.left + lastNodeRect.width / 2 - containerRect.left;

      horizontalConnector.style.left = `${firstCenterX - lineSize / 2}px`;
      horizontalConnector.style.width = `${lastCenterX - firstCenterX + lineSize}px`;
      horizontalConnector.style.transform = 'none';
    });
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private resolveLanguage(lang: string | null | undefined): 'th' | 'en' {
    const normalized = String(lang ?? '').toLowerCase();
    return normalized.startsWith('th') ? 'th' : 'en';
  }

  trackById = (_index: number, node: SicOrganizationalChartNode): string => node.id;
}
