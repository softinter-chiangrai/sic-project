// src/app/core/model/approval.model.ts

export type ApprovalStatus =
    | 'PENDING'
    | 'PARTIALLY_APPROVED'
    | 'APPROVED'
    | 'REJECTED'
    | 'NEED_REVISION'
    | 'CANCELLED'
    | 'SKIPPED'
    | 'EXPIRED';


export type ApprovalMode = 'CHAIN' | 'PARALLEL' | 'ANY' | 'SINGLE';

export type DocumentType =
    | 'REQUIREMENT'
    | 'SPECIFICATION'
    | 'DFD'
    | 'ER'
    | 'DELIVERY'
    | 'INVOICE'
    | 'MA_RENEWAL'
    | 'CHANGE_REQUEST'
    | 'TEST_PLAN'
    | 'UAT';

export interface ApprovalFlowStep {
    id: string;
    stepOrder: number;
    stepName: string;
    approverRole: string | null;
    approverUserId: string | null;
    isRequired: boolean;
    timeoutDays: number | null;
    canSkip: boolean;
    conditionExpression: string | null;
}

export interface ApprovalFlow {
    id: string;
    flowCode: string;
    flowName: string;
    documentType: string;
    documentTypeDisplay: string;
    approvalMode: ApprovalMode;
    approvalModeDisplay: string;
    description: string;
    isActive: boolean;
    steps: ApprovalFlowStep[];
}

export interface ApprovalStepStatus {
    id: string;
    stepId: string;
    stepOrder: number;
    stepName: string;
    approverRole: string | null;
    approverUserId: string | null;
    approverName: string | null;
    status: ApprovalStatus;
    statusText: string;
    statusColor: string;
    approvalDate: string | null;
    comment: string | null;
    isCurrent: boolean;
    isComplete: boolean;
    isRequired: boolean;
    timeoutDays: number | null;
}

export interface ApprovalLog {
    id: string;
    action: string;
    actor: string;
    actorName: string;
    comment: string;
    oldStatus: ApprovalStatus;
    newStatus: ApprovalStatus;
    createdDate: string;
    actionClass: string;
    actionIcon: string;
}

export interface Approval {
    id: string;
    documentType: string;
    documentId: string;
    documentCode: string;
    documentTitle: string;
    version: string;
    requestedBy: string;
    requestedByName: string;
    requestedDate: string;
    status: ApprovalStatus;
    statusText: string;
    statusColor: string;
    comment: string | null;
    finalApprover: string | null;
    finalApproverName: string | null;
    finalApprovalDate: string | null;
    flowCode: string;
    flowName: string;
    approvalMode: string;

    currentStep: ApprovalStepStatus | null;
    steps: ApprovalStepStatus[];
    logs: ApprovalLog[];

    canApprove: boolean;
    canReject: boolean;
    canRevise: boolean;
    canCancel: boolean;
    approverHint: string | null;
}

export interface ApprovalSummary {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    totalNeedRevision: number;
    totalExpired: number;
    requirementPending: number;
    specificationPending: number;
    deliveryPending: number;
    invoicePending: number;
    changeRequestPending: number;
}

export interface SubmitApprovalRequest {
    documentType: string;
    documentId: string;
    documentCode?: string;
    documentTitle?: string;
    version?: string;
    comment?: string;
    attachmentId?: string;
    flowId: string;
    extraData?: string;
}

export interface ApprovalActionRequest {
    approvalId: string;
    comment?: string;
    signature?: string;
    delegateToUserId?: string;
}

export interface ApprovalSearchParams {
    documentType?: string;
    status?: string;
    requestedBy?: string;
    approver?: string;
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    sorts?: Array<{ field: string; descending: boolean }>;
}