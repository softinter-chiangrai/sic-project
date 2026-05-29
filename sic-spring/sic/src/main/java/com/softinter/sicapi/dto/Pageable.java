package com.softinter.sicapi.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pageable {
    private int pageNumber = 1;
    private int pageSize = 10;
    private long totalElements;
    private long totalPages;
    private List<PageableSort> sorts = new ArrayList<>();

    public boolean hasSort() {
        return sorts != null && !sorts.isEmpty();
    }

    public void calculateTotalPages() {
        this.totalPages = (totalElements + pageSize - 1) / pageSize;
    }
}
