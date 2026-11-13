import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Standard trace target / entity types in SCREAMING_SNAKE_CASE */
export type TraceEntityType =
  | 'DIAGRAM'
  | 'DFD'
  | 'ER'
  | 'FLOWCHART'
  | 'SEQUENCE'
  | 'CLASS'
  | 'STATE'
  | 'GANTT'
  | 'MINDMAP'
  | 'JOURNEY'
  | 'PIE'
  | 'C4'
  | 'USE_CASE'
  | 'TIMELINE'
  | 'GIT_GRAPH'
  | 'ARCHITECTURE'
  | 'REQUIREMENT'
  | 'SPECIFICATION'
  | 'TASK'
  | 'CHANGE_REQUEST'
  | 'TEST_CASE'
  | 'BUG'
  | 'DESIGN_REVIEW'
  | 'CONTRACT'
  | 'DELIVERY'
  | 'TEST_SCENARIO'
  | 'USER_MANUAL'
  | 'INVOICE'
  | 'MA_TICKET'
  | 'PHASE'
  | 'MILESTONE'
  | 'WORK_PACKAGE'
  | 'DOCUMENT_VERSION';

/** Trace link target types that are diagrams (any drawing type, upper-cased), plus the generic DIAGRAM. */
export const DIAGRAM_TRACE_TYPES: string[] = [
  'DIAGRAM', 'DFD', 'ER', 'FLOWCHART', 'SEQUENCE', 'CLASS', 'STATE', 'GANTT', 'MINDMAP',
  'JOURNEY', 'PIE', 'C4', 'USE_CASE', 'TIMELINE', 'GIT_GRAPH', 'ARCHITECTURE',
];

/** Mapping table for legacy abbreviations / variants to canonical TraceEntityType */
const LEGACY_TYPE_MAP: Record<string, TraceEntityType> = {
  REQ: 'REQUIREMENT',
  SPEC: 'SPECIFICATION',
  TC: 'TEST_CASE',
  TESTCASE: 'TEST_CASE',
  CR: 'CHANGE_REQUEST',
  DR: 'DESIGN_REVIEW',
  DESIGNREVIEW: 'DESIGN_REVIEW',
  SCENARIO: 'TEST_SCENARIO',
  MANUAL: 'USER_MANUAL',
  TICKET: 'MA_TICKET',
  MA: 'MA_TICKET',
  VERSION: 'DOCUMENT_VERSION',
};

/** Normalizes any raw entity type string into canonical SCREAMING_SNAKE_CASE */
export function normalizeTraceType(type: string | null | undefined): string {
  if (!type) return '';
  const clean = type.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return LEGACY_TYPE_MAP[clean] || clean;
}

export const isDiagramTraceType = (type: string | null | undefined) =>
  DIAGRAM_TRACE_TYPES.includes(normalizeTraceType(type));

export interface TraceTargetDetails {
  code: string;
  name: string;
  /** diagrams only: the drawing type (DFD, ER, Flowchart, ...) */
  diagramType?: string;
}

/** Code + display name of a trace link target, read from its own API. */
export function traceTargetDetails(http: HttpClient, type: string, id: string): Observable<TraceTargetDetails> {
  const base = environment.apiBaseUrl;
  const t = normalizeTraceType(type);

  if (isDiagramTraceType(t)) {
    return http.get<any>(`${base}/api/diagram/tabs/${id}`).pipe(
      map((data) => {
        const code = data?.diagramCode || id.slice(0, 8);
        const title = data?.name || `${type} Diagram`;
        return { code, name: data?.diagramCode ? `[${code}] ${title}` : title, diagramType: data?.diagramType || type };
      }),
      catchError(() => of({ code: id.slice(0, 8), name: `${type} Diagram` }))
    );
  }

  switch (t) {
    case 'REQUIREMENT':
      return http.get<any>(`${base}/api/pm/requirement/${id}`).pipe(
        map((data) => {
          const code = data?.requirementCode || 'REQ';
          const title = data?.title || 'Requirement';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Requirement' }))
      );
    case 'SPECIFICATION':
      return http.get<any>(`${base}/api/pm/specifications/${id}`).pipe(
        map((data) => {
          const code = data?.specificationCode || 'SPEC';
          const title = data?.title || 'Specification';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Specification' }))
      );
    case 'TASK':
      return http.get<any>(`${base}/api/pm/tasks/${id}`).pipe(
        map((data) => {
          const code = data?.taskCode || 'TASK';
          const title = data?.taskName || 'Task';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Task' }))
      );
    case 'CHANGE_REQUEST':
      return http.get<any>(`${base}/api/pm/change-requests/${id}`).pipe(
        map((data) => {
          const code = data?.crCode || 'CR';
          const title = data?.title || 'Change Request';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Change Request' }))
      );
    case 'TEST_CASE':
      return http.get<any>(`${base}/api/pm/test-cases/${id}`).pipe(
        map((data) => {
          const code = data?.testCaseCode || 'TC';
          const title = data?.title || 'Test Case';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Test Case' }))
      );
    case 'BUG':
      return http.get<any>(`${base}/api/pm/bugs/${id}`).pipe(
        map((data) => {
          const code = data?.bugCode || 'BUG';
          const title = data?.title || 'Bug';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Bug' }))
      );
    case 'DESIGN_REVIEW':
      return http.get<any>(`${base}/api/pm/design-reviews/${id}`).pipe(
        map((data) => {
          const code = data?.reviewCode || 'DR';
          const title = data?.title || 'Design Review';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Design Review' }))
      );
    case 'CONTRACT':
      return http.get<any>(`${base}/api/pm/contracts/${id}`).pipe(
        map((data) => {
          const code = data?.contractCode || 'CONTRACT';
          const title = data?.contractName || 'Contract';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Contract' }))
      );
    case 'DELIVERY':
      return http.get<any>(`${base}/api/pm/delivery/${id}`).pipe(
        map((data) => {
          const code = data?.deliveryCode || 'DELIVERY';
          const title = data?.title || 'Delivery';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Delivery' }))
      );
    case 'TEST_SCENARIO':
      return http.get<any>(`${base}/api/pm/test-scenarios/${id}`).pipe(
        map((data) => {
          const code = data?.scenarioCode || 'SCENARIO';
          const title = data?.scenarioName || data?.title || 'Test Scenario';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Test Scenario' }))
      );
    case 'USER_MANUAL':
      return http.get<any>(`${base}/api/pm/manual/${id}`).pipe(
        map((data) => {
          const code = data?.manualCode || 'MANUAL';
          const title = data?.title || 'User Manual';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'User Manual' }))
      );
    case 'INVOICE':
      return http.get<any>(`${base}/api/pm/invoices/${id}`).pipe(
        map((data) => {
          const code = data?.invoiceNo || data?.code || 'INVOICE';
          const title = data?.title || 'Invoice';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Invoice' }))
      );
    case 'MA_TICKET':
      return http.get<any>(`${base}/api/pm/ma-tickets/${id}`).pipe(
        map((data) => {
          const code = data?.ticketNo || 'TICKET';
          const title = data?.title || 'MA Ticket';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'MA Ticket' }))
      );
    case 'PHASE':
      return http.get<any>(`${base}/api/pm/phases/${id}`).pipe(
        map((data) => {
          const code = data?.phaseCode || 'PHASE';
          const title = data?.phaseName || data?.name || 'Phase';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Phase' }))
      );
    case 'MILESTONE':
      return http.get<any>(`${base}/api/pm/milestones/${id}`).pipe(
        map((data) => {
          const code = data?.milestoneCode || 'MILESTONE';
          const title = data?.milestoneName || data?.name || 'Milestone';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Milestone' }))
      );
    case 'WORK_PACKAGE':
      return http.get<any>(`${base}/api/pm/work-packages/${id}`).pipe(
        map((data) => {
          const code = data?.workPackageCode || 'WORK_PACKAGE';
          const title = data?.workPackageName || data?.name || 'Work Package';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Work Package' }))
      );
    case 'DOCUMENT_VERSION':
      return http.get<any>(`${base}/api/pm/document-versions/${id}`).pipe(
        map((data) => {
          const code = data?.versionTag || 'VERSION';
          const title = data?.versionTitle || data?.name || 'Document Version';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Document Version' }))
      );
    default:
      return of({ code: id.slice(0, 8), name: id });
  }
}

/** Route of a trace link target's screen. */
export function traceTargetLink(type: string, id: string): string {
  const base = '/feature/pm';
  const t = normalizeTraceType(type);

  if (isDiagramTraceType(t)) {
    return `${base}/diagram?tabId=${id}`;
  }

  switch (t) {
    case 'REQUIREMENT':
      return `${base}/requirement/${id}/view`;
    case 'SPECIFICATION':
      return `${base}/specification/${id}/edit`;
    case 'TASK':
      return `${base}/task-board?taskId=${id}`;
    case 'TEST_CASE':
      return `${base}/test-case/${id}/edit`;
    case 'BUG':
      return `${base}/bug/${id}/edit`;
    case 'TEST_SCENARIO':
      return `${base}/test-scenario/${id}/edit`;
    case 'CHANGE_REQUEST':
      return `${base}/change-request/${id}/edit`;
    case 'DESIGN_REVIEW':
      return `${base}/design-review/${id}/edit`;
    case 'CONTRACT':
      return `${base}/contract`;
    case 'DELIVERY':
      return `${base}/delivery/${id}/edit`;
    case 'USER_MANUAL':
      return `${base}/manual/${id}/edit`;
    case 'INVOICE':
      return `${base}/invoice/${id}/edit`;
    case 'MA_TICKET':
      return `${base}/ma-ticket/${id}/edit`;
    case 'PHASE':
      return `${base}/phase/${id}/edit`;
    case 'MILESTONE':
      return `${base}/milestone/${id}/edit`;
    case 'WORK_PACKAGE':
      return `${base}/work-package/${id}/edit`;
    case 'DOCUMENT_VERSION':
      return `${base}/version/${id}/edit`;
    default:
      return '#';
  }
}
