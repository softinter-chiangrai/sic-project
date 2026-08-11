// src/app/feature/pm/dt/pmdt08/pmdt08.model.ts

import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PmSpecificationModel {
    id?: string;
    specificationCode: string;
    title: string;
    module?: string;
    version?: string;
    status?: string;
    priority?: string;
    owner?: string;
    estimatedManday?: number;
    objective?: string;
    scope?: string;
    description?: string;
    remark?: string;
    uploadGroupId?: string;
    isAiGenerated?: boolean;
    aiGeneratedAt?: string;
    generatedFromRequirementId?: string;
    generatedFromDiagramId?: string;
    state?: number;
    rowVersion?: number;
    createdAt?: string;
    updatedAt?: string;

    requirements?: RequirementLink[];
    screens?: Screen[];
    fields?: Field[];
    validations?: Validation[];
    businessRules?: BusinessRule[];
    apis?: Api[];
}

export interface RequirementLink {
    id?: string;
    requirementId: string;
    requirementCode?: string;
    requirementTitle?: string;
}

export interface Screen {
    id?: string;
    screenName: string;
    description?: string;
    navigation?: string;
    mockupUrl?: string;
    state?: number;
    rowVersion?: number;
}

export interface Field {
    id?: string;
    fieldName: string;
    dataType: string;
    isRequired?: boolean;
    maxLength?: number;
    defaultValue?: string;
    description?: string;
    state?: number;
    rowVersion?: number;
}

export interface Validation {
    id?: string;
    validationType: string;
    rule: string;
    errorMessage?: string;
    state?: number;
    rowVersion?: number;
}

export interface BusinessRule {
    id?: string;
    ruleName: string;
    description?: string;
    severity?: string;
    state?: number;
    rowVersion?: number;
}

export interface Api {
    id?: string;
    httpMethod: string;
    url: string;
    requestSchema?: any;
    responseSchema?: any;
    authentication?: string;
    state?: number;
    rowVersion?: number;
}

export interface Pmdt08FormData {
    specification: SicFromData<PmSpecificationModel>;
}

export interface ComboboxItem {
    value: string;
    text: string;
}