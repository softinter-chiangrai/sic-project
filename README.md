# SIC Project

**SIC** is a comprehensive, enterprise-level application system designed with a modern microservices architecture. It combines a powerful backend API with an intuitive frontend application, integrated identity management, scalable database infrastructure, and distributed file storage capabilities.

## Project Overview

The SIC project is a full-stack solution built with:
- **Backend**: ASP.NET Core Web API (.NET 10)
- **Frontend**: Angular 21 Single Page Application with Server-Side Rendering (SSR)
- **Authentication**: Keycloak Identity and Access Management
- **Database**: PostgreSQL with Entity Framework Core
- **Storage**: SeaweedFS (S3-compatible object storage)

---

## Project Structure

The SIC project is organized into five main service directories:

### 1. **sic-api** - Backend Web API
**Path**: `/sic-api`

The core REST API service built with ASP.NET Core (.NET 10) that powers the entire application.

#### Key Technologies:
- **Framework**: ASP.NET Core 10.0
- **ORM**: Entity Framework Core 10.0
- **Database**: PostgreSQL 17 (via Npgsql)
- **Authentication**: Keycloak with JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI
- **Architecture Patterns**: 
  - MediatR for CQRS pattern
  - AutoMapper for object mapping
  - FluentValidation for request validation
- **Cloud Integration**: AWS S3 SDK
- **CORS**: Configured for Angular frontend at `http://localhost:4200`

#### Core Features:
- **Authentication Module** (`/Controllers/Auth`): Handles user authentication and authorization
- **Database Module** (`/Controllers/Db`): Manages core database entities
  - Countries (DbCountry)
  - Titles (DbTitle)
  - Parameters (DbParameter)
- **Examples Module** (`/Controllers/Ex`): Reference and example data management
- **Storage Module** (`/Controllers/Storage`): File upload, management, and retrieval
  - Media processing (images and videos)
  - Resumable uploads
  - Temporary upload cleanup
- **Supervisory Unit Module** (`/Controllers/Su`): Management of organizational units/profiles

#### Architecture Components:
- **Entities**: Data models with base classes (`BaseEntity`, `BaseBusinessEntity`)
- **Features**: Organized by business domain using feature folder structure
- **Services**: 
  - BusinessAccessService: Business-level access control
  - CurrentUserService: User context management
  - FileStorageService: File operations with SeaweedFS
  - MediaProcessingService: Image and video processing
  - ResumableUploadService: Chunked file uploads
  - ProgramAccessService: Program/application access management
- **Middleware**: Custom request/response processing
- **Filters**: Including authorization and storage response filters
- **Behaviors**: Validation behavior for MediatR pipeline

#### Configuration:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "PostgreSQL connection to sic_app database"
  },
  "Keycloak": {
    "realm": "sic-project",
    "auth-server-url": "http://localhost:8080/",
    "resource": "sic-app"
  },
  "Storage": {
    "ServiceUrl": "http://localhost:8888",
    "ImageBucket": "public-files",
    "VideoBucket": "public-files",
    "DocumentBucket": "documents"
  }
}
```

#### API Documentation:
Swagger UI is available at `http://localhost:5000/swagger` with full API documentation and the ability to test endpoints with Bearer token authentication.

---

### **sic-api Development Guide**

#### **1. Creating Entities**

Entities are data models that map to database tables. All entities inherit from either `BaseEntity` or `BaseBusinessEntity`.

**BaseEntity** - For system-wide reference data (Countries, Titles, Parameters):
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Entities.Db;

[Index(nameof(ModuleCode), nameof(ParameterCode), nameof(ParameterValue), IsUnique = true)]
[Table("db_parameter")]
public class DbParameter : BaseEntity
{
    [Required]
    [MaxLength(50)]
    [Column("module_code")]
    public string ModuleCode { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column("parameter_code")]
    public string ParameterCode { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("parameter_name_en")]
    public string ParameterNameEn { get; set; } = default!;

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("sort_order")]
    public int SortOrder { get; set; }
}
```

**BaseBusinessEntity** - For multi-tenant business-specific data:
- Inherits all BaseEntity properties
- Adds `BusinessId` (Guid) for tenant isolation
- Tracked via `X-Business-Id` header in requests
- Automatically filtered by current business

**Key Attributes Used:**
- `[Table("table_name")]`: Maps to database table
- `[Column("column_name")]`: Maps to database column in snake_case
- `[Index(...)]`: Creates database indexes (supports unique constraints)
- `[Required]`: Marks field as NOT NULL
- `[MaxLength(n)]`: Enforces string length
- `uint RowVersion`: Automatic optimistic concurrency control

**Conventions:**
- Use `Guid.CreateVersion7()` for primary keys
- Prefix entities by domain: `Db*`, `Ex*`, `Su*`
- Use snake_case for database columns
- Include `CreatedBy`, `CreatedDate`, `UpdatedBy`, `UpdatedDate` from base class
- Use `IsDelete` soft-delete pattern (not hard delete)

---

#### **2. Creating Data Layer (DbContext)**

The `SicDbContext` manages all database interactions using Entity Framework Core.

**Structure**:
```csharp
// Data/SicDbContext.cs
public partial class SicDbContext : DbContext
{
    private Guid? CurrentBusinessId 
        => Guid.TryParse(httpContextAccessor.HttpContext?.Request.Headers["X-Business-Id"], 
                         out var businessId) ? businessId : (Guid?)null;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SicDbContext).Assembly);
        
        // Configure modules
        ConfigureDbModule(modelBuilder);
        ConfigureExModule(modelBuilder);
        ConfigureSuModule(modelBuilder);
        
        // Global configurations
        ApplyRowVersionConfiguration(modelBuilder);
        ApplyGlobalQueryFilters(modelBuilder);
    }
}

