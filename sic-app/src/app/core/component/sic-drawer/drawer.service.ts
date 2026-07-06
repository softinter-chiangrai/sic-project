// src/app/core/services/drawer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DrawerConfig {
  component: any;                      
  inputs?: Record<string, any>;       
  title?: string;
  width?: string;
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
    this.drawerSubject.next(null);
  }
}