// src/app/core/component/sic-drawer/drawer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DrawerConfig {
  component: any;
  inputs?: Record<string, any>;
  title?: string;
  width?: string;
  onSaved?: () => void;    
  onCancelled?: () => void; 
}

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private drawerSubject = new BehaviorSubject<DrawerConfig | null>(null);
  drawer$ = this.drawerSubject.asObservable();

  open(config: DrawerConfig) {
    this.drawerSubject.next(config);
  }

  close() {
    // ✅ ลบ setTimeout ที่ไม่จำเป็นออก
    this.drawerSubject.next(null);
  }
}