// Data/SicDbContext.Db.cs - Domain-specific configuration
public partial class SicDbContext : DbContext
{
    public DbSet<DbParameter> DbParameters { get; set; }
    public DbSet<DbCountry> DbCountries { get; set; }
    public DbSet<DbTitle> DbTitles { get; set; }

    private void ConfigureDbModule(ModelBuilder modelBuilder)
    {
        // Configure relationships, indexes, constraints
    }
}
```

**Configuration Patterns:**
- **Row Version**: Automatic concurrency token for optimistic locking
- **Global Query Filters**: Soft-delete and business isolation filters applied automatically
- **Modular Configuration**: Split contexts by domain into separate files

**DbContext Integration**:
```csharp
builder.Services.AddDbContext<SicDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.MigrationsAssembly("sic_api")));
```

---

#### **3. Creating Controllers**

Controllers define API endpoints and delegate business logic to MediatR handlers.

**Pattern**:
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sic_api.Features.Db.Parameter;

namespace sic_api.Controllers.Db;

[Route("api/db/parameter")]
[Authorize]  // Optional: Require JWT token
public class DbParameterController : BaseController
{
    // Inherit from BaseController to get Mediator access
    
    [HttpGet("lov")]
    public async Task<IActionResult> Lov(CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new GetDbParameterLov.Query(), cancellationToken));
    
    [HttpPost]
    public async Task<IActionResult> Create(CreateDbParameter.Command command, CancellationToken cancellationToken) =>
        Created("", await Mediator.Send(command, cancellationToken));
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateDbParameter.Command command, CancellationToken cancellationToken)
    {
        command.Id = id;
        return Ok(await Mediator.Send(command, cancellationToken));
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
        Ok(await Mediator.Send(new DeleteDbParameter.Command { Id = id }, cancellationToken));
}
```

**Key Patterns:**
- Inherit from `BaseController` (provides `Mediator` property)
- Route pattern: `[Route("api/[domain]/[entity]")]`
- Always accept `CancellationToken` for async operations
- Return `IActionResult` for flexible HTTP status codes
- Delegate logic to MediatR handlers (not in controller)
- Use `[Authorize]` for protected endpoints
- Optionally use `[ProgramAuthorize("PERMISSION_CODE")]` for role-based access

---

#### **4. Creating Features (MediatR Pattern)**

Features follow CQRS pattern with MediatR for organizing business logic.

**Folder Structure**:
```
Features/
├── Db/
│   ├── Parameter/
│   │   ├── GetDbParameterLov.cs
│   │   ├── CreateDbParameter.cs
│   │   ├── UpdateDbParameter.cs
│   │   └── DeleteDbParameter.cs
│   ├── Country/
│   └── Title/
├── Ex/
├── Su/
└── Auth/
```

**Pattern - Query (Read Operations)**:
```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using sic_api.Data;
using sic_api.Model;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Db.Parameter;

public static class GetDbParameterLov
{
    // 1. Define the Query (command) - what the client requests
    public class Query : IRequest<LovBase[]>
    {
        public string? SearchText { get; set; }
        public bool? IsActive { get; set; }
    }

    // 2. Define the Handler - business logic execution
    public sealed class Handler : IRequestHandler<Query, LovBase[]>
    {
        private readonly SicDbContext dbContext;
        private readonly IRequestLanguageProvider requestLanguageProvider;

        public Handler(SicDbContext dbContext, IRequestLanguageProvider requestLanguageProvider)
        {
            this.dbContext = dbContext;
            this.requestLanguageProvider = requestLanguageProvider;
        }

        public async Task<LovBase[]> Handle(Query request, CancellationToken cancellationToken)
        {
            var useEnglish = requestLanguageProvider.UseEnglish();

            var query = dbContext.DbParameters.AsQueryable();
            
            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive);

            return await query
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.ParameterValue)
                .Select(x => new LovBase
                {
                    Value = x.Id,
                    Text = useEnglish ? x.ParameterNameEn : x.ParameterNameLocal
                })
                .ToArrayAsync(cancellationToken);
        }
    }

    // 3. Optional: Add validators (automatic validation via pipeline behavior)
    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.SearchText)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.SearchText));
        }
    }
}
```

