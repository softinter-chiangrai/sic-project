import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CanActivateChildFn, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, map, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DialogService } from './dialog.service';

export interface ProgramPermission {
  programCode: string;
  routePath: string;
  add: boolean;
  save: boolean;
  remove: boolean;
  print: boolean;
}

type Flags = Pick<ProgramPermission, 'add' | 'save' | 'remove' | 'print'>;

/** หน้าที่ไม่ได้อยู่ใต้ route ของโปรแกรมตัวเอง -> ใช้สิทธิ์ของโปรแกรมไหน (มีสิทธิ์ในโปรแกรมใดก็ได้) */
const ROUTE_ALIAS: Record<string, string[]> = {
  'pm/test-case': ['pm/test-management'],
  'pm/test-scenario': ['pm/test-management'],
  'pm/test-execution': ['pm/test-management'],
  'pm/bug': ['pm/test-management'],
  'pm/milestone': ['pm/phase', 'pm/gantt'],
  'pm/work-package': ['pm/phase', 'pm/gantt'],
  'pm/task': ['pm/task-board', 'pm/phase', 'pm/gantt', 'pm/test-management'],
  'pm/dt/pmdt03': ['pm/approval'],
};

/**
 * สิทธิ์ add/save/remove/print ของผู้ใช้ตาม role (ตัวจริงตรวจที่ backend; ตรงนี้แค่ซ่อนปุ่ม).
 * ใส่ class perm-no-* ที่ <body> ตามหน้าปัจจุบัน แล้ว CSS ใน styles.css ซ่อน [data-perm] / ปุ่ม submit ของฟอร์ม.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private perms: ProgramPermission[] | null = null;
  private load$ = this.fetch();

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.applyBodyClasses(e.urlAfterRedirects));
  }

  private fetch(): Observable<unknown> {
    return this.http.get<ProgramPermission[]>(`${environment.apiBaseUrl}/api/menu/permissions`).pipe(
      map((list) => (this.perms = list ?? [])),
      catchError(() => of((this.perms = null))), // โหลดไม่ได้ = ไม่ซ่อนอะไร (backend ยังกันอยู่)
      shareReplay(1),
    );
  }

  /** โหลดสิทธิ์ใหม่ (สลับ business / admin แก้สิทธิ์) แล้วซ่อน-แสดงปุ่มของหน้าปัจจุบันใหม่ทันที ไม่ต้องรีเฟรช */
  reload(): void {
    this.load$ = this.fetch();
    this.load$.subscribe(() => this.applyBodyClasses(this.router.url));
  }

  /** โหลดสิทธิ์สำเร็จแล้ว (null = ยังไม่โหลด/โหลดไม่ได้) */
  get loaded(): boolean {
    return this.perms !== null;
  }

  ensureLoaded(): Observable<unknown> {
    return this.load$;
  }

  /** null = หน้านี้ไม่ผูกกับโปรแกรม (ไม่จำกัด) */
  flagsFor(url: string): Flags | null {
    if (!this.perms) return null;
    const path = url.split(/[?#]/)[0].replace(/^\/feature\//, '');
    const routes = this.perms.map((p) => p.routePath).filter(Boolean);
    const own = routes.filter((r) => path === r || path.startsWith(r + '/')).sort((a, b) => b.length - a.length)[0];
    const alias = Object.keys(ROUTE_ALIAS).find((k) => path === k || path.startsWith(k + '/'));
    const targets = own ? [own] : alias ? ROUTE_ALIAS[alias] : null;
    if (!targets) return null; // ไม่ตรงโปรแกรมที่มีสิทธิ์ (หรือไม่ใช่หน้าโปรแกรม) -> backend เป็นคนกัน
    const hits = this.perms.filter((p) => targets.includes(p.routePath));
    return {
      add: hits.some((p) => p.add),
      save: hits.some((p) => p.save),
      remove: hits.some((p) => p.remove),
      print: hits.some((p) => p.print),
    };
  }

  private applyBodyClasses(url: string): void {
    const f = this.flagsFor(url);
    const path = url.split(/[?#]/)[0];
    const isNew = CREATE_PAGE.test(path);
    const isEdit = /\/(edit|view)$/.test(path) || /[?&]mode=view/.test(url); // หน้าดู: ไม่มีสิทธิ์บันทึก = ซ่อนปุ่มแก้ในฟอร์มด้วย
    const cls = document.body.classList;
    cls.toggle('perm-no-add', !!f && !f.add);
    cls.toggle('perm-no-save', !!f && !f.save);
    cls.toggle('perm-no-remove', !!f && !f.remove);
    cls.toggle('perm-no-print', !!f && !f.print);
    cls.toggle('perm-readonly', !!f && ((isNew && !f.add) || (isEdit && !f.save)));
  }
}

/** หน้าสร้างเอกสารใหม่: /new และหน้าต่อสัญญา (สร้างสัญญาฉบับใหม่) */
const CREATE_PAGE = /\/new$|\/renew\/[^/]+$/;

/** กันเข้าหน้าสร้างใหม่โดยไม่มีสิทธิ์เพิ่ม (รวมปุ่มข้ามหน้า เช่น "ขอเปลี่ยนแปลง" -> หน้า CR) — backend สร้างใหม่ต้องใช้สิทธิ์เพิ่ม */
export const permissionGuard: CanActivateChildFn = (_route, state) => {
  const svc = inject(PermissionService);
  const dialog = inject(DialogService);
  return svc.ensureLoaded().pipe(
    map(() => {
      if (!CREATE_PAGE.test(state.url.split(/[?#]/)[0])) return true;
      const f = svc.flagsFor(state.url);
      if (!f || f.add) return true;
      dialog.warn('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์เพิ่มข้อมูลในหน้านี้');
      return false;
    }),
  );
};
