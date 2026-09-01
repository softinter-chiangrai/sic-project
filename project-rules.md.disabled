```txt
# SIC Project - AI Development Rules

กฎและแนวทางปฏิบัติสำหรับการพัฒนาโปรเจกต์ SIC (Smart Integrated Control)
ใช้เป็นมาตรฐานสำหรับ AI Model และนักพัฒนาในการสร้างหรือปรับปรุงโค้ด

---

## Core Principles

1. **Standalone Components** - Angular components must be standalone, no NgModules
2. **Reactive Forms** - Use `ReactiveFormsModule` with `FormGroup` and `FormControl`
3. **ControlValueAccessor** - All form components must implement `ControlValueAccessor`
4. **EntityState Pattern** - Use `SicEntityState` (0-4) for CRUD operations
5. **SicFromData Wrapper** - Wrap FormGroup with `SicFromData<T>` for state management
6. **Bilingual Support** - All UI text must support Thai (th) and English (en)
7. **Soft Delete** - Use `isDelete` flag instead of hard delete
8. **Business Context** - All data must be scoped to `businessId`
9. **Signals** - Use Angular Signals for reactive state (prefer over plain RxJS when possible)
10. **HttpClient & Signals** - Use `HttpClient` with `toSignal` or `resource`/`httpResource` for data fetching and state management

---

## UI Component Policy

1. **Primary Component Library** - Use `sic-ng` as the main UI component library for all standard UI elements (inputs, buttons, comboboxes, datepickers, grids, etc.)
2. **Read sic-ng-skill.md** - Before implementing any UI, review the `sic-ng-skill.md` file for available components, their usage, and best practices
3. **Custom Components** - When creating custom components, place them in the `src/app/core/component/` folder for reusability across the application
4. **Component Reuse** - Always check existing `sic-ng` components before creating a custom component to avoid reinventing the wheel
5. **Component Documentation** - Custom components should follow the same pattern and coding standards as `sic-ng` components

---

## 1. Architecture Overview

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Angular 22+ (Standalone, Signals) | `sic-app` |
| **Backend** | Spring Boot 3.x (JPA, REST, WebSocket) | `sic-spring/sic` |
| **Authentication** | Keycloak (OAuth2 / OIDC) | `sic-auth` |
| **Database** | PostgreSQL | `sic-database` |
| **File Storage** | MinIO (S3-compatible) | `sic-storage` |
| **Data Fetching** | HttpClient + Signals (`toSignal`, `resource`, `httpResource`) | Native Angular |

---

## 2. Naming Conventions

### 2.1 Frontend Naming

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Component | `PascalCase` + `Component` | `Burt01Component`, `Pmdt06Component` |
| Service | `camelCase` + `Service` | `burt01Service`, `ApprovalService` |
| Model (interface) | `PascalCase` + `Model` | `Burt01Model`, `CustomerModel` |
| Form Class | `PascalCase` + `Form` | `Burt01Form`, `Pmrt01AForm` |
| Resolver | `camelCase` + `Resolver` | `burt01Resolver`, `customerEditResolver` |
| Routes file | `*.routes.ts` | `bu.routes.ts`, `pm.routes.ts` |

### 2.2 Backend Naming

| Layer | Pattern | Example |
| :--- | :--- | :--- |
| Controller | `XxxController` | `PmRequirementController` |
| Service Interface | `XxxService` | `PmRequirementService` |
| Service Impl | `XxxServiceImpl` | `PmRequirementServiceImpl` |
| Repository | `XxxRepository` | `PmRequirementRepository` |
| Entity | `Xxx` (PascalCase) | `PmRequirement`, `SuBusiness` |
| Request DTO | `XxxRequest` | `PmRequirementRequest` |
| Response DTO | `XxxResponse` | `PmRequirementResponse` |
| Enum | `Xxx` (PascalCase) | `EntityState`, `ApprovalStatus` |

### 2.3 Database Naming

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Table | `snake_case` with module prefix | `pm_requirement`, `su_business` |
| Column | `snake_case` | `business_id`, `created_date` |
| Primary Key | `id` (UUID) | `id` |
| Foreign Key | `{table}_id` | `project_id`, `business_id` |

---

## 3. Module & Feature Organization

### 3.1 Frontend Directory Structure

```
src/app/
├── core/                    # Shared (ต้องใช้ซ้ำหลายที่)
│   ├── auth/                # Authentication
│   ├── component/           # sic-* reusable components + custom components
│   ├── guard/               # Route guards
│   ├── interceptor/         # HTTP interceptors
│   ├── model/               # Base models
│   ├── services/            # Core services
│   └── validator/           # Custom validators
├── feature/                 # Feature modules
│   ├── bu/                  # Business Unit
│   │   ├── rt/              # Transaction pages (burt01, burt02...)
│   │   └── rp/              # Report pages (burp01...)
│   ├── pm/                  # Project Management
│   │   ├── dt/              # Data Transaction (pmdt01, pmdt02...)
│   │   └── rt/              # Report/List (pmrt01, pmrt02...)
│   └── su/                  # System Utility
├── management/              # Business/Profile management
└── main/                    # Public pages
```

### 3.2 Backend Package Structure

```
com.softinter.sicapi/
├── config/                  # Configuration classes
├── controller/              # REST Controllers
│   ├── auth/                # Authentication endpoints
│   ├── basic/               # Core endpoints (Profile, Business, Menu)
│   ├── db/                  # Database parameter endpoints
│   ├── ex/                  # Example module
│   ├── pm/                  # Project Management
│   ├── storage/             # File storage
│   └── su/                  # System utility
├── dto/                     # Data Transfer Objects
│   ├── request/             # Request DTOs
│   └── response/            # Response DTOs
├── entity/                  # JPA Entities
│   ├── base/                # BaseEntity, BaseBusinessEntity
│   ├── db/                  # Database reference entities
│   ├── enums/               # Enums
│   ├── ex/                  # Example entities
│   ├── pm/                  # Project Management entities
│   └── su/                  # System utility entities
├── exception/               # Custom exceptions
├── interceptor/             # Interceptors
├── repository/              # Spring Data JPA repositories
├── service/                 # Service interfaces
│   └── impl/                # Service implementations
├── util/                    # Utility classes
└── websocket/               # WebSocket controllers
```

---

## 4. Page & Form Pattern (Standard)

**ไฟล์ที่ต้องสร้างสำหรับ 1 หน้า:**

| File | Purpose |
| :--- | :--- |
| `*.model.ts` | Interface + `FormData` wrapper |
| `*.form.ts` | `FormGroup` factory |
| `*.resolver.ts` | Data loader (Create/Edit) – *optional* |
| `*.service.ts` | API calls (returns `Observable<T>`) |
| `*.component.ts` | Component logic |
| `*.component.html` | Template |

### 4.1 Model Template

```typescript
// example.model.ts
import { SicBaseStateModel } from '../../../core/model/sic-base-model';
import { SicFromData } from '../../../core/model/sic-from-data';