**Pattern - Command (Write Operations)**:
```csharp
using MediatR;
using FluentValidation;
using sic_api.Data;
using sic_api.Services.Interfaces;

namespace sic_api.Features.Db.Parameter;

public static class CreateDbParameter
{
    public class Command : IRequest<ParameterDto>
    {
        public required string ModuleCode { get; set; }
        public required string ParameterCode { get; set; }
        public required string ParameterValue { get; set; }
        public required string ParameterNameEn { get; set; }
        public required string ParameterNameLocal { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
    }

    public sealed class Handler : IRequestHandler<Command, ParameterDto>
    {
        private readonly SicDbContext dbContext;
        private readonly ICurrentUserService currentUserService;

        public Handler(SicDbContext dbContext, ICurrentUserService currentUserService)
        {
            this.dbContext = dbContext;
            this.currentUserService = currentUserService;
        }

        public async Task<ParameterDto> Handle(Command request, CancellationToken cancellationToken)
        {
            var parameter = new DbParameter
            {
                ModuleCode = request.ModuleCode,
                ParameterCode = request.ParameterCode,
                ParameterValue = request.ParameterValue,
                ParameterNameEn = request.ParameterNameEn,
                ParameterNameLocal = request.ParameterNameLocal,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
                CreatedBy = currentUserService.GetCurrentUser()
            };

            dbContext.DbParameters.Add(parameter);
            await dbContext.SaveChangesAsync(cancellationToken);

            return MapToDto(parameter);
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.ModuleCode)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.ParameterCode)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.ParameterValue)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.ParameterNameEn)
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}
```

**MediatR Pipeline Behaviors:**
- **ValidationBehavior**: Automatic validation before handler execution
- **LoggingBehavior**: Optional request/response logging
- **PerformanceBehavior**: Optional performance tracking

**Best Practices:**
- Use separate `Query` and `Command` classes
- Include nested `Handler` class for related logic
- Include nested `Validator` class for request validation
- Use sealed classes for handlers (prevent inheritance)
- Always include `CancellationToken` parameter
- Return DTOs, not entities
- Use readonly dependencies
- Group related features in domain folders

---



### 2. **sic-app** - Frontend Application
**Path**: `/sic-app`

A modern Angular 21 Single Page Application with Server-Side Rendering capabilities.

#### Key Technologies:
- **Framework**: Angular 21.1.0
- **Build Tool**: Angular CLI 21.1.3
- **SSR**: Angular Universal for server-side rendering
- **Styling**: Tailwind CSS 4.2.1
- **Package Manager**: npm 11.6.1
- **Authentication**: 
  - angular-oauth2-oidc 20.0.2 (OAuth2/OIDC integration)
  - Keycloak authentication flow
- **Internationalization**: ngx-translate (multi-language support)
- **UI Components**:
  - Bootstrap Icons for icon sets
  - Input masking with ngx-mask
- **Utilities**:
  - Day.js for date/time handling
  - RxJS 7.8.0 for reactive programming

#### Core Features:
- **Responsive Design**: Built with Tailwind CSS for mobile-first, responsive layouts
- **Server-Side Rendering**: Pre-rendered Angular Universal application for improved performance and SEO
- **Multi-Language Support**: Built-in internationalization with language switching
- **OAuth2/OIDC Authentication**: Seamless integration with Keycloak for single sign-on
- **Real-time Communication**: RxJS-based reactive state management

#### Project Structure:
```
src/
├── app/              # Main application components and modules
├── environments/     # Environment-specific configurations
├── styles.css        # Global styles with Tailwind imports
├── main.ts          # Bootstrap for development
└── main.server.ts   # Bootstrap for SSR
```

#### Build Commands:
```bash
npm start              # Start development server (http://localhost:4200)
npm run build          # Build for production
npm run watch          # Watch mode for development
npm run test           # Run unit tests
npm run serve:ssr     # Serve with SSR
```

#### Development Server:
The Angular development server runs on `http://localhost:4200` and is pre-configured for API proxy requests to the backend API.

---

### **sic-app Development Guide - Core Structure**

The `src/app/core` folder contains foundational infrastructure, reusable components, services, and utilities used throughout the application.

#### **Folder Structure Overview**

```
src/app/core/
├── auth/                    # Authentication & Authorization
├── component/               # Reusable UI Components (sic-xxx)
├── dayjs.ts                 # Date/Time Configuration
├── directive/               # Custom Directives
├── interceptors/            # HTTP Interceptors
├── model/                   # TypeScript Models & Enums
├── pipes/                   # Custom Pipes
├── services/                # Business Logic Services
└── utils/                   # Utility Functions
```

---

#### **1. Authentication (`auth/` folder)**

Manages OAuth2/OIDC authentication with Keycloak.

**Files:**

- **`auth.config.ts`** - OAuth2 Configuration
  ```typescript
  export const authConfig: AuthConfig = {
    clientId: 'sic-app',
    issuer: 'http://localhost:8080/realms/sic-project',
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email',
    // ... additional OIDC config
  };
  ```

- **`auth.service.ts`** - Authentication Service
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class AuthService {
    async initializeAuth(): Promise<boolean> {
      // Load OIDC discovery document
      // Auto-login if token exists
      // Setup automatic token refresh
    }
    
    login(): void { /* Redirect to Keycloak */ }
    logout(): void { /* Redirect to Keycloak logout */ }
    getToken(): string { /* Get current access token */ }
    isAuthenticated(): boolean { /* Check if user is logged in */ }
  }
  ```

- **`auth.guard.ts`** - Route Guard for Protected Routes
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class AuthGuard implements CanActivateFn {
    canActivate(route, state) {
      // Verify user is authenticated
      // Redirect to login if not
    }
  }
  ```

