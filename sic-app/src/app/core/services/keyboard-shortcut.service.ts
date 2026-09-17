// src/app/core/services/keyboard-shortcut.service.ts
import { Injectable, signal } from '@angular/core';

export interface ShortcutInfo {
  keys: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService {
  readonly isHelpOpen = signal(false);

  readonly shortcuts: ShortcutInfo[] = [
    { keys: 'Ctrl + K', description: 'เปิดค้นหาแบบรวดเร็ว (Command Palette)' },
    { keys: 'Ctrl + /', description: 'แสดง/ซ่อนรายการคีย์ลัดทั้งหมด' },
    { keys: 'Esc', description: 'ปิด Modal / Drawer / Command Palette ที่เปิดอยู่' },
    { keys: '↑ / ↓', description: 'เลื่อนเลือกรายการในผลการค้นหา' },
    { keys: 'Enter', description: 'ยืนยันรายการที่เลือกในผลการค้นหา' },
  ];

  toggleHelp(): void {
    this.isHelpOpen.set(!this.isHelpOpen());
  }

  closeHelp(): void {
    this.isHelpOpen.set(false);
  }
}
