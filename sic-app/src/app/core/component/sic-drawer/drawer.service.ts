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
    // ครอบด้วย setTimeout ขนาดย่อม (0ms) เพื่อป้องกันปัญหาสเตตัสเปลี่ยนกะทันหันในคิวงานปัจจุบัน
    setTimeout(() => {
      this.drawerSubject.next(null);
    }, 0);
  }
}