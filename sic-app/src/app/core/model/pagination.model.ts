// src/app/core/model/pagination.model.ts

export interface PaginationResponse<T> {
    data: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
    };
}