export interface ExampleFormData {
  example: SicFromData<ExampleModel>;
}

export interface ExampleModel extends SicBaseStateModel {
  id: string;
  code: string;
  nameEn: string;
  nameLocal: string;
  isActive: boolean;
}
```

### 4.2 Form Template

```typescript
// example.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';
import { ExampleModel } from './example.model';

export class ExampleForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<ExampleModel>> {
    return fb.group<ToForm<ExampleModel>>({
      id: fb.control(null),
      code: fb.control(null, [Validators.required, Validators.maxLength(50)]),
      nameEn: fb.control(null, [Validators.required]),
      nameLocal: fb.control(null, [Validators.required]),
      isActive: fb.control(true),
      state: fb.control(null),      // SicEntityState
      rowVersion: fb.control(null),
    });
  }
}
```

### 4.3 Resolver Template (Optional)

> **Note:** With Angular 22+ and Signals, resolvers are optional. Data can be loaded directly in the component using `httpResource`, `toSignal`, or `resource`. However, if you prefer a resolver, use the traditional approach with `HttpClient`.

**Traditional resolver (using HttpClient):**

```typescript
// example.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { catchError, EMPTY, tap } from 'rxjs';
import { ExampleService } from './example.service';
import { ExampleForm } from './example.form';
import { SicFromData } from '../../../core/model/sic-from-data';

