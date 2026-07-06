// src/app/core/component/sic-drawer/drawer.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DrawerService, type DrawerConfig } from './drawer.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="config" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="close()"></div>
      <!-- Drawer Panel (Centered Modal style) -->
      <div
        class="relative bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh] w-full transition-all duration-300 ease-in-out"
        [style.maxWidth]="config.width || '640px'"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ config.title }}</h2>
          <button
            (click)="close()"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <!-- Content -->
        <div class="p-6">
          <ng-container #dynamicContainer></ng-container>
        </div>
      </div>
    </div>
  `,
})
export class DrawerComponent implements OnDestroy, AfterViewInit {
  private drawerService = inject(DrawerService);

  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: false })
  viewContainerRef!: ViewContainerRef;

  config: DrawerConfig | null = null;
  private isViewReady = false;
  private subscription = this.drawerService.drawer$.subscribe((config) => {
    this.config = config;
    if (this.isViewReady) {
      setTimeout(() => this.renderComponent(), 0);
    }
  });

  ngAfterViewInit() {
    this.isViewReady = true;
    if (this.config) {
      setTimeout(() => this.renderComponent(), 0);
    }
  }

  private renderComponent() {
    if (!this.viewContainerRef) {
      console.warn('ViewContainerRef not ready yet');
      return;
    }
    this.viewContainerRef.clear();
    if (this.config) {
      const componentRef = this.viewContainerRef.createComponent(this.config.component);
      if (this.config.inputs) {
        Object.assign(componentRef.instance as any, this.config.inputs);
      }
      const instance = componentRef.instance as any;
      if (instance.saved) {
        instance.saved.subscribe(() => this.drawerService.close());
      }
      if (instance.cancelled) {
        instance.cancelled.subscribe(() => this.drawerService.close());
      }
    }
  }

  close() {
    this.drawerService.close();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.viewContainerRef) {
      this.viewContainerRef.clear();
    }
  }
}
