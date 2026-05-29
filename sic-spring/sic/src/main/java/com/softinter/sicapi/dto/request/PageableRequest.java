package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.dto.PageableSort;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PageableRequest {
    private int pageNumber = 1;
    private int pageSize = 10;
    private List<PageableSort> sorts = new ArrayList<>();
}
