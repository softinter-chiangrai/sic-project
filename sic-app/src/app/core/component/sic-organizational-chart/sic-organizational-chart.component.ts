import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Input as AngularInput,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DialogService } from '../../services/dialog.service';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicColorpickerComponent } from '../sic-colorpicker/sic-colorpicker.component';
import { SicInputComponent } from '../sic-input/sic-input.component';
import { SicOrganizationalChartNode } from './sic-organizational-chart.model';

type NodeEditPayload = {
  roleCode: string; // ✅ เพิ่มบรรทัดนี้
  nameEn: string;
  nameLocal: string;
  color: string;
};

@Component({
  selector: 'sic-organizational-chart-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SicButtonComponent,
    SicInputComponent,
    SicColorpickerComponent,
  ],
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
          label="role_code"
          [required]="true"
          [(ngModel)]="roleCode"
          [ngModelOptions]="{ standalone: true }"
          placeholder="ADMIN, PM, DEV"
        ></sic-input>
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
        <sic-button variant="primary" size="sm" [disabled]="!canSave" (click)="save()"
          >Save</sic-button
        >
      </div>
    </div>
  `,
})
export class SicOrganizationalChartEditDialog implements OnInit {
  @AngularInput({ required: true }) node!: SicOrganizationalChartNode;
  @AngularInput({ required: true }) onSave!: (payload: NodeEditPayload) => void;

  roleCode = '';
  nameEn = '';
  nameLocal = '';
  color = '';

  constructor(private readonly dialogService: DialogService) {}

  ngOnInit(): void {
    this.roleCode = this.node.roleCode || '';
    this.nameEn = this.node.nameEn;
    this.nameLocal = this.node.nameLocal;
    this.color = this.node.color;
  }

  get canSave(): boolean {
    return (
      this.roleCode.trim().length > 0 &&
      this.nameEn.trim().length > 0 &&
      this.nameLocal.trim().length > 0 &&
      this.color.trim().length > 0
    );
  }

  save(): void {
    if (!this.canSave) {
      return;
    }

    this.onSave({
      roleCode: this.roleCode.trim().toUpperCase(),
      nameEn: this.nameEn.trim(),
      nameLocal: this.nameLocal.trim(),
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
  templateUrl: './sic-organizational-chart.component.html',
  styleUrl: './sic-organizational-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicOrganizationalChartComponent implements AfterViewInit, OnChanges, OnDestroy {
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
    // ✅ ตั้งค่าภาษาเริ่มต้นให้ถูกต้องตั้งแต่เริ่ม
    this.currentLanguage = this.resolveLanguage(
      this.translate.currentLang || this.translate.getDefaultLang() || 'en',
    );
  }

  ngAfterViewInit(): void {
    // ✅ อัปเดตภาษาซ้ำเพื่อความปลอดภัย (เผื่อมีการเปลี่ยนแปลงระหว่าง constructor กับ afterViewInit)
    const newLang = this.resolveLanguage(
      this.translate.currentLang || this.translate.getDefaultLang() || 'en',
    );
    if (this.currentLanguage !== newLang) {
      this.currentLanguage = newLang;
      this.cdr.detectChanges(); // ✅ บังคับให้ view อัปเดตทันที
    }

    this.languageChangeSubscription = this.translate.onLangChange.subscribe(({ lang }) => {
      this.ngZone.run(() => {
        this.currentLanguage = this.resolveLanguage(lang);
        this.cdr.detectChanges(); // ✅ มีอยู่แล้ว แต่ยืนยันว่าทำงาน
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
      const localLabel = node.nameLocal?.trim();
      return localLabel || node.nameEn || '';
    }

    const englishLabel = node.nameEn?.trim();
    return englishLabel || node.nameLocal || '';
  }

  addChild(parentNode: SicOrganizationalChartNode): void {
    const draftNode: SicOrganizationalChartNode = {
      id: this.generateId(),
      nameEn: '',
      nameLocal: '',
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
            nameEn: payload.nameEn,
            nameLocal: payload.nameLocal,
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
            nameLocal: payload.nameLocal,
            nameEn: payload.nameEn,
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
    const childrenContainers = host.querySelectorAll<HTMLElement>(
      '.sic-organizational-chart__children',
    );

    childrenContainers.forEach((childrenContainer) => {
      const horizontalConnector = childrenContainer.querySelector<HTMLElement>(
        ':scope > .sic-organizational-chart__connector-horizontal',
      );
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

      const lineSizeRaw = getComputedStyle(host)
        .getPropertyValue('--sic-organizational-line-size')
        .trim();
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

  @Output() nodeClick = new EventEmitter<SicOrganizationalChartNode>();

  // ✅ เพิ่ม method
  onNodeClick(node: SicOrganizationalChartNode): void {
    this.nodeClick.emit(node);
  }
}
