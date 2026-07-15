// base-action.component.ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SicSidebarService } from '../sic-sidebar.service';

@Component({
  template: '' // คลาสแม่ที่เป็นโครงสร้างสถาปัตยกรรม ไม่ต้องมีหน้า HTML
})
export abstract class BaseActionComponent implements  OnDestroy {
  // ใช้ระบบ inject() ของ Angular ช่วยฉีด Service (ทำให้หน้าลูกไม่จำเป็นต้องเขียน constructor ซ้ำซ้อน)
  protected actionService = inject(SicSidebarService);
  protected destroy$ = new Subject<void>();

  constructor() {
    // 🌟 ย้ายระบบดักฟังมาไว้ที่ constructor ของคลาสแม่แทน
    this.actionService.action$
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        const targetComponent = this as any;
        if (action === 'back' && typeof targetComponent.onBack === 'function') targetComponent.onBack();
        if (action === 'search' && typeof targetComponent.onSearch === 'function') targetComponent.onSearch();
        if (action === 'add' && typeof targetComponent.onAdd === 'function') targetComponent.onAdd();
        if (action === 'save' && typeof targetComponent.onSave === 'function') targetComponent.onSave();
        if (action === 'print' && typeof targetComponent.onPrint === 'function') targetComponent.onPrint();
      });
  }

  // คืนค่าหน่วยความจำอัตโนมัติเมื่อย้ายหน้า เพื่อป้องกันแอปอืด (Memory Leak)
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}