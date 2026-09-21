# SIC Project — Development Rules

กฎและมาตรฐานสำหรับการพัฒนาโปรเจกต์ SIC (Smart Integrated Control) ใช้เป็นข้อกำหนดกลางสำหรับทั้งคนและ AI ที่เขียนโค้ดในโปรเจกต์นี้ — **สิ่งที่เขียนไว้ในไฟล์นี้ถือเป็นการตัดสินใจที่ทำไว้แล้ว ไม่ต้องคิดใหม่หรือถกเถียงซ้ำ** ยกเว้นผู้ใช้จะสั่งเปลี่ยนแปลงโดยตรง

> หมายเหตุ: โปรเจกต์นี้เคยมีไฟล์ `project-rules.md.disabled` ซึ่งแนะนำให้ "หลีกเลี่ยง resolver และใช้ `httpResource`/`toSignal` แทน" — **กฎข้อนั้นถูกยกเลิกแล้ว** หลังจากตรวจสอบพบว่าโค้ดจริงในโปรเจกต์ (BU, PMRT, PMDT ทุกหน้า) ใช้ resolver เป็นมาตรฐานหลักอยู่แล้ว และผู้ใช้ยืนยันชัดเจนว่าต้องการให้ทุกหน้าใช้ `.resolve` จริง ดูหัวข้อ [4. Resolver / Model / Service / Form Standard](#4-resolver--model--service--form-standard-มาตรฐานบังคับ) — นี่คือกฎที่ถูกต้องและใช้งานจริงในปัจจุบัน

---

## 1. Architecture Overview

| Layer | Technology | Location |
| :--- | :--- | :--- |
| Frontend | Angular 22+ (Standalone Components, Signals) | `sic-app/` |
| Backend | Spring Boot 3.x (JPA, REST, WebSocket) | `sic-spring/sic/` |
| Authentication | Keycloak (OAuth2 / OIDC) | `sic-auth/` |
| Database | PostgreSQL | `sic-database/` |
| File Storage | MinIO (S3-compatible) | `sic-storage/` |
| UI Library | `sic-ng` (npm package) | ดู `sic-ng-skill.md` ก่อนสร้าง UI ใดๆ |

---

## 2. Naming Conventions

### 2.1 Frontend

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Component class | `PascalCase` + `Component` | `Burt01Component`, `Pmdt06AComponent` |
| Service | `camelCase`/`PascalCase` + `Service` | `burt01Service`, `ApprovalService` |
| Model (interface) | `PascalCase` + `Model` | `Burt01Model` |
| PageData (resolver return shape) | `PascalCase` + `PageData` | `Burt04PageData`, `Pmdt06APageData` |
| Form class | `PascalCase` + `Form` | `Burt01Form` |
| Resolver | `camelCase` + `Resolver` | `burt01Resolver`, `pmdt01AEditResolver` |
| Routes file | `*.routes.ts` | `bu.routes.ts`, `pm.routes.ts` |

### 2.2 Backend

| Layer | Pattern | Example |
| :--- | :--- | :--- |
| Controller | `XxxController` | `PmRequirementController` |
| Service Interface / Impl | `XxxService` / `XxxServiceImpl` | `PmRequirementService` |
| Repository | `XxxRepository` | `PmRequirementRepository` |
| Entity | `Xxx` (PascalCase) | `PmRequirement` |
| Request/Response DTO | `XxxRequest` / `XxxResponse` | `PmRequirementRequest` |

### 2.3 Database

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Table | `snake_case` + module prefix | `pm_requirement`, `su_business` |
| Column | `snake_case` | `business_id`, `created_date` |
| Primary key | `id` (UUID) | |
| Foreign key | `{table}_id` | `project_id` |

---

## 3. สิ่งที่ระบบมีให้อยู่แล้ว — ห้ามสร้างซ้ำ

ก่อนเขียนโค้ดใหม่ ให้เช็ครายการนี้ก่อนเสมอ หลายอย่างในนี้ถูกสร้างไว้ให้แล้วและใช้ทั่วทั้งแอป การสร้างซ้ำ (เช่น เขียน date formatter เอง, localStorage key ใหม่สำหรับ business/language, validator error message เอง) จะทำให้ inconsistent กับหน้าอื่น

### 3.1 Pagination

**Shape มาตรฐานของ response ที่มี pagination** — `core/model/pagination.model.ts`:

```typescript
export interface PaginationResponse<T> {
  data: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    sorts?: any[];
  };
}
```

Backend ทุก endpoint ที่คืนรายการแบบแบ่งหน้าต้องคืนในรูปแบบนี้เสมอ (`data` = array ของแถว, `pageable.totalElements` = ใช้คำนวณจำนวนหน้าทั้งหมด)

**UI แสดงเลขหน้า** — `core/component/sic-pagination/sic-pagination.component.ts` (custom component ของโปรเจกต์เอง ไม่ใช่จาก `sic-ng`) selector `<sic-pagination>`:

```typescript
@Input() currentPage = 1;
@Input() pageSize = 10;
@Input() totalItems = 0;
@Input() windowSize = 5;        // จำนวนปุ่มเลขหน้าที่โชว์รอบๆ หน้าปัจจุบัน
@Output() pageChange = new EventEmitter<number>();
```

**ข้อควรระวัง:** component นี้รับแค่ `currentPage`/`pageSize`/`totalItems` เป็นตัวเลขธรรมดา ไม่รับ `PaginationResponse<T>` ตรงๆ — ต้อง map ค่าจาก `res.pageable.pageNumber/pageSize/totalElements` เข้า input เหล่านี้เองที่ component

**สำหรับหน้าที่ใช้ `<sic-gridpanel>` (จาก `sic-ng`) แทน** ไม่ต้องใช้ `sic-pagination` — grid มี pagination ในตัวอยู่แล้ว ดูหัวข้อ 6 (GridPanel)

### 3.2 ระบบเปลี่ยนภาษา (i18n)

**`core/services/language.service.ts` → `LanguageService`** (`type AppLanguage = 'th' | 'en'`):

```typescript
initLanguage(): Observable<any>      // เรียกใน APP_INITIALIZER — อ่านค่าจาก localStorage → browser locale → 'en'
setLanguage(lang: AppLanguage): void // เซฟ localStorage, เปลี่ยนภาษา, อัปเดต <html lang>, แล้ว reload หน้าเว็บทันที
getCurrentLanguage(): AppLanguage    // อ่านค่าปัจจุบันจาก TranslateService
```

- persist ที่ `localStorage` key **`'app-lang'`**
- `setLanguage()` จะ **reload หน้าเว็บทั้งหน้า** (`window.location.reload()`) เพื่อ refresh ข้อความทุกจุด — เป็นพฤติกรรมที่ตั้งใจ ไม่ใช่บั๊ก

**Pattern การสลับภาษาที่ใช้ทั่วแอป** (เจอใน `sic-sidebar`, `main/index`, `management/management.component.ts`):

```typescript
toggleLanguage(): void {
  const next = this.languageService.getCurrentLanguage() === 'th' ? 'en' : 'th';
  this.languageService.setLanguage(next);
}
```

**ระบบโหลดข้อความแปลแบบแบ่ง module** — `core/services/app-translate-loader.service.ts` → `AppTranslateLoader implements TranslateLoader`:

- ใช้ `InjectionToken`: `APP_TRANSLATE_MODULE_CODE`, `APP_TRANSLATE_PROGRAM_CODE` (default `'COMMON'`/`'ALL'`, provide ไว้ที่ root ใน `app.config.ts`)
- `setContext(moduleCode, programCode)` — สลับ context ตอน runtime เพื่อโหลดข้อความแปลของ module นั้นๆ เพิ่ม (มักเรียกใน resolver หรือ `ngOnInit` ของ feature shell component)
- `getTranslation(lang)` จะยิง `GET {apiBaseUrl}/api/i18n/COMMON/ALL/{lang}` เสมอ + ยิง `GET {apiBaseUrl}/api/i18n/{moduleCode}/{programCode}/{lang}` เพิ่มถ้า context ไม่ใช่ default แล้ว deep-merge กัน (ของ module เฉพาะทับ COMMON ถ้า key ชนกัน)
- **การใช้งาน:** ถ้าหน้าใหม่มี translation key เฉพาะของตัวเอง ให้ provide token สองตัวนี้ที่ระดับ feature shell (ดูตัวอย่างใน `management/management.component.ts`) แทนที่จะยัด key ทั้งหมดลงใน `COMMON`

### 3.3 Utility files ที่มีให้แล้ว (`core/utils/`)

| ไฟล์ | export | หน้าที่ |
| :--- | :--- | :--- |
| `datetime.util.ts` | `DateTimeUtil` (static class) | ห่อ `dayjs` พร้อมรองรับ UTC offset (+7 default) และปีพุทธศักราชไทย (`era: 'th'` แปลง `YYYY`→`BBBB` อัตโนมัติ) — ดูรายละเอียดในหัวข้อ 3.4 |
| `resolve-context.util.ts` | `resolveProjectId(route)`, `resolveCustomerId(route)`, `resolveRequirementId(route)` | อ่าน `projectId`/`customerId`/`requirementId` จาก `route.queryParams` — ใช้ในหน้าที่ต้อง derive context จาก query string (เช่น `handleGridLoad` ที่ filter ตามโครงการ) |

**ห้ามเขียน date formatter หรือ query-param resolver เองใหม่** — ใช้สองไฟล์นี้เสมอ

### 3.4 การจัดรูปแบบวันที่/เวลา (Date Formatting)

- **`core/pipes/sic-date.pipe.ts`** (`sicDate`) และ **`core/pipes/sic-datetime.pipe.ts`** (`sicDateTime`) — ทั้งคู่ wrap `DateTimeUtil.formatDateTime()` เหมือนกัน (⚠️ **ข้อควรระวัง:** ชื่อ `sicDate` ทำให้เข้าใจผิดว่าโชว์แค่วันที่ แต่จริงๆ มันโชว์เวลาด้วยเหมือน `sicDateTime` — ถ้าต้องการวันที่ล้วนไม่มีเวลา ให้เรียก `DateTimeUtil.formatDate()` ตรงๆ ในโค้ด แทนการใช้ pipe `sicDate`)
- ตัวอย่างใช้งาน: `{{ item.createdDate | sicDate : null : 'DD/MM/YYYY HH:mm' }}`
- `DateTimeUtil.formatDate(utcValue, format?, userOffset?)` — วันที่ล้วน (default format `'D MMMM YYYY'`)
- `DateTimeUtil.formatDateTime(utcValue, format?, userOffset?)` — วันที่+เวลา (default `'D MMMM YYYY HH:mm:ss'`)
- `DateTimeUtil.toInstantIsoString(value)` — แปลง Date/string → ISO string UTC ก่อนส่งขึ้น backend
- **Currency/ตัวเลข:** ยังไม่มี shared pipe/util กลางสำหรับ format ตัวเลข/สกุลเงินในโปรเจกต์นี้ — ปัจจุบันแต่ละหน้าจัดการเอง ถ้าต้องแสดงจำนวนเงินให้ใช้ Angular built-in `CurrencyPipe`/`DecimalPipe` ไปก่อน (นี่คือช่องว่างที่ควร standardize ในอนาคต ไม่ใช่ pattern ที่ตั้งใจ)

### 3.5 Validators (`core/validator/`)

**`sic.validator.ts` → `SicValidator`** (Injectable) — เป็น error-message helper ไม่ใช่ `ValidatorFn` factory:

```typescript
shouldShowError(control, touched): boolean
resolveErrorMessage(errors, errorMessages?): string | null  // map error key แรก → ข้อความ human-readable
getErrorMessage(control, errorMessages?): string | null
```

ใช้ตัวนี้แทนการเขียน error message เองทุกครั้งที่ validate ฟอร์ม — ส่ง `errorMessages` (object แมป error key → ข้อความ) เข้าไป override ได้ตามหน้า

### 3.6 Types กลาง (`core/types/`)

- **`form.type.ts`** → `ToForm<T> = { [K in keyof T]: FormControl<T[K] | null> }` — ใช้ type นี้เสมอตอนประกาศ return type ของ `static createForm(fb): FormGroup<ToForm<XxxModel>>` ใน `.form.ts` ทุกไฟล์

### 3.7 Config กลาง (`core/config/`)

- **`api.config.ts`** → `apiBaseUrl` — ค่านี้ pull มาจาก `environment.apiBaseUrl` โดยตรง ใช้ตัวนี้แทนการ import `environment` เองทุกที่
- **`ai-models.config.ts`** → `AI_MODEL_OPTIONS`, `DEFAULT_AI_MODEL` — จุดรวมรายชื่อ AI model ที่เลือกได้ในหน้าที่มีฟีเจอร์ AI generate (เช่น pmdt15A) แก้ที่นี่จุดเดียว ไม่ต้องประกาศ list ซ้ำในแต่ละ component

### 3.8 Shared Services (`core/services/`) — Catalog

| Service | ไฟล์ | หน้าที่หลัก | Method สำคัญ |
| :--- | :--- | :--- | :--- |
| `DialogService` | `dialog.service.ts` | Popup/Dialog กลางของทั้งแอป — **ใช้ตัวนี้เสมอ ห้ามใช้ `alert()`/`confirm()` ของ browser** | `info/success/warn/error(title, desc): Promise<boolean>`, `confirm(title, desc): Promise<boolean>`, `open(options)` (custom component dialog) |
| `SicToastService` | `core/component/sic-toast/sic-toast.service.ts` | Toast/snackbar แจ้งเตือนสั้นๆ มุมจอ (ต่างจาก `DialogService` ที่เป็น modal บังหน้าจอ) | `show(message, typeOrOptions?, duration?)` |
| `BusinessService` | `business.service.ts` | Business (องค์กร) ที่ผู้ใช้เลือกอยู่ปัจจุบัน, persist `localStorage['businessId']` | `getCurrentBusinessId()`, `setCurrentBusinessId(id)`, `getMyBusinesses()` |
| `CustomerStateService` | `customer-state.service.ts` | Context ปัจจุบัน (customer/project/requirement) — เก็บเป็น **signal อย่างเดียว ไม่ persist localStorage** | `setProject/getProjectId/clearProject`, `setContext(...)`, `clearAll()` |
| `NavigationService` | `navigation.service.ts` | wrapper บาง ๆ รอบ `Router.navigate` | `navigate(commands, extras?)` |
| `ThemeService` | `theme.service.ts` | Light/dark/system theme, persist `localStorage['theme']` | `setTheme(mode)`, `toggleDark()`, signal `isDark` |
| `RecentItemsService` | `recent-items.service.ts` | "รายการที่เพิ่งดู" (สูงสุด 8 รายการ), persist `localStorage['recentItems']` | `record(item)`, signal `items` |
| `BreadcrumbService` | `breadcrumb.service.ts` | สร้าง breadcrumb จากเมนู sidebar + route data อัตโนมัติทุก navigation | `setPageTitle(title)`, `setCustomBreadcrumbs(crumbs)`, signal `breadcrumbs` |
| `NotificationService` | `notification.service.ts` | ศูนย์แจ้งเตือน (กระดิ่ง) + toast แจ้งเตือน real-time | `loadNotifications()`, `markAsRead(id)`, `showToastNotification(...)` |
| `GlobalSearchService` | `global-search.service.ts` | Command palette ค้นหาทั่วแอป (customer/project/contract/เมนู) debounce 250ms | `open()/close()`, `search(keyword)` |
| `TraceLinkService` | `trace-link.service.ts` | เชื่อมโยงเอกสารข้ามประเภท (requirement↔diagram↔spec↔test) | `createLink(payload)`, `getLinksBySource(...)` |
| `AiHistoryService` | `ai-history.service.ts` | ประวัติ AI-generate content, persist localStorage ต่อ `moduleKey`+`targetId` | `getHistories/addHistory/deleteHistory` |
| `ChatService` | `chat.service.ts` | แชท/วิดีโอคอล real-time (STOMP + WebRTC) — ใหญ่และซับซ้อน อย่า import ถ้าไม่ได้ใช้จริง | `connect()`, `sendTextMessage`, `startCall` |
| `KeyboardShortcutService` | `keyboard-shortcut.service.ts` | Modal ช่วยเหลือ keyboard shortcut | `toggleHelp()` |

**อย่าสร้าง service ใหม่ซ้ำหน้าที่กับตัวไหนในตารางนี้** — โดยเฉพาะ `DialogService` (error/success popup), `BusinessService`/`CustomerStateService` (business/project context), และ `ThemeService`/`LanguageService` (persisted user preference)

### 3.9 Core Models (`core/model/`) — เพิ่มเติมจาก `SicFromData`/`SicBaseStateModel`/`SicEntityState`/`PaginationResponse`

- `sic-base-model.ts` มีอีก 2 export ที่มักถูกมองข้าม: `SicBaseStateModel { state, rowVersion }` (interface สั้นๆ ที่ทุก Model ของหน้าฟอร์มต้อง `extends`) และ `ComboboxItem { value, text }` (shape มาตรฐานของตัวเลือกใน `sic-combobox`)
- `app-theme-config.model.ts` → `AppThemeConfig`/`AppConfig` — ใช้ตอน override สีธีมต่อ business (ถ้ามี custom branding)

### 3.10 ไฟล์ซ้ำที่ควรรู้ (ยังไม่ได้ล้าง)

`core/component/sic-sidebar/` และ `core/component/sic-sidebar copy/` มีอยู่คู่กันพร้อม logic ที่เกือบเหมือนกันทุกอย่างรวมถึง `toggleLanguage()` — โฟลเดอร์ที่มีคำว่า "copy" ต่อท้ายดูเหมือนจะเป็นไฟล์ค้างจากการ duplicate แล้วลืมลบ **อย่าไปแก้ไฟล์ใน `sic-sidebar copy` โดยไม่ตรวจสอบก่อนว่ามันถูก import ใช้งานจริงหรือเป็นซากที่ต้องรอลบ**

---

## 4. Resolver / Model / Service / Form Standard (มาตรฐานบังคับ)

**นี่คือกฎที่สำคัญที่สุดในไฟล์นี้** ทุกหน้า (route) ในแอปต้องมีไฟล์ครบ 4 ประเภทนี้เสมอ — ไม่มีข้อยกเว้นเรื่องการ "ไม่สร้างไฟล์" แม้ว่าบางหน้าจะไม่ต้องใช้ resolver ดึงข้อมูลจริงก็ตาม (ดูข้อ 4.4):

| File | หน้าที่ |
| :--- | :--- |
| `*.model.ts` | `interface` ของข้อมูล + `interface XxxPageData` (shape ที่ resolver คืนกลับ) — Model ต้อง `extends SicBaseStateModel` |
| `*.form.ts` | `class XxxForm` มี static method `createForm(fb: FormBuilder): FormGroup<ToForm<XxxModel>>` |
| `*.resolver.ts` | `ResolveFn` ที่ผูกกับ route ผ่าน `resolve: { key: xxxResolver }` |
| `*.service.ts` | เรียก HTTP จริง คืน `Observable<T>` ผ่าน `apiBaseUrl` จาก `core/config/api.config.ts` |
| `*.component.ts` | อ่านข้อมูลจาก `route.snapshot.data['key']` เท่านั้น ห้ามยิง HTTP ซ้ำเพื่อโหลดข้อมูลเดิม |

### 4.1 กฎเหล็ก: ห้ามลบไฟล์ทั้ง 4 ประเภทนี้เด็ดขาด

แม้ resolver/model/service/form ไฟล์ใดจะดูเหมือนไม่ได้ใช้งาน (unused), เป็น mock, หรือ mismatch กับหน้าจอจริง **ห้ามลบไฟล์นั้นทิ้งเด็ดขาด** — ให้ "ซ่อม" เนื้อหาข้างในให้ตรงกับสิ่งที่หน้าจอนั้นต้องการจริงๆ แล้วผูก component ให้ใช้งานมันแทน

- ถ้า resolver ดึงข้อมูลผิด (เช่น ดึง entity ผิดตัว หรือดึงแบบ by-id ทั้งที่หน้าเป็น list) → แก้ logic ข้างในให้ดึงข้อมูลที่ถูกต้อง ไม่ใช่ลบไฟล์
- ถ้า resolver เป็น mock stub (`of({ loaded: true })`) แต่หน้าจอนั้นต้องการข้อมูลจริง → เขียน logic จริงเข้าไป
- ถ้า resolver ไม่ได้ผูกกับ route ใดๆ เลย (ไม่มีใน `resolve: {...}`) ให้ตรวจสอบว่า component นั้นมี route จริงหรือไม่ ถ้ามี → ผูกเข้า ถ้าไม่มี (เป็น sub-component ที่รับผ่าน `@Input` เช่น preview panel) → ปล่อยไฟล์ไว้เฉยๆ ไม่ต้องผูก แต่ห้ามลบ
- ถ้าหน้าจอนั้นยังไม่มี backend endpoint จริง (service เป็น mock ล้วนๆ อย่าง `of([])`) → **ห้ามแต่ง business logic ปลอมขึ้นมาเอง** ปล่อยเป็น placeholder ไว้จนกว่าจะมี backend จริง (ตัวอย่าง: `feature/bu/rp/burp01`)

### 4.2 Gold Standard — Pattern ฟอร์มสร้าง/แก้ไขแบบง่าย

ดูตัวอย่างจริงที่ `feature/bu/rt/burt01/`:

```typescript
// burt01.resolver.ts
export const burt01Resolver: ResolveFn<Burt01FormData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt01Service);
  const router = inject(Router);
  const form = Burt01Form.createForm(fb);

  return service.getBusinessInfo().pipe(
    tap((data) => { if (data) form.patchValue(data); }),
    map(() => ({ businessInfo: new SicFromData<Burt01Model>(form) })),
    catchError((err) => {
      console.error('Failed to load:', err);
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};
```

```typescript
// burt01.component.ts
export class Burt01Component implements OnInit {
  formData!: SicFromData<Burt01Model>;

  ngOnInit(): void {
    const form: Burt01FormData = this.route.snapshot.data['form'];
    this.formData = form.businessInfo;   // ← ไม่มีการยิง HTTP ซ้ำเลย
  }

  save() {
    const data = this.formData.value;
    this.isSaving.set(true);
    this.service.save(data)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.dialog.success(...),
        error: (error) => this.dialog.error(this.translate.instant('...'), error.error?.message || error.message),
      });
  }
}
```

**หลักการ:** resolver ดึงข้อมูลจริง → สร้าง `FormGroup` → patch ค่า → ห่อด้วย `new SicFromData<T>(form, data)` → คืนกลับเป็น object ที่ key ตรงกับที่ route ประกาศไว้ใน `resolve: { key: ... }` → component อ่านจาก `route.snapshot.data['key']` ครั้งเดียวใน `ngOnInit` เท่านั้น

### 4.3 Pattern ฟอร์มซับซ้อน (มี FormArray / grid ที่แก้ไขได้)

เมื่อฟอร์มมีโครงสร้างซับซ้อน (เช่น steps เป็น `FormArray`, หรือ grid checkbox matrix) ให้ **ย้าย logic การสร้างฟอร์มทั้งหมดไปไว้ใน `.form.ts` เป็น static method** แทนที่จะสร้างในตัว component แล้วให้ resolver เรียกใช้ ตัวอย่างจริง:

- **FormArray แบบซับซ้อน:** `feature/bu/rt/burt06/burt06A/` — `Burt06AForm.createForm(fb, flow?)` สร้างทั้งฟอร์มหลักและ `steps` FormArray จาก data ที่ resolver fetch มา, มี static helper `Burt06AForm.createStepForm()` แยกไว้ให้ component เรียกใช้ตอน "เพิ่ม step" ได้ด้วย
- **Grid/checkbox matrix ที่แก้ไขได้:** `feature/bu/rt/burt02/burt02A/` — ใช้ `signal<T[]>` สำหรับ re-render กริดแบบ performant แต่ sync ทุกการเปลี่ยนแปลงเข้า `FormControl` ของ `SicFromData` ด้วย (ผ่าน helper `syncFormModules()`) เพื่อให้ `formData.isChanged` ยัง track dirty state ได้ถูกต้องจริง ไม่ใช้ `JSON.stringify` เทียบเองแบบ manual

### 4.4 List Pages — เมื่อไหร่ต้องมี resolver จริง เมื่อไหร่ไม่ต้อง

| ประเภทหน้า List | ต้องมี resolver preload ข้อมูลไหม | ตัวอย่าง |
| :--- | :--- | :--- |
| แสดง array ทั้งหมดครั้งเดียว (client-side filter/sort, ไม่ paginate ที่ server) | **ต้อง** — resolver ดึง array ทั้งก้อนมาก่อน | `feature/bu/rt/burt05/`, `feature/bu/rt/burt06/` |
| Grid ที่โหลดแบบ lazy ผ่าน `(loadData)="handleGridLoad($event, grid)"` และ paginate ที่ server | **ไม่ต้อง** preload แถวข้อมูล — แต่ resolver **ควร** preload ตัวเลือก filter/dropdown ถ้ามี (เช่น รายชื่อ role สำหรับ filter) | `feature/bu/rt/burt04/` (preload `businessId` + `roleOptions`) |
| Grid ที่ขับเคลื่อนด้วย Angular `httpResource()` (auto-refetch เมื่อ signal เปลี่ยน) | ไม่ต้องผ่าน resolver — `httpResource` เองทำหน้าที่เทียบเท่า resolver อยู่แล้ว (fetch ครั้งเดียวต่อ request, ไม่ duplicate) แต่ต้องมี error handling ผ่าน `.error()` signal (ดูข้อ 5.4) | `feature/pm/dt/pmdt16/`, `pmdt18/`, `pmdt18A/` |

**ห้ามใส่ resolver ที่ fetch ข้อมูล by-id (`route.paramMap.get('id')`) ให้กับ route ที่ไม่มี `:id` param** — ถ้าเจอ resolver แบบนี้ผูกอยู่กับ list route ให้แก้ resolver ให้ดึงสิ่งที่หน้านั้นต้องการจริง (array ทั้งหมด หรือ filter options) แทน

### 4.5 Error Handling ใน Resolver

ทุก resolver ที่เรียก HTTP ต้องมี `catchError`/`try-catch` เสมอ ห้ามปล่อยให้ Promise/Observable reject ทะลุออกไปโดยไม่จัดการ:

- **Edit-by-id ที่หาไม่เจอ/error:** `router.navigate(['/not-found'])` แล้วคืน fallback (blank `SicFromData` หรือ `EMPTY`)
- **List/preload resolver ที่ error:** คืนค่า fallback ว่าง (`[]`, `null`) แทนการ block navigation — หน้าเว็บต้องยังเข้าได้ แล้วไปแสดง error/empty state ในหน้าจอแทน

---

## 5. Error Handling & Loading State Standard

### 5.1 Global HTTP Error Interceptor

ไฟล์: `sic-app/src/app/core/interceptors/error.interceptor.ts` ลงทะเบียนใน `app.config.ts` คู่กับ `authTokenInterceptor`:

```typescript
provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor, errorInterceptor])),
```

หน้าที่ของมัน: ดัก `401` แล้วเรียก `authService.logout()` อัตโนมัติเท่านั้น — **ไม่ทำหน้าที่ normalize error message หรือแสดง dialog เอง** ปล่อยให้แต่ละ component เป็นคนจัดการแสดงผล error เพื่อไม่ให้ toast ซ้อนกัน

### 5.2 กฎเหล็ก: ใช้ `pipe(finalize())` เสมอสำหรับ Loading/Saving State

ห้ามเซ็ต `isSaving`/`isLoading` เป็น `false` แยกกันในทั้ง `next` และ `error` เพราะถ้ามี error หลุดออกไปแบบไม่คาดคิด (เช่น throw ใน `next` callback) จะทำให้ค้างหมุนตลอดกาล:

```typescript
// ✅ ถูกต้อง
this.isSaving.set(true);
this.service.save(data)
  .pipe(finalize(() => this.isSaving.set(false)))
  .subscribe({
    next: () => { this.dialog.success(...); this.router.navigate([...]); },
    error: (err) => {
      const msg = err.error?.message || err.message || this.translate.instant('COMMON_SAVE_FAILED');
      this.dialog.error(this.translate.instant('COMMON_ERROR_TITLE'), msg);
    }
  });
```

### 5.3 `<sic-gridpanel>` — `handleGridLoad()` ต้องจัดการ Error ให้ครบ 3 อย่าง

เมื่อโหลดข้อมูล grid ไม่สำเร็จ ต้องทำทั้ง 3 อย่างนี้เสมอ ไม่ใช่แค่อย่างใดอย่างหนึ่ง:

```typescript
handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
  this.isLoading.set(true);
  this.service.getItems(...)
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (res) => grid.setRows(res.data, { totalElements: res.pageable.totalElements }, request.requestId),
      error: (err) => {
        const msg = err.error?.message || this.translate.instant('COMMON_LOAD_FAILED');
        grid.setRows([], { totalElements: 0 }, request.requestId);  // 1. เคลียร์แถวเก่าทิ้ง
        grid.setLoadError(msg, request.requestId);                   // 2. บอก grid ให้หยุดหมุน + แสดง error state
        this.dialog.error(this.translate.instant('COMMON_ERROR_TITLE'), msg); // 3. แจ้งผู้ใช้
      }
    });
}
```

### 5.4 Angular `httpResource()` — ต้องมี Effect ดัก `.error()` ด้วย

ถ้าใช้ `httpResource()` แทน resolver (ดูข้อ 4.4) **ต้องมี effect แยกดัก `.error()` เสมอ** ไม่งั้นถ้า request error หน้าจอจะไม่แสดงอะไรเลยและ grid จะค้างสถานะ loading ตลอดไป:

```typescript
constructor() {
  effect(() => {
    const err = this.resource.error();
    if (err) {
      const msg = (err as any)?.error?.message || this.translate.instant('COMMON_LOAD_FAILED');
      this.gridRef?.setRows([], { totalElements: 0 });
      this.gridRef?.setLoadError(msg);
      this.dialog.error(this.translate.instant('COMMON_ERROR_TITLE'), msg);
    }
  });

  effect(() => {
    const data = this.resource.value();
    if (data) { /* ใช้ data ปกติ */ }
  });
}
```

---

## 6. Core Principles (Frontend)

1. **Standalone Components** — ห้ามใช้ `NgModule`, ทุก component ต้อง `standalone: true`
2. **Reactive Forms** — ใช้ `ReactiveFormsModule` กับ `FormGroup`/`FormControl` เท่านั้น ห้ามใช้ template-driven form
3. **`SicEntityState` Pattern** — ใช้ enum นี้ (0-4) สำหรับทุก CRUD operation (ดูข้อ 8)
4. **`SicFromData<T>` Wrapper** — ทุกฟอร์มต้องห่อด้วย `SicFromData<T>` เพื่อ track dirty/changed state — ห้ามเทียบ dirty state ด้วยมือ (`JSON.stringify` compare เอง)
5. **Bilingual** — ทุกข้อความ UI ต้องรองรับไทย/อังกฤษผ่านระบบ i18n (ข้อ 3.2) ห้าม hardcode ข้อความ
6. **Soft Delete** — ใช้ flag `isDelete` เสมอ ห้าม hard delete จากฐานข้อมูล
7. **Business Context** — ข้อมูลทุกอย่างต้อง scope ด้วย `businessId` (ผ่าน `BusinessService`)
8. **Signals** — ใช้ Angular Signals สำหรับ reactive state ในทุก component ใหม่

---

## 7. UI Component Policy

1. **`sic-ng` เป็นไลบรารีหลัก** สำหรับ input, button, combobox, datepicker, grid ฯลฯ
2. **อ่าน `sic-ng-skill.md` ก่อนเสมอ** ก่อนสร้าง UI ใดๆ เพื่อดูว่ามี component สำเร็จรูปอยู่แล้วหรือไม่
3. **Custom component** ที่ต้องใช้ซ้ำหลายที่ → สร้างไว้ที่ `src/app/core/component/` (ดูรายการ util/service ที่มีอยู่แล้วในข้อ 3 ก่อนสร้างใหม่)
4. ห้ามสร้าง custom component ซ้ำกับที่ `sic-ng` หรือ `core/component/` มีอยู่แล้ว (เช่น `sic-pagination`, `sic-toast`)

---

## 8. EntityState (CRUD Pattern)

```typescript
// Frontend: core/model/sic-entity-state.ts
export enum SicEntityState {
  Detached = 0,
  Unchanged = 1,
  Deleted = 2,
  Modified = 3,
  Added = 4,
}
```

```java
// Backend
public enum EntityState { DETACHED(0), UNCHANGED(1), DELETED(2), MODIFIED(3), ADDED(4); }
```

**กฎ:** `ADDED` → สร้างใหม่ | `MODIFIED` → ต้องมี `id` + `rowVersion` (optimistic locking) | `DELETED` → soft delete (`isDelete = true`) | ค่า enum ฝั่ง frontend/backend ต้องตรงกันเป๊ะ

---

## 9. Route Guards

### 9.1 Guards ที่มีอยู่แล้ว

| Guard | ไฟล์ | หน้าที่ |
| :--- | :--- | :--- |
| `authGuard` | `core/auth/auth.guard.ts` | เช็ค `AuthService.isLoggedIn()` ถ้ายังไม่ login → redirect ไป Keycloak login |
| `businessGuard` | `core/auth/business.guard.ts` | เช็ค `GET /api/business/activation` ถ้ายังไม่มี business ที่ active → redirect ไป `/management/business` |
| `profileGuard` | `core/auth/profile.guard.ts` | เช็ค `GET /api/profile/activation` ถ้า profile ยังไม่ครบ → redirect ไป `/management/profile` |
| `editGuard` | `core/guard/edit.guard.ts` | ปัจจุบันเป็น stub `() => true` (ยังไม่ได้ implement logic จริง) |
| `CanDeactivateGuard` | `core/guard/can-deactivate.guard.ts` | กันออกจากฟอร์มที่แก้ไขแล้วยังไม่บันทึก (ดูข้อ 9.2) |

### 9.2 `CanDeactivateGuard` — ต้องเข้าใจ interface `CanComponentDeactivate`

Guard เช็คจาก field เหล่านี้บน component (ทุก field เป็น optional, guard รองรับทั้ง `boolean`, function, และ Angular `Signal`):

```typescript
export interface CanComponentDeactivate {
  pageDirty?: () => boolean;
  isViewOnly?: boolean | Signal<boolean> | (() => boolean);
  isView?: boolean | Signal<boolean> | (() => boolean);
  isSaved?: boolean | Signal<boolean> | (() => boolean);
  isSaving?: boolean | Signal<boolean> | (() => boolean);
}
```

**กฎบังคับ:**
1. โหลดข้อมูลจาก API/resolver เข้าฟอร์ม → ใช้ `formData.patchValue(data)` เสมอ (ไม่ใช่ `form.setValue`) เพราะมันจะ re-snapshot baseline ให้อัตโนมัติ ไม่ทำให้ dirty เท็จ
2. หลัง save สำเร็จ → เซ็ต `this.isSaved = true;` ก่อน navigate ออก ไม่งั้น guard จะ pop confirm dialog ทั้งที่เพิ่ง save เสร็จ
3. ระหว่างกำลัง save (`isSaving = true`) → guard จะไม่ block การออกจากหน้า (กันเคส auto-navigate หลัง save)

---

## 10. GridPanel (`sic-ng` `SicGridPanelComponent`)

Property `lazy` ใน `SicGridPanelConfig` เป็นตัวกำหนด pattern:
- `lazy: true` (default) → host ต้อง fetch ข้อมูลใหม่ทุกครั้งที่ page/sort/keyword เปลี่ยน ผ่าน `(loadData)="handleGridLoad($event, grid)"`
- `lazy: false` → host ส่งข้อมูล**ทั้งก้อน**ให้ครั้งเดียวผ่าน `grid.setRows()` แล้ว filter/sort/paginate ฝั่ง client เอง

**API ที่ต้องรู้:**
- `grid.setRows(data, { totalElements }, requestId?)` — ส่งแถวข้อมูลเข้า grid
- `grid.setLoadError(message, requestId?)` — บอก grid ว่าโหลดพัง (หยุดหมุน + แสดง error state) — **ต้องเรียกคู่กับ `setRows([], {totalElements:0})` เสมอ** ไม่งั้นแถวเก่าจะค้างอยู่
- `request.requestId` — ใช้กัน race condition เวลามีการยิง request ซ้อนกัน (request เก่าตอบช้ากว่าจะถูก grid เพิกเฉย)

**หน้าที่ไม่ได้ใช้ `<sic-gridpanel>`** (ตารางธรรมดา/list การ์ด) ให้ใช้ `<sic-pagination>` แทนตามข้อ 3.1

---

## 11. Backend Patterns

### 11.1 Service Implementation (EntityState + Optimistic Locking)

```java
@Service
@RequiredArgsConstructor
public class ExampleServiceImpl implements ExampleService {
    private final ExampleRepository repository;

    @Override
    @Transactional
    public UUID save(ExampleRequest request, UUID businessId, String userId) {
        EntityState state = EntityState.values()[request.getState()];
        if (state == EntityState.ADDED) {
            // สร้างใหม่
        } else if (state == EntityState.MODIFIED) {
            Example entity = repository.findByIdAndBusinessId(request.getId(), businessId)
                .orElseThrow(() -> new RuntimeException("Not found"));
            if (!request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("Record modified by another user"); // optimistic lock
            }
            // update fields
        } else if (state == EntityState.DELETED) {
            // soft delete: entity.setIsDelete(true)
        }
        return entity.getId();
    }
}
```

### 11.2 กฎบังคับฝั่ง Backend

1. **Import class ที่ top ของไฟล์เสมอ** — ห้ามใช้ fully-qualified class name แทรกในเนื้อโค้ด (`com.softinter.sicapi.dto...Xxx` แบบ inline)
2. ทุก write operation ต้องมี `@Transactional`
3. Entity ที่ scope ด้วย business ต้อง extend `BaseBusinessEntity`
4. เช็ค `EntityState` + `rowVersion` ทุกครั้งก่อน update (optimistic locking)
5. Endpoint ที่คืนรายการแบบแบ่งหน้าต้องคืนรูปแบบตรงกับ `PaginationResponse<T>` ฝั่ง frontend เสมอ (ข้อ 3.1) — `data` + `pageable.{pageNumber,pageSize,totalElements,totalPages}`

---

## 12. Checklist: สร้างหน้าใหม่ 1 หน้า

1. [ ] `*.model.ts` — interface ข้อมูล (extends `SicBaseStateModel`) + `XxxPageData`
2. [ ] `*.form.ts` — `static createForm(fb): FormGroup<ToForm<XxxModel>>`
3. [ ] `*.resolver.ts` — ดึงข้อมูลจริง (หรือ preload filter options ถ้าเป็น lazy grid) ห่อ error handling ให้ครบ
4. [ ] `*.service.ts` — เรียก HTTP จริงผ่าน `apiBaseUrl` คืน `Observable<T>` — list ที่แบ่งหน้าคืน `PaginationResponse<T>`
5. [ ] `*.component.ts` — อ่านจาก `route.snapshot.data['key']` เท่านั้น, ใช้ `isSaving`/`isLoading` + `finalize()`, ใช้ `DialogService` สำหรับ popup/error, implement `CanComponentDeactivate` ถ้าเป็นฟอร์ม
6. [ ] เพิ่ม route ใน `*.routes.ts` พร้อม `resolve: { key: xxxResolver }` และ guard ที่จำเป็น
7. [ ] เพิ่ม translation key (ถ้ามีข้อความใหม่) — ถ้าเป็น module ใหม่ให้ตั้ง `APP_TRANSLATE_MODULE_CODE`/`APP_TRANSLATE_PROGRAM_CODE` แทนยัดลง COMMON
8. [ ] ถ้ามี grid: เช็ค `handleGridLoad` มี `finalize` + `setLoadError` + `dialog.error` ครบ, ถ้าไม่ใช้ grid แต่ต้องมี pagination → ใช้ `<sic-pagination>`
9. [ ] ถ้ามีวันที่แสดงผล → ใช้ `DateTimeUtil`/`sicDate`/`sicDateTime` ไม่เขียน formatter เอง

---

## 13. Quick Commands

```bash
# Angular
ng generate component feature/pm/dt/example/example
ng generate service feature/pm/dt/example/example
ng generate resolver feature/pm/dt/example/example

# Typecheck ทั้งโปรเจกต์ (ใช้ค่านี้เวลา memory ไม่พอ)
cd sic-app && node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json

# Spring Boot
./mvnw spring-boot:run
```

---

*ไฟล์นี้เขียนขึ้นหลังจากการตรวจสอบและแก้ไข resolver/error-handling ทั้งโปรเจกต์แบบละเอียด (BU, PMRT, PMDT, Management modules) รวมถึงการสำรวจ shared infrastructure ทั้งหมดใน `core/` — ทุก pattern ที่ระบุไว้อ้างอิงจากโค้ดจริงที่ทำงานได้จริงในโปรเจกต์ ไม่ใช่ทฤษฎี*