- **`business.guard.ts`** - Business Context Guard
  - Verifies user has selected a business
  - Sets `X-Business-Id` header for API requests

- **`profile.guard.ts`** - User Profile Validation Guard
  - Ensures user profile is complete
  - Validates required user attributes

- **`auth-callback.component.ts`** - OAuth Callback Handler
  - Handles redirect after Keycloak login
  - Processes authorization code
  - Sets up user session

**Usage in Routing:**
```typescript
const routes: Routes = [
  {
    path: 'app',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', canActivate: [ProfileGuard], component: ProfileComponent }
    ]
  },
  { path: 'auth/callback', component: AuthCallbackComponent }
];
```

---

#### **2. Reusable Components (`component/` folder)**

Collection of **pre-built, styled UI components** prefixed with `sic-` that follow Angular's standalone component pattern.

**sic-xxx Component Architecture:**

Each component consists of:
- `sic-xxx.ts` - Component class with logic and inputs/outputs
- `sic-xxx.html` - Template
- `sic-xxx.css` - Styles (Tailwind CSS)
- `sic-xxx.spec.ts` - Unit tests

**Key Components with Detailed Explanations:**

**1. `sic-button` - Reusable Button Component**
```typescript
// component/sic-button/sic-button.ts
@Component({
  selector: 'sic-button',
  standalone: true,
  imports: [],
  templateUrl: './sic-button.html',
  styleUrl: './sic-button.css',
})
export class SicButton {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() iconOnly = false;
  @Input() loading = false;

  get buttonClass(): string {
    const classes = [
      'sic-button',
      `sic-button--${this.variant}`,
      `sic-button--${this.size}`,
    ];
    if (this.fullWidth) classes.push('sic-button--full-width');
    if (this.iconOnly) classes.push('sic-button--icon-only');
    return classes.join(' ');
  }
}
```

**Usage:**
```html
<sic-button variant="primary" size="lg" (click)="onSubmit()">
  Submit
</sic-button>

<sic-button variant="danger" type="reset">
  Cancel
</sic-button>

<sic-button variant="secondary" [disabled]="isLoading" [loading]="isLoading">
  Processing...
</sic-button>
```

**2. `sic-input` - Form Input Component with Validation**
```typescript
// component/sic-input/sic-input.ts
@Component({
  selector: 'sic-input',
  standalone: true,
  imports: [CommonModule, NgxMaskDirective],
  templateUrl: './sic-input.html',
  styleUrl: './sic-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInput),
      multi: true,
    },
  ],
})
export class SicInput implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' = 'text';
  @Input() required = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() hint?: string;
  @Input() errorMessages: Record<string, string> = {};
  @Input() mask?: string;  // ngx-mask pattern
  @Input() prefix = '';
  @Input() suffix = '';

  value = '';
  touched = false;
  control: FormControl | null = null;

  get showError(): boolean {
    // Show error if touched and control has errors
    return this.touched && this.control?.invalid ?? false;
  }

  get errorMessage(): string {
    if (!this.control?.errors) return '';
    // Map form validation errors to user-friendly messages
    const firstError = Object.keys(this.control.errors)[0];
    return this.errorMessages[firstError] || 'Invalid input';
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}
```

**Template:**
```html
<label class="sic-input" [class.sic-input--invalid]="showError">
  @if (label) {
    <span class="sic-input__label">
      {{ label }}
      @if (required) {
        <span class="sic-input__required">*</span>
      }
    </span>
  }

  @if (mask) {
    <input
      class="sic-input__field"
      [type]="type"
      [value]="value"
      [placeholder]="placeholder"
      [mask]="mask"
      [prefix]="prefix"
      [suffix]="suffix"
      [disabled]="disabled"
      (input)="handleInput($event)"
      (blur)="handleBlur()" />
  } @else {
    <input
      class="sic-input__field"
      [type]="type"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="handleInput($event)"
      (blur)="handleBlur()" />
  }

  @if (showError && errorMessage) {
    <span class="sic-input__error">{{ errorMessage }}</span>
  } @else if (hint) {
    <span class="sic-input__hint">{{ hint }}</span>
  }
</label>
```

**Usage in Forms:**
```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <sic-input
        label="Email"
        formControlName="email"
        type="email"
        placeholder="Enter email"
        required
        [errorMessages]="{ required: 'Email is required', email: 'Invalid email format' }">
      </sic-input>

      <sic-input
        label="Phone"
        formControlName="phone"
        mask="(999) 999-9999"
        placeholder="(000) 000-0000"
        hint="Format: (000) 000-0000">
      </sic-input>

      <sic-button type="submit" variant="primary">
        Save
      </sic-button>
    </form>
  `
})
export class UserFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required)
  });
}
```

**3. `sic-combobox` - Dropdown/Select Component**
- Searchable dropdown list
- Multi-select support
- Async data loading from API
- Custom filtering

**4. `sic-datepicker` - Date Selection Component**
- Calendar-based date picker
- Date range selection
- Locale-aware formatting
- Integrated with Day.js

**5. `sic-gridpanel` - Data Grid Component**
- Sortable columns
- Pagination
- Row selection
- Responsive layout

**6. `sic-upload` & `sic-input-upload` - File Upload Components**
- Single/multiple file upload
- Drag-and-drop support
- File type validation
- Progress tracking

**7. `sic-dialog` - Modal Dialog Component**
- Configurable modal dialogs
- Backdrop click handling
- Custom actions
- Responsive sizing

**8. `sic-card` - Card Container Component**
- Layout wrapper
- Header/body/footer sections
- Elevation/shadow styling

**9. `sic-sidebar` - Navigation Sidebar Component**
- Collapsible menu
- Active route highlighting
- Nested menu support

**10. `sic-container` - Layout Container Component**
- Grid-based layout system
- Responsive breakpoints
- Padding/margin utilities

**11. `sic-stepper` - Multi-Step Form Component**
- Sequential form steps
- Step validation
- Back/next navigation

**12. `sic-container` - Simple Container Component**

Basic wrapper component for content with support for custom styling.

```typescript
// component/sic-container/sic-container.ts
@Component({
  selector: 'sic-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-container.html',
  styleUrl: './sic-container.css',
})
export class SicContainer {
  @Input() margin?: string | number;
  @Input() customClass?: string;
}
```

**Basic Usage:**

```html
<!-- Simple container with margin -->
<sic-container margin="16">
  Content here
</sic-container>

<!-- Container with Tailwind CSS classes -->
<sic-container customClass="p-6 bg-white rounded-lg shadow">
  Content with styling
</sic-container>

<!-- Combined -->
<sic-container margin="20" customClass="bg-gray-100">
  <p>Container with margin and custom styling</p>
</sic-container>
```

**Key Properties:**
- `margin?: string | number` - Margin spacing (auto-converts numbers to pixels)
- `customClass?: string` - Tailwind CSS classes for styling

**Component Pattern Standards:**
- All components are **standalone** (no module imports needed)
- Use Angular's new **control flow** (`@if`, `@for`)
- Implement `ControlValueAccessor` for form integration
- Use **CSS classes** for styling over inline styles
- Follow **BEM naming convention**: `component__element--modifier`
- Always provide clear **@Input/@Output** documentation

---

#### **3. Directives (`directive/` folder)**

Custom Angular directives for DOM manipulation and behavior enhancement.

**Example: `tooltip/` directive**
- Hover-triggered tooltips
- Position management
- Content customization

---

#### **4. Interceptors (`interceptors/` folder)**

HTTP request/response interceptors for cross-cutting concerns.

**`auth-token.interceptor.ts`** - Adds JWT Token to Requests
```typescript
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      // Clone request and add Authorization header
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Business-Id': this.getCurrentBusinessId() // Add business context
        }
      });
    }

    return next.handle(req);
  }
}
```

**Typical Interceptor Responsibilities:**
- Add authentication tokens
- Add business context headers
- Error handling and logging
- Request/response transformation
- Loading state management

---

#### **5. Models (`model/` folder)**

TypeScript interfaces and enums for type safety.

**`sic-entity-state.ts`** - Entity State Enumeration
```typescript
export enum SicEntityState {
  Detached = 0,      // Entity not in any change tracking
  Unchanged = 1,     // Entity loaded from database, no changes
  Deleted = 2,       // Entity marked for deletion
  Modified = 3,      // Entity has pending changes
  Added = 4,         // Entity created locally, not in database
}
```

**`sic-from-data.ts`** - Base Form Data Model
```typescript
export interface SicFromData {
  id?: string;
  businessId?: string;
  createdBy?: string;
  createdDate?: Date;
  updatedBy?: string;
  updatedDate?: Date;
  state?: SicEntityState;
}
```

**Common Models:**
- DTOs matching backend responses
- Form input models
- State management models
- Enums for domain values

---

#### **6. Pipes (`pipes/` folder)**

Custom Angular pipes for data transformation in templates.

**`sic-date.pipe.ts`** - Date Formatting
```typescript
@Pipe({
  name: 'sicDate',
  standalone: true
})
export class SicDatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(value: Date | string, format: string = 'DD/MM/YYYY'): string {
    if (!value) return '';
    const locale = this.languageService.getCurrentLocale();
    return dayjs(value).locale(locale).format(format);
  }
}
```

**Usage in Templates:**
```html
<!-- Date formatting with locale awareness -->
<span>{{ order.createdDate | sicDate: 'DD MMM YYYY' }}</span>

<!-- DateTime formatting -->
<span>{{ order.updatedDate | sicDatetime: 'DD/MM/YYYY HH:mm:ss' }}</span>
```

---

#### **7. Services (`services/` folder)**

Business logic services providing data and functionality to components.

**`dialog.service.ts`** - Dialog Management Service
```typescript
@Injectable({ providedIn: 'root' })
export class DialogService {
  open<T>(component: Type<T>, data?: any): Observable<any> {
    // Open sic-dialog with component
    // Handle dialog lifecycle
  }
  
  close(result?: any): void {
    // Close current dialog
  }
}
```

**`language-service.ts`** - Internationalization Service
```typescript
@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLanguage$ = new BehaviorSubject<string>('en');
  
  setLanguage(lang: string): void {
    // Switch application language
    // Update locale for dates/numbers
  }
  
  translate(key: string, params?: any): Observable<string> {
    // Get translated text using ngx-translate
  }
}
```

**`sic-validator.ts`** - Form Validation Service
```typescript
@Injectable({ providedIn: 'root' })
export class SicValidator {
  shouldShowError(control: AbstractControl | null, touched: boolean): boolean {
    // Determine if validation error should display
    return touched && control?.invalid ?? false;
  }
  
  getErrorMessage(control: AbstractControl, errorMessages: Record<string, string>): string {
    // Map validation errors to user-friendly messages
  }
}
```

**`theme.service.ts`** - Theme Management Service
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  
  toggleTheme(): void {
    // Switch between light/dark themes
  }
  
  setTheme(theme: 'light' | 'dark'): void {
    // Apply theme CSS variables
  }
}
```

**`app-translate-loader.ts`** - Translation Loader
```typescript
export class AppTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Translation> {
    // Load i18n JSON files for language
    // Support multiple languages
  }
}
```

---

#### **8. Utilities (`utils/` folder)**

Helper functions and utilities.

**`dayjs.ts`** - Day.js Configuration
```typescript
// Configure Day.js with locale, plugins, and defaults
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.locale('en');

export { dayjs };
```

**Common Utilities:**
- String formatting/manipulation
- Date/time helpers
- Number formatting
- Object transformation
- Array operations

---

#### **9. Special File: `dayjs.ts`**

Global date/time configuration file.

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

// Default export for app-wide usage
export default dayjs;
```

---

#### **Integration Example: Complete Feature**

Here's how all core components work together in a real feature:

```typescript
// Feature: User Profile Edit Form

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    SicInput, SicButton, SicCombobox, SicDatepicker,
    ReactiveFormsModule, CommonModule
  ],
  template: `
    <sic-dialog title="Edit Profile">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Text Input with Validation -->
        <sic-input
          label="Full Name"
          formControlName="fullName"
          required
          [errorMessages]="{ required: 'Name is required', minlength: 'Min 3 chars' }">
        </sic-input>

        <!-- Email Input with Type -->
        <sic-input
          label="Email"
          type="email"
          formControlName="email"
          required
          [errorMessages]="{ required: 'Email required', email: 'Invalid email' }">
        </sic-input>

        <!-- Masked Phone Input -->
        <sic-input
          label="Phone"
          formControlName="phone"
          mask="(999) 999-9999"
          placeholder="(000) 000-0000">
        </sic-input>

        <!-- Date Picker -->
        <sic-datepicker
          label="Birth Date"
          formControlName="birthDate"
          [maxDate]="today">
        </sic-datepicker>

        <!-- Dropdown/Combobox -->
        <sic-combobox
          label="Country"
          formControlName="country"
          [options]="countries$ | async"
          [searchable]="true">
        </sic-combobox>

        <!-- Buttons -->
        <div class="flex gap-2">
          <sic-button variant="primary" type="submit" [disabled]="form.invalid">
            Save Changes
          </sic-button>
          <sic-button variant="secondary" (click)="onCancel()">
            Cancel
          </sic-button>
        </div>
      </form>
    </sic-dialog>
  `
})
export class UserProfileComponent implements OnInit {
  form!: FormGroup;
  countries$ = this.api.getCountries();
  today = dayjs().toDate();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialog: DialogService,
    private languageService: LanguageService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthDate: [''],
      country: ['', Validators.required]
    });
  }

  private loadUserData(): void {
    this.api.getCurrentUser().subscribe(user => {
      this.form.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        country: user.countryId
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.api.updateUser(this.form.value).subscribe({
      next: () => {
        this.dialog.close(this.form.value);
      },
      error: (err) => console.error('Update failed', err)
    });
  }

  onCancel(): void {
    this.dialog.close(null);
  }
}
```

This example demonstrates:
- Using multiple `sic-xxx` components together
- Form validation and error messages
- Service integration for data loading
- Dialog interaction
- Reactive forms pattern
- Type safety with TypeScript

---



### 3. **sic-auth** - Authentication Service (Keycloak)
**Path**: `/sic-auth`

Keycloak-based identity and access management service providing centralized authentication and authorization.

#### Components:
- **Keycloak Server**: Latest version of Keycloak running on port 8080
- **Database**: PostgreSQL 17 (dedicated authentication database)
- **Custom Theme**: Mint Keywind theme for UI customization
- **Realm Configuration**: Pre-configured "sic-project" realm with OAuth2/OIDC flows

#### Key Configuration:
- **Admin Credentials**: 
  - Username: `administrator`
  - Password: `Sicr@2026` (development only)
- **Server Configuration**:
  - Port: 8080 (HTTP)
  - Database: PostgreSQL (sic_auth database)
  - CORS: Enabled for cross-origin requests
  - Proxy Mode: Edge (for reverse proxy support)
- **Features**:
  - JWT token generation and validation
  - User management and roles/permissions
  - OpenID Connect (OIDC) protocol support
  - OAuth2 authorization flows
  - Custom realm-specific configurations via `realm-one-project.json`

#### Docker Setup:
```yaml
Services:
  - keycloak: Main authentication server
  - keycloak-db: PostgreSQL database for Keycloak
Container Networks: sic-shared
```

#### Access:
- **Admin Console**: `http://localhost:8080/admin`
- **Realm URL**: `http://localhost:8080/realms/sic-project`
- **OIDC Discovery**: `http://localhost:8080/realms/sic-project/.well-known/openid-configuration`

---

### 4. **sic-database** - Database Infrastructure
**Path**: `/sic-database`

PostgreSQL database service providing persistent storage for both the application and authentication systems.

#### Components:
- **PostgreSQL**: Version 17 database server running on port 54320
- **Keycloak Database**: `sic_auth` database for identity management
- **Application Database**: `sic_app` database for business logic data
- **Initialization Scripts**: Automated database and schema setup

#### Database Structure:
The database layer supports:
- **Core Entities**: 
  - Countries (DbCountry)
  - Titles (DbTitle)
  - Parameters (DbParameter)
  - Examples (ExExample)
  - Supervisory Units (SuProfile)
  - Tasks (SuTask)
- **File Management**:
  - Upload sessions and metadata
  - Temporary uploads with expiration
  - Upload groups and associations
- **Access Control**:
  - User and business relationships
  - Program/application access mappings
  - Role-based permissions

#### Configuration:
- **Admin Credentials**: 
  - Username: `administrator`
  - Password: `Sic2026` (development only)
- **Ports**: 
  - Internal: 5432
  - External: 54320 (mapped for local development)
- **Network**: Connected via `sic-shared` Docker network

#### Health Checks:
Automated health checks ensure database availability with 20-second timeout and 5-second retry intervals.

#### Initialization:
```bash
docker compose up -d
```
Automatically:
- Creates PostgreSQL container
- Initializes `sic_auth` database for Keycloak
- Initializes `sic_app` database with Entity Framework migrations
- Sets up all required users and credentials

---

### 5. **sic-storage** - File Storage Service (SeaweedFS)
**Path**: `/sic-storage`

Distributed file storage system with S3-compatible API for storing and serving media files, documents, and uploads.

#### Components:
- **SeaweedFS Master**: Central file management and coordination server
  - UI: Port 9333
  - API: Port 8081
- **SeaweedFS Filer**: S3-compatible object storage interface
  - Port: 8333 (internal)
  - Port: 8888 (external - S3 endpoint)
- **MinIO Client (MC)**: Initialization tool for bucket creation

#### Key Features:
- **S3-Compatible API**: Compatible with AWS SDK and standard S3 clients
- **Multiple Buckets**: Organized storage for different file types:
  - `uploads`: User-uploaded temporary files
  - `documents`: Business documents and PDFs
  - `public-files`: Public media (images and videos)
- **Auto-Initialization**: Buckets are automatically created on startup
- **Data Persistence**: Persistent volume mount at `/data`

#### Storage Configuration:
- **Access Key**: `seaweedfs`
- **Secret Key**: `seaweedfs-secret`
- **Endpoint URL**: `http://localhost:8888`

#### API Endpoints:
- **Master UI**: `http://localhost:9333`
- **Filer HTTP**: `http://localhost:8081`
- **S3 Endpoint**: `http://localhost:8888`

#### Usage with AWS SDK:
```csharp
// Backend API uses AWSSDK.S3 to interact with SeaweedFS
// Configured through StorageOptions in appsettings.json
ServiceUrl = "http://localhost:8888"
AccessKey = "seaweedfs"
SecretKey = "seaweedfs-secret"
```

#### File Management:
- **Images**: Stored in `public-files` bucket with processing
- **Videos**: Stored in `public-files` bucket with media processing
- **Documents**: Stored in `documents` bucket
- **Uploads**: Tracked with resumable upload support

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend API** | ASP.NET Core | 10.0 |
| **Database** | PostgreSQL | 17 |
| **Frontend** | Angular | 21.1.0 |
| **Authentication** | Keycloak | Latest |
| **Storage** | SeaweedFS | Latest |
| **ORM** | Entity Framework Core | 10.0 |
| **Build Tool** | Angular CLI | 21.1.3 |

---

## Service Communication

```
┌─────────────────┐
│   sic-app       │  (Angular Frontend)
│  Port: 4200     │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   sic-api       │  (ASP.NET Core Backend)
│  Port: 5000     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │          │              │              │
┌───▼──────┐ ┌─▼────────┐ ┌─▼──────────┐ ┌──▼───────┐
│sic-auth  │ │sic-db    │ │sic-storage │ │AWS S3    │
│Keycloak  │ │PostgreSQL│ │SeaweedFS   │ │Optional  │
│8080      │ │54320     │ │8888        │ │          │
└──────────┘ └──────────┘ └────────────┘ └──────────┘
```

---

## Development Setup

### Prerequisites
- Docker and Docker Compose
- .NET 10 SDK
- Node.js 20+ with npm 11.6.1+
- PostgreSQL CLI tools (optional)

### Quick Start

1. **Start Infrastructure Services**:
```bash
cd sic-database
docker compose up -d

cd ../sic-auth
docker compose up -d

cd ../sic-storage
docker compose up -d
```

2. **Run Backend API**:
```bash
cd sic-api
dotnet restore
dotnet run
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

3. **Run Frontend Application**:
```bash
cd sic-app
npm install
npm start
# Application available at http://localhost:4200
```

### Environment Configuration
- **API Configuration**: `sic-api/appsettings.json`
- **Frontend Configuration**: `sic-app/angular.json` and environment files in `src/environments/`
- **Keycloak Realm**: `sic-auth/infra/keycloak/realm-one-project.json`
- **Database Initialization**: `sic-database/infra/postgres/init/`

### Common Ports
| Service | Port | Purpose |
|---------|------|---------|
| sic-app | 4200 | Angular development server |
| sic-api | 5000 | ASP.NET Core Web API |
| sic-auth (Keycloak) | 8080 | Authentication & Admin Console |
| sic-database (PostgreSQL) | 54320 | Database service (external) |
| sic-storage (SeaweedFS S3) | 8888 | Object storage S3 endpoint |
| sic-storage (Master UI) | 9333 | SeaweedFS administration |

---

## Key Features

### Authentication & Authorization
- **Centralized Identity Management**: Keycloak-based single sign-on
- **Multi-Tenant Support**: Business header-based access control
- **Role-Based Access Control (RBAC)**: User roles and permissions via Keycloak
- **JWT Authentication**: Stateless token-based security

### Data Management
- **Entity Framework Core**: Type-safe database operations
- **Entity Relationships**: Organized entity structure with base classes
- **Migrations**: Version-controlled database schema changes
- **Data Validation**: FluentValidation for request validation

### File Storage & Media Processing
- **Scalable Object Storage**: SeaweedFS S3-compatible API
- **Media Processing**: Image and video processing capabilities
- **Resumable Uploads**: Support for large file uploads with resume capability
- **Organized Buckets**: Separate storage for uploads, documents, and public files

### Frontend Experience
- **Server-Side Rendering**: Improved performance and SEO with Angular Universal
- **Responsive Design**: Tailwind CSS for modern, mobile-first UI
- **Internationalization**: Multi-language support with ngx-translate
- **Real-time Updates**: RxJS-based reactive state management

### API Design
- **RESTful Architecture**: Standard REST conventions
- **CQRS Pattern**: Command Query Responsibility Segregation with MediatR
- **Comprehensive Documentation**: Swagger/OpenAPI documentation
- **Consistent Error Handling**: Standardized error responses

---

## Database Schema

The application manages several key entities:

### Administrative Data
- **Countries** (DbCountry): Reference data for country listings
- **Titles** (DbTitle): User/person title references (Dr., Prof., etc.)
- **Parameters** (DbParameter): System configuration parameters

### Business Operations
- **Supervisory Units** (SuProfile, SuTask): Organizational hierarchy and task management
- **Examples** (ExExample): Reference data and examples
- **Messages**: Internationalized message content

### File Management
- **Uploads**: User-uploaded file metadata and status tracking
- **Upload Sessions**: Temporary upload state for resumable uploads
- **Upload Groups**: Grouping related uploads together

### Access Control
- **Business Access**: User-to-business relationships
- **Program Access**: Program/application access mappings

---

## Deployment Considerations

### Production Setup
- **SSL/TLS**: Configure HTTPS for all services
- **Environment Variables**: Use secure configuration management (Azure Key Vault, AWS Secrets Manager, etc.)
- **Database Backups**: Implement regular PostgreSQL backups
- **Storage Replication**: Consider SeaweedFS replication for high availability
- **Container Orchestration**: Deploy using Kubernetes or Docker Swarm
- **Monitoring**: Implement health checks and logging (Application Insights, Prometheus, ELK Stack)

### Security Best Practices
- Change all default passwords in production
- Enable HTTPS/TLS for all services
- Configure firewall rules and network policies
- Use secret management systems for credentials
- Implement rate limiting and API throttling
- Enable CORS only for trusted origins
- Use strong JWT signing keys

### Scalability
- **Horizontal Scaling**: Run multiple API instances behind a load balancer
- **Database Replication**: Set up PostgreSQL replication for failover
- **CDN Integration**: Serve static content and public files via CDN
- **Caching Layer**: Implement Redis for session and data caching

---

## Development Workflow

### Code Organization
- **Features-Based Structure**: Controllers and logic organized by feature/domain
- **Separation of Concerns**: Clear separation between services, entities, and controllers
- **Validation Pipeline**: FluentValidation integrated into MediatR pipeline
- **Consistent Naming**: Prefixed entities (Db, Ex, Su) for domain clarity

### Contributing
1. Follow the established folder structure
2. Use MediatR for new features
3. Add validation with FluentValidation
4. Include Swagger documentation for new endpoints
5. Add appropriate authorization attributes to controllers
6. Ensure CORS compliance for frontend integration

---

## Support & Documentation

- **Backend Documentation**: Swagger UI at `http://localhost:5000/swagger`
- **Keycloak Documentation**: Available at `http://localhost:8080/admin`
- **SeaweedFS Documentation**: https://github.com/chrislusf/seaweedfs
- **Angular Documentation**: https://angular.io
- **ASP.NET Core Documentation**: https://docs.microsoft.com/dotnet/core/

---

## License

[Add your license information here]

---

## Version Information

- **Project Version**: 1.0.0
- **Last Updated**: May 2026
- **.NET Version**: 10.0
- **Angular Version**: 21.1.0
- **PostgreSQL Version**: 17
- **Keycloak Version**: Latest
