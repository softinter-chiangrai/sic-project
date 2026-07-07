// src/app/core/component/sic-drawer/drawer.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DrawerService, type DrawerConfig } from './drawer.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="drawerConfig" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="close()"></div>

      <div
        class="relative bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh] w-full transition-all duration-300 ease-in-out"
        [style.maxWidth]="drawerConfig.width || '640px'"
      >
        <div
          class="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ drawerConfig.title }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-500">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div class="p-6">
          <ng-container #viewContainer></ng-container>
        </div>
      </div>
    </div>
  `,
})
export class DrawerComponent implements AfterViewInit, OnDestroy {
  private drawerService = inject(DrawerService);
  private cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();

  // จุดรับ ViewContainer ต้องดึงออกมาใช้งาน
  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  drawerConfig: DrawerConfig | null = null;
  private isViewReady = false;

  constructor() {
    // ติดตามการเปิด-ปิดจาก Service
    this.sub.add(
      this.drawerService.drawer$.subscribe((config) => {
        this.drawerConfig = config;

        // ถ้าหน้าจอพร้อมแล้ว และมีการสั่งเปิดฟอร์ม ให้สั่งวาดฟอร์มทันที
        if (this.isViewReady) {
          // ใช้ setTimeout หน่วงกระบวนการวาดฟอร์มไว้ 0ms เพื่อแก้ NG0100 และทำให้ตัว #viewContainer ถูกวาดเสร็จก่อนที่จะฉีดฟอร์มเข้าไป
          setTimeout(() => {
            this.renderComponent();
          }, 0);
        }
      }),
    );
  }

  ngAfterViewInit() {
    this.isViewReady = true;
    if (this.drawerConfig) {
      setTimeout(() => {
        this.renderComponent();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private renderComponent() {
    // ตรวจสอบความพร้อมของพื้นที่ใส่ฟอร์ม
    if (!this.viewContainerRef) {
      return;
    }

    // เคลียร์ฟอร์มเก่าออกก่อน
    this.viewContainerRef.clear();

    if (this.drawerConfig) {
      try {
        // สร้าง Component ลูก (Form) เข้ามาใส่ในหน้าต่างป๊อปอัป
        const componentRef = this.viewContainerRef.createComponent(this.drawerConfig.component);

        // ส่งพวกค่า inputs (เช่น projectId, milestoneId) เข้าไปในฟอร์มลูก
        if (this.drawerConfig.inputs) {
          Object.assign(componentRef.instance as any, this.drawerConfig.inputs);
        }

        const instance = componentRef.instance as any;

        // สมาชิกจับ Event ตอนกดบันทึกสำเร็จ
        if (instance.saved) {
          instance.saved.subscribe(() => {
            if (this.drawerConfig?.onSaved) {
              this.drawerConfig.onSaved();
            }
            this.drawerService.close();
          });
        }

        // สมาชิกจับ Event ตอนกดยกเลิก
        if (instance.cancelled) {
          instance.cancelled.subscribe(() => {
            if (this.drawerConfig?.onCancelled) {
              this.drawerConfig.onCancelled();
            }
            this.drawerService.close();
          });
        }

        // บังคับอัปเดตหน้าจอหลังจากฉีดฟอร์มลงไปเสร็จแล้ว
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error creating dynamic component:', error);
      }
    }
  }

  close() {
    this.drawerService.close();
  }
}