export const exampleEditResolver: ResolveFn<ExampleFormData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(ExampleService);
  const form = ExampleForm.createForm(fb);

  return service.getById(route.params['id']).pipe(
    tap((data) => form.patchValue(data)),
    map(() => ({ example: new SicFromData<ExampleModel>(form) })),
    catchError(() => { router.navigate(['/not-found']); return EMPTY; })
  );
};
```

**Alternative – no resolver, load data in component (recommended):** See section 4.4.

### 4.4 Component Template (with HttpClient + Signals)

**Option A: Using `httpResource` (recommended for GET requests)**

```typescript
// example.component.ts
import { Component, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http'; // Angular 22+
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DialogService } from '../../../core/services/dialog.service';
import { ExampleService } from './example.service';
import { ExampleForm } from './example.form';
import { SicFromData } from '../../../core/model/sic-from-data';
import { ExampleModel } from './example.model';
import { CanComponentDeactivate } from '../../../core/guard/can-deactivate.guard';

@Component({...})
export class ExampleComponent implements CanComponentDeactivate {
  private service = inject(ExampleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData!: SicFromData<ExampleModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isSaved = false;

  // Load data using httpResource (auto-refetches when id changes)
  dataResource = httpResource<ExampleModel>(
    () => {
      const id = this.id();
      return id ? `/api/ex/examples/${id}` : null;
    },
    { enabled: !!this.id() }
  );

  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    this.formData = new SicFromData<ExampleModel>(ExampleForm.createForm(this.fb));

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.id.set(id);
    }

    // Patch form when data loads (using formData.patchValue to auto-update snapshot baseline)
    effect(() => {
      const data = this.dataResource.value();
      if (data) {
        this.formData.patchValue(data);
      }
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.service.save(this.formData.value).subscribe({
      next: () => {
        this.isSaved = true;
        this.formData.markAsPristine();
        this.dialog.success('Saved successfully').then(() => {
          this.router.navigate(['..']);
        });
      },
      error: (err) => this.dialog.error('Error', err.message),
      complete: () => this.isSaving.set(false),
    });
  }
}
```

**Option B: Using `toSignal` with HttpClient**

```typescript
// example.component.ts (alternative)
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// ... inside component
private http = inject(HttpClient);

dataSignal = toSignal(
  this.http.get<ExampleModel>(`/api/ex/examples/${this.id()}`).pipe(
    // optional mapping
  ),
  { initialValue: null }
);

// Use dataSignal() in template or effect
effect(() => {
  const data = this.dataSignal();
  if (data) {
    this.formData.form.patchValue(data);
  }
});
```

**Option C: Using `resource` for more control**

```typescript
import { resource } from '@angular/core';

dataResource = resource({
  request: () => ({ id: this.id() }),
  loader: ({ request }) => 
    this.http.get<ExampleModel>(`/api/ex/examples/${request.id}`)
});
```

### 4.5 Service Template

```typescript
// example.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../core/config/api.config';
import { ExampleModel } from './example.model';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);

  getById(id: string): Observable<ExampleModel> {
    return this.http.get<ExampleModel>(`${apiBaseUrl}/api/ex/examples/${id}`);
  }

  getList(params: { page: number; size: number; keyword?: string }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());
    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    return this.http.get(`${apiBaseUrl}/api/ex/examples/paging`, { params: httpParams });
  }

  save(data: Partial<ExampleModel>): Observable<ExampleModel> {
    return this.http.post<ExampleModel>(`${apiBaseUrl}/api/ex/examples/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/ex/examples/${id}`);
  }
}
```

### 4.6 Route Template

```typescript
// example.routes.ts
import { Routes } from '@angular/router';
import { ExampleComponent } from './example.component';
import { CanDeactivateGuard } from '../../../core/guard/can-deactivate.guard';
import { exampleEditResolver } from './example.resolver'; // optional

