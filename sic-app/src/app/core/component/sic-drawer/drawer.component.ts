// src/app/core/component/sic-drawer/drawer.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import { DrawerService, type DrawerConfig } from './drawer.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: ` ... `, // เหมือนเดิม
})
export class DrawerComponent implements OnDestroy, AfterViewInit {
  private drawerService = inject(DrawerService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  config: DrawerConfig | null = null;
  private isViewReady = false;

  private subscription = this.drawerService.drawer$.subscribe((config) => {
    this.config = config;
    if (this.isViewReady) {
      this.renderComponent();
    }
    this.cdr.detectChanges();
  });

  ngAfterViewInit() {
    this.isViewReady = true;
    if (this.config) {
      this.renderComponent();
      this.cdr.detectChanges();
    }
  }

  private renderComponent() {
    if (!this.viewContainerRef) {
      console.warn('ViewContainerRef not ready yet');
      return;
    }
    this.viewContainerRef.clear();
    if (this.config) {
      try {
        const componentRef = this.viewContainerRef.createComponent(this.config.component);
        if (this.config.inputs) {
          Object.assign(componentRef.instance as any, this.config.inputs);
        }
        const instance = componentRef.instance as any;

        if (instance.saved) {
          instance.saved.subscribe(() => {
            // เรียก onSaved callback ถ้ามี
            if (this.config?.onSaved) {
              this.config.onSaved();
            }
            this.drawerService.close();
          });
        }

        if (instance.cancelled) {
          instance.cancelled.subscribe(() => {
            if (this.config?.onCancelled) {
              this.config.onCancelled();
            }
            this.drawerService.close();
          });
        }

     

      } catch (error) {
        console.error('Error creating dynamic component:', error);
      }
    }
  }

  close() {
    if (this.config?.onCancelled) {
      this.config.onCancelled();
    }
    this.drawerService.close();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.viewContainerRef) {
      this.viewContainerRef.clear();
    }
  }
}