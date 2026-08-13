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
    description?: string;          
    uploadGroupId?: string;
    uploadGroupData?: any[];
    isAiGenerated?: boolean;
    aiGeneratedAt?: string;
    generatedFromRequirementId?: string;
    generatedFromDiagramId?: string;
    state?: number;
    rowVersion?: number;
    createdAt?: string;
    updatedAt?: string;
    projectId?: string;
    projectName?: string;
    createdBy?: string;
    isActive?: boolean;
}