export const routes: Routes = [
  {
    path: 'example',
    children: [
      {
        path: 'new',
        component: ExampleComponent,
        // No resolver – component handles empty state
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: ':id/edit',
        component: ExampleComponent,
        // Resolver optional – data can be loaded inside component
        resolve: { form: exampleEditResolver }, // optional
        canDeactivate: [CanDeactivateGuard],
      },
    ]
  }
];
```

---

## 5. Core Components (sic-ng)

**Primary UI Library:** `sic-ng`

**Documentation:** Before using any component, review `sic-ng-skill.md` for:
- Available components and their usage
- Input properties and output events
- Examples and best practices
- Theme and styling options

**Key Components:**

| Component | Use Case | Form Value |
| :--- | :--- | :--- |
| `sic-input` | Text input (with mask) | `string` |
| `sic-number` | Numeric input | `number \| null` |
| `sic-input-area` | Multi-line text | `string` |
| `sic-input-phone` | Phone number | `string` (e.g., `+66-0812345678`) |
| `sic-combobox` | Searchable dropdown | `any` (valueField) |
| `sic-datepicker` | Date picker | `string` (ISO) |
| `sic-timepicker` | Time picker | `string` (HH:mm) |
| `sic-checkbox` | Checkbox | `any` (checkedValue) |
| `sic-radio` | Radio group | `any` |
| `sic-colorpicker` | Color picker | `string` (HEX) |
| `sic-upload` | File upload (drag-drop) | `StorageUploadReference[]` |
| `sic-profile` | Profile picture with crop | `StorageUploadReference[]` |
| `sic-gridpanel` | Editable data grid | — |
| `sic-stepper` | Multi-step wizard | — |
| `sic-approval` | Approval workflow | — |
| `sic-sidebar` | Main layout | — |

**Custom Components:**
- If a required component does not exist in `sic-ng`, create it in `src/app/core/component/`
- Follow the same patterns and coding standards as `sic-ng` components
- Document the component for future reuse

---

## 6. EntityState (CRUD Pattern)

```typescript
export enum SicEntityState {
  Detached = 0,
  Unchanged = 1,
  Deleted = 2,
  Modified = 3,
  Added = 4,
}
```

```java
public enum EntityState {
    DETACHED(0),
    UNCHANGED(1),
    DELETED(2),
    MODIFIED(3),
    ADDED(4);
}
```

**Rules:**
- `ADDED (4)` → Create new record
- `MODIFIED (3)` → Update existing (requires `id` + `rowVersion`)
- `DELETED (2)` → Soft delete (set `isDelete = true`)
- `UNCHANGED (1)` → No action
- `DETACHED (0)` → Default state

---

## 7. Bilingual System (i18n)

### Database: `su_message`

| Column | Description |
| :--- | :--- |
| `module_code` | Group name (COMMON, EX, PM) |
| `program_code` | Sub-group (ALL, EXAMPLE) |
| `message_code` | Key name (SAVE, TITLE) |
| `message_en` | English text |
| `message_local` | Thai text |

### API
```
GET /api/i18n/{module_code}/{program_code}/{language_code?}
```

### Usage
```html
{{ 'COMMON.ALL.SAVE' | translate }}
<span translate>COMMON.ALL.CANCEL</span>
```

### Set Context (Resolver)
```typescript
translateLoader.setContext('EX', 'EXAMPLE');
```

---

## 8. Route Guards

| Guard | Purpose |
| :--- | :--- |
| `authGuard` | Must be logged in |
| `profileGuard` | Must have profile |
| `businessGuard` | Must have active business |
| `customerGuard` | Must select customer |
| `projectGuard` | Must select project |
| `requirementGuard` | Must select requirement |
| `CanDeactivateGuard` | Prevent leaving dirty form (`pageDirty()`, `isChanged`, bypass on `isSaved`/`isSaving`/`isView`) |

### CanDeactivateGuard & Form State Standards:
1. **Programmatic Values:** When loading API data or pre-filling form values programmatically, ALWAYS use `this.formData.patchValue(data)`. This automatically updates the form and re-snapshots the pristine baseline without triggering false dirty warnings.
2. **User Edits:** Changes typed/clicked by the user automatically set `formData.isChanged = true`.
3. **Saving & Navigation:** Set `this.isSaved = true;` inside the successful save response block so navigation to other pages is never blocked.

---

## 9. GridPanel Configuration

```typescript
readonly gridConfig: SicGridPanelConfig = {
  api: `${apiBaseUrl}/api/ex/examples/paging`,
  id: 'id',
  saveApi: `${apiBaseUrl}/api/ex/examples/grid-save`,
  saveMethod: 'POST',
  savePayload: (row, state) => ({
    id: row['id'] ?? null,
    exampleCode: row['exampleCode'] ?? '',
    state,  // 2=Deleted, 3=Modified, 4=Added
  }),
  pageable: true,
  pageSize: 10,
  softDelete: true,
  columns: [
    {
      label: 'รหัส',
      name: 'exampleCode',
      type: 'text',
      editable: true,
      sortable: true,
      validators: [Validators.required],
      errorMessages: { required: 'กรุณากรอกรหัส' },
    },
  ],
};
```

**Supported Column Types:** `text`, `number`, `area`, `date`, `time`, `checkbox`, `radio`, `combobox`, `color`, `upload`, `button`

---

## 10. Backend Patterns

### 10.1 Service Implementation

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ExampleServiceImpl implements ExampleService {
    private final ExampleRepository repository;

    @Override
    @Transactional
    public UUID save(ExampleRequest request, UUID businessId, String userId) {
        EntityState state = EntityState.values()[request.getState()];
        Example entity;

        if (state == EntityState.ADDED) {
            entity = new Example();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            // map fields...
            entity = repository.save(entity);
        } else if (state == EntityState.MODIFIED) {
            entity = repository.findByIdAndBusinessId(request.getId(), businessId)
                .orElseThrow(() -> new RuntimeException("Not found"));
            
            if (!request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("Record modified by another user");
            }
            // map fields...
            entity = repository.save(entity);
        } else if (state == EntityState.DELETED) {
            entity = repository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Not found"));
            entity.setIsDelete(true);
            entity.setDeleteBy(userId);
            entity.setDeleteDate(Instant.now());
            repository.save(entity);
            return entity.getId();
        }
        return entity.getId();
    }
}
```

### 10.2 Repository

```java
@Repository
public interface ExampleRepository extends JpaRepository<Example, UUID>, JpaSpecificationExecutor<Example> {
    Optional<Example> findByIdAndBusinessId(UUID id, UUID businessId);
}
```

### 10.3 Controller

```java
@RestController
@RequestMapping("/api/ex/examples")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Example", description = "Example API")
public class ExampleController {
    
    @PostMapping("/save")
    public ResponseEntity<UUID> save(@RequestBody ExampleRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(service.save(request, businessId, userId));
    }
}
```

---

## 11. Approval System

### Status Flow
```
PENDING → PARTIALLY_APPROVED → APPROVED
                          ↘ REJECTED
                          ↘ NEED_REVISION → (resubmit)
                          ↘ CANCELLED
```

### Submit for Approval
```typescript
this.approvalService.submitForApproval({
  documentType: 'REQUIREMENT',
  documentId: id,
  documentCode: code,
  documentTitle: title,
  flowId: selectedFlowId,
  comment: 'Ready for review',
});
```

### Approval Component
```html
<sic-approval
  documentType="REQUIREMENT"
  [documentId]="reqId"
  [documentCode]="reqCode"
  [documentTitle]="reqTitle"
  (statusChange)="onStatusChange($event)"
  (actionTaken)="onActionTaken($event)"
></sic-approval>
```

---

## 12. Quick Commands

### Angular
```bash
ng generate component feature/pm/dt/example/example
ng generate service feature/pm/dt/example/example
ng generate resolver feature/pm/dt/example/example
ng generate interface feature/pm/dt/example/example
ng generate class feature/pm/dt/example/example   # Form class
```

