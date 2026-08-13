// src/app/feature/pm/dt/pmdt08/pmdt08.model.ts
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
    description?: string;          // เนื้อหาทั้งหมดจาก Tiptap
    uploadGroupId?: string;
    uploadGroupData?: any[];
    isActive?: boolean;
    isAiGenerated?: boolean;
    aiGeneratedAt?: string;
    generatedFromRequirementId?: string;
    generatedFromDiagramId?: string;
    projectId?: string;
    projectName?: string;
    requirementId?: string;
    requirementCode?: string;
    requirementTitle?: string;
    createdBy?: string;
    state?: number;
    rowVersion?: number;
    createdAt?: string;
    updatedAt?: string;
}

