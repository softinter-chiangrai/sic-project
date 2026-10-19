import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Trace link target types that are diagrams (any drawing type, upper-cased), plus the generic DIAGRAM. */
export const DIAGRAM_TRACE_TYPES = [
  'DIAGRAM', 'DFD', 'ER', 'FLOWCHART', 'SEQUENCE', 'CLASS', 'STATE', 'GANTT', 'MINDMAP',
  'JOURNEY', 'PIE', 'C4', 'USE_CASE', 'USE CASE', 'TIMELINE', 'GIT GRAPH', 'GIT_GRAPH', 'ARCHITECTURE',
];

export const isDiagramTraceType = (type: string | null | undefined) => DIAGRAM_TRACE_TYPES.includes((type || '').toUpperCase().trim());

export interface TraceTargetDetails {
  code: string;
  name: string;
  /** diagrams only: the drawing type (DFD, ER, Flowchart, ...) */
  diagramType?: string;
}

/** Code + display name of a trace link target, read from its own API. */
export function traceTargetDetails(http: HttpClient, type: string, id: string): Observable<TraceTargetDetails> {

  const base = environment.apiBaseUrl;
  const t = (type || '').toUpperCase().trim();
  switch (t) {
    case 'DFD':
    case 'ER':
    case 'DIAGRAM':
    case 'FLOWCHART':
    case 'SEQUENCE':
    case 'USE_CASE':
    case 'USE CASE':
    case 'CLASS':
    case 'STATE':
    case 'GANTT':
    case 'MINDMAP':
    case 'JOURNEY':
    case 'PIE':
    case 'C4':
    case 'TIMELINE':
    case 'GIT GRAPH':
    case 'GIT_GRAPH':
    case 'ARCHITECTURE':
      return http.get<any>(`${base}/api/diagram/tabs/${id}`).pipe(
        map((data) => {
          const code = data?.diagramCode || id.slice(0, 8);
          const title = data?.name || `${type} Diagram`;
          return { code, name: data?.diagramCode ? `[${code}] ${title}` : title, diagramType: data?.diagramType || type };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: `${type} Diagram` }))
      );
    case 'REQUIREMENT':
    case 'REQ':
      return http.get<any>(`${base}/api/pm/requirement/${id}`).pipe(
        map((data) => {
          const code = data?.requirementCode || 'REQ';
          const title = data?.title || 'Requirement';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Requirement' }))
      );
    case 'SPECIFICATION':
    case 'SPEC':
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
    case 'CR':
      return http.get<any>(`${base}/api/pm/change-requests/${id}`).pipe(
        map((data) => {
          const code = data?.crCode || 'CR';
          const title = data?.title || 'Change Request';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Change Request' }))
      );
    case 'TEST_CASE':
    case 'TESTCASE':
    case 'TC':
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
    case 'DESIGNREVIEW':
    case 'DR':
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
    case 'SCENARIO':
      return http.get<any>(`${base}/api/pm/test-scenarios/${id}`).pipe(
        map((data) => {
          const code = data?.scenarioCode || 'SCENARIO';
          const title = data?.scenarioName || data?.title || 'Test Scenario';
          return { code, name: code ? `[${code}] ${title}` : title };
        }),
        catchError(() => of({ code: id.slice(0, 8), name: 'Test Scenario' }))
      );
    case 'USER_MANUAL':
    case 'MANUAL':
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
    case 'TICKET':
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
    default:
      return of({ code: id.slice(0, 8), name: id });
  }
}

/** Route of a trace link target's screen. */
export function traceTargetLink(type: string, id: string): string {

  const base = '/feature/pm';
  const t = (type || '').toUpperCase().trim();
  switch (t) {
    case 'DFD':
    case 'ER':
    case 'DIAGRAM':
    case 'FLOWCHART':
    case 'SEQUENCE':
    case 'USE_CASE':
    case 'USE CASE':
    case 'CLASS':
    case 'STATE':
    case 'GANTT':
    case 'MINDMAP':
    case 'JOURNEY':
    case 'PIE':
    case 'C4':
    case 'TIMELINE':
    case 'GIT GRAPH':
    case 'GIT_GRAPH':
    case 'ARCHITECTURE':
      return `${base}/diagram?tabId=${id}`;
    case 'REQUIREMENT':
    case 'REQ':
      return `${base}/requirement/${id}/view`;
    case 'SPECIFICATION':
    case 'SPEC':
      return `${base}/specification/${id}/edit`;
    case 'TASK':
      return `${base}/task-board?taskId=${id}`;
    case 'TEST_CASE':
    case 'TESTCASE':
    case 'TC':
      return `${base}/test-case/${id}/edit`;
    case 'BUG':
      return `${base}/bug/${id}/edit`;
    case 'TEST_SCENARIO':
    case 'SCENARIO':
      return `${base}/test-scenario/${id}/edit`;
    case 'CHANGE_REQUEST':
    case 'CR':
      return `${base}/change-request/${id}/edit`;
    case 'DESIGN_REVIEW':
    case 'DESIGNREVIEW':
    case 'DR':
      return `${base}/design-review/${id}/edit`;
    case 'CONTRACT':
      return `${base}/contract`;
    case 'DELIVERY':
      return `${base}/delivery/${id}/edit`;
    case 'USER_MANUAL':
    case 'MANUAL':
      return `${base}/manual/${id}/edit`;
    case 'INVOICE':
      return `${base}/invoice/${id}/edit`;
    case 'MA_TICKET':
    case 'TICKET':
      return `${base}/ma-ticket/${id}/edit`;
    case 'PHASE':
      return `${base}/phase/${id}/edit`;
    case 'MILESTONE':
      return `${base}/milestone/${id}/edit`;
    case 'WORK_PACKAGE':
      return `${base}/work-package/${id}/edit`;
    case 'DOCUMENT_VERSION':
    case 'VERSION':
      return `${base}/version/${id}/edit`;
    default:
      return '#';
  }
}