### Spring Boot
```bash
./mvnw spring-boot:run
./mvnw clean package
```

---

## 13. Checklist: New Page

1. [ ] Create `*.model.ts` (Interface + FormData)
2. [ ] Create `*.form.ts` (FormGroup factory)
3. [ ] Create `*.resolver.ts` (Create / Edit) – optional
4. [ ] Create `*.service.ts` (API calls returning `Observable<T>`)
5. [ ] Create `*.component.ts` / `*.component.html`
6. [ ] Add Route in `*.routes.ts`
7. [ ] Add translation keys (if needed)
8. [ ] Add menu item (if new)
9. [ ] Apply guards (auth, business, CanDeactivateGuard)
10. [ ] Use `SicFromData` for form state management
11. [ ] Use `httpResource`, `toSignal`, or `resource` for data fetching (preferred)
12. [ ] Use `HttpClient` for mutations and manage loading/error states with signals

---

## 14. Essential Rules

1. **Use SicFromData** for all form state management
2. **Use SicEntityState** for CRUD operations
3. **Use CanDeactivateGuard** for dirty forms
4. **Use DialogService** for all popups (success, error, confirm)
5. **Use DateTimeUtil** for date handling
6. **Use HttpParams** instead of string concatenation for query parameters
7. **Backend:** Check `EntityState` and `rowVersion` for optimistic locking
8. **Backend:** Use `BaseBusinessEntity` for business-scoped data
9. **Backend:** All writes must use `@Transactional`
10. **Database:** Use soft delete (`isDelete = true`) never hard delete
11. **File upload:** Use `StorageUploadReference[]` for file fields
12. **Enums:** Frontend `SicEntityState` ↔ Backend `EntityState` must match values
13. **Error messages:** Use `errorMessages` object with validator keys
14. **Data Fetching:** Prefer `httpResource`, `toSignal`, or `resource` over manual `HttpClient` subscriptions in components
15. **Signals:** Use signals for reactive state instead of plain variables
16. **Mutations:** Use `HttpClient` directly and manage loading/error states with signals (e.g., `isSaving`, `errorMessage`)
17. **Avoid Resolvers when possible:** Load data directly in components using `httpResource` or `toSignal` for better reactivity and simpler code
18. **Backend Import Standards:** Always import classes at the top of the file (e.g., `import com.softinter.sicapi.dto.response.UserStatusResponse;`). Do NOT use inline fully qualified class names in code bodies (e.g., forbidden: `com.softinter.sicapi.dto.response.UserStatusResponse payload = com.softinter.sicapi.dto.response.UserStatusResponse.builder()`).
19. **Form Dirty & Navigation Standard:** Always use `formData.patchValue()` for programmatic data loading/pre-fill, use `formData.isChanged` (via `SicFromData`) for dirty tracking, and set `isSaved = true` upon successful submission before navigating away.

---

## 15. Data Fetching and State Management with Signals

### 15.1 Setup

Provide `HttpClient` in your application:

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    // ... other providers
  ],
};
```

### 15.2 Using `httpResource` (Recommended for GET)

`httpResource` is a built-in Angular API (available since v19) that simplifies fetching data and provides reactive state (value, isLoading, error, status, etc.).

```typescript
import { Component, inject, signal, effect } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Component({
  template: `
    @if (resource.isLoading()) { <div>Loading...</div> }
    @if (resource.error()) { <div class="error">{{ resource.error()?.message }}</div> }
    @if (resource.value(); as data) {
      <div>{{ data.name }}</div>
    }
  `
})
export class ExampleComponent {
  private http = inject(HttpClient);
  id = signal<string | null>(null);

  resource = httpResource<ExampleModel>(
    () => this.id() ? `/api/ex/examples/${this.id()}` : null,
    { enabled: !!this.id() }
  );

  // Access signals:
  // resource.value() - data
  // resource.isLoading() - boolean
  // resource.error() - error
  // resource.status() - 'idle' | 'loading' | 'error' | 'success'
}
```

**With custom request options:**

```typescript
resource = httpResource<ExampleModel>({
  url: () => `/api/ex/examples/${this.id()}`,
  method: 'GET',
  headers: { 'X-Custom': 'value' },
  enabled: !!this.id(),
  // onError: (err) => ...
});
```

### 15.3 Using `toSignal` with HttpClient

If you prefer more control or need to compose observables, use `toSignal` from `@angular/core/rxjs-interop`.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({...})
export class ExampleComponent {
  private http = inject(HttpClient);
  id = input<string>();

  data = toSignal(
    this.http.get<ExampleModel>(`/api/ex/examples/${this.id()}`).pipe(
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  // Access: data() => ExampleModel | null
}
```

**With computed signals for derived state:**

```typescript
isLoading = signal(false);
error = signal<string | null>(null);

data = toSignal(
  this.http.get<ExampleModel>(`/api/ex/examples/${this.id()}`).pipe(
    tap({ 
      next: () => { this.isLoading.set(false); this.error.set(null); },
      error: (err) => { this.isLoading.set(false); this.error.set(err.message); },
      subscribe: () => this.isLoading.set(true)
    })
  ),
  { initialValue: null }
);
```

### 15.4 Using `resource` for Complex Async Operations

For operations that combine multiple sources or need custom loading logic, use `resource` from `@angular/core`.

```typescript
import { resource } from '@angular/core';

@Component({...})
export class ExampleComponent {
  private http = inject(HttpClient);
  id = signal<string | null>(null);

  dataResource = resource({
    request: () => ({ id: this.id() }),
    loader: ({ request }) => {
      if (!request.id) return of(null);
      return this.http.get<ExampleModel>(`/api/ex/examples/${request.id}`);
    }
  });

  // Access: dataResource.value(), dataResource.isLoading(), dataResource.error()
}
```

### 15.5 Handling Mutations (POST, PUT, DELETE)

For mutations, use `HttpClient` directly and manage loading/error states with signals.

```typescript
import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({...})
export class ExampleComponent {
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private router = inject(Router);

  isSaving = signal(false);
  saveError = signal<string | null>(null);

  save(data: Partial<ExampleModel>): void {
    this.isSaving.set(true);
    this.saveError.set(null);

    this.http.post<ExampleModel>('/api/ex/examples/save', data).subscribe({
      next: (response) => {
        this.dialog.success('Saved successfully');
        this.router.navigate(['..']);
      },
      error: (err) => {
        this.saveError.set(err.message);
        this.dialog.error('Error', err.message);
      },
      complete: () => this.isSaving.set(false)
    });
  }

  delete(id: string): void {
    this.dialog.confirm('Delete?', 'Are you sure?').subscribe((confirmed) => {
      if (!confirmed) return;
      this.isSaving.set(true);
      this.http.delete(`/api/ex/examples/${id}`).subscribe({
        next: () => {
          this.dialog.success('Deleted');
          // refresh list, etc.
        },
        error: (err) => this.dialog.error('Error', err.message),
        complete: () => this.isSaving.set(false)
      });
    });
  }
}
```

### 15.6 Error Handling and Loading States

**Using `httpResource`:**

```html
@if (resource.isLoading()) {
  <div class="spinner">Loading...</div>
}
@if (resource.error()) {
  <div class="alert alert-danger">{{ resource.error()?.message }}</div>
}
@if (resource.value(); as data) {
  <!-- render data -->
}
```

**Manual with signals:**

```typescript
isLoading = signal(false);
error = signal<string | null>(null);

loadData() {
  this.isLoading.set(true);
  this.error.set(null);
  this.http.get('/api/data').subscribe({
    next: (data) => { /* handle data */ },
    error: (err) => this.error.set(err.message),
    complete: () => this.isLoading.set(false)
  });
}
```

### 15.7 Caching and Refetching

- **`httpResource`** automatically caches responses and refetches when the request URL changes.
- **Manual refetch:** `resource.refetch()` triggers a reload.
- **`toSignal`** does not cache by default; you can implement caching via `shareReplay(1)` or using `resource`.

**Example with manual refetch:**

```typescript
resource = httpResource<ExampleModel>(...);

refresh() {
  this.resource.refetch();
}
```

### 15.8 Combining with `SicFromData`

**Load then patch form:**

```typescript
ngOnInit() {
  this.formData = new SicFromData<ExampleModel>(ExampleForm.createForm(this.fb));

  // Using httpResource
  effect(() => {
    const data = this.resource.value();
    if (data) {
      this.formData.form.patchValue(data);
    }
  });
}
```

**Save using service and reset form state:**

```typescript
save() {
  this.isSaving.set(true);
  this.service.save(this.formData.value).subscribe({
    next: (response) => {
      this.formData.markAsPristine(); // reset dirty state
      this.dialog.success('Saved');
    },
    error: (err) => this.dialog.error('Error', err.message),
    complete: () => this.isSaving.set(false)
  });
}
```

### 15.9 Best Practices for SIC with HttpClient + Signals

1. **Prefer `httpResource`** for simple GET requests – it provides loading, error, and status signals out-of-the-box.
2. **Use `toSignal`** when you need to compose observables or add custom RxJS operators.
3. **Avoid manual subscriptions** in components – use `httpResource`, `toSignal`, or `resource` to convert to signals.
4. **Manage loading/error states** with dedicated signals (`isLoading`, `error`) for mutations.
5. **Use `HttpParams`** for building query parameters – it handles encoding and null values safely.
6. **Invalidate/refetch** data after mutations by calling `resource.refetch()` or reloading the route.
7. **Combine with `SicFromData`** for form state management – load data via resource, patch form, and save via service.
8. **Use `effect`** to react to changes in signals (e.g., when data loads, patch form).
9. **Use `computed`** for derived state based on signals.
10. **Keep services** as the single source of truth for API calls – components should only interact with services.
11. **Use `provideHttpClient` with interceptors** for global error handling, authentication, and logging.
12. **Leverage Angular's new control flow** (`@if`, `@for`, `@switch`) with signals for cleaner templates.

### 15.10 Example: Full Component with HttpClient + Signals

```typescript
// example.component.ts
import { Component, inject, signal, effect, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DialogService } from '../../../core/services/dialog.service';
import { ExampleService } from './example.service';
import { ExampleForm } from './example.form';
import { SicFromData } from '../../../core/model/sic-from-data';
import { ExampleModel } from './example.model';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="formData.form">
      @if (dataResource.isLoading()) {
        <div class="loading-spinner">Loading...</div>
      }
      @if (dataResource.error()) {
        <div class="alert alert-danger">{{ dataResource.error()?.message }}</div>
      }
      @if (dataResource.value(); as data) {
        <sic-input formControlName="code" label="Code"></sic-input>
        <sic-input formControlName="nameEn" label="Name (EN)"></sic-input>
        <sic-input formControlName="nameLocal" label="Name (TH)"></sic-input>
      }
      <button sic-button (click)="save()" [disabled]="isSaving()">
        {{ isSaving() ? 'Saving...' : 'Save' }}
      </button>
    </form>
  `
})
export class ExampleComponent {
  private service = inject(ExampleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);

  formData = new SicFromData<ExampleModel>(ExampleForm.createForm(this.fb));
  id = signal<string | null>(null);
  isSaving = signal(false);

  // Load data using httpResource
  dataResource = httpResource<ExampleModel>(
    () => {
      const id = this.id();
      return id ? `/api/ex/examples/${id}` : null;
    },
    { enabled: !!this.id() }
  );

  ngOnInit() {
    this.id.set(this.route.snapshot.params['id'] || null);

    // Patch form when data loads
    effect(() => {
      const data = this.dataResource.value();
      if (data) {
        this.formData.form.patchValue(data);
        this.formData.markAsPristine();
      }
    });
  }

  save() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.service.save(this.formData.value).subscribe({
      next: () => {
        this.dialog.success('Saved successfully');
        this.formData.markAsPristine();
        this.dataResource.refetch(); // refresh if needed
        this.router.navigate(['..']);
      },
      error: (err) => this.dialog.error('Error', err.message),
      complete: () => this.isSaving.set(false)
    });
  }
}
```
**End of Document**