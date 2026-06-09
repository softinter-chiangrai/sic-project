package com.softinter.sicapi.util;

import com.softinter.sicapi.dto.Pageable;
import com.softinter.sicapi.dto.response.PaginationResponse;

import java.util.ArrayList;
import java.util.List;

public class PaginationUtil {

    private PaginationUtil() {} // ป้องกันการ instantiate

    public static <T> PaginationResponse<T> of(List<T> data, int pageNumberZeroBased, int pageSize, long totalElements) {
        PaginationResponse<T> response = new PaginationResponse<>();
        response.setData(data != null ? data : new ArrayList<>());

        Pageable pageable = new Pageable();
        pageable.setPageNumber(pageNumberZeroBased + 1);  // 1-indexed สำหรับ frontend
        pageable.setPageSize(pageSize);
        pageable.setTotalElements(totalElements);
        pageable.calculateTotalPages();

        response.setPageable(pageable);
        return response;
    }

    public static <T> PaginationResponse<T> ofSingleItem(T item, int pageNumberZeroBased, int pageSize) {
        PaginationResponse<T> response = new PaginationResponse<>();
        if (item != null) {
            response.setData(List.of(item));
        } else {
            response.setData(new ArrayList<>());
        }

        Pageable pageable = new Pageable();
        pageable.setPageNumber(pageNumberZeroBased + 1);
        pageable.setPageSize(pageSize);
        long totalElements = (item != null) ? 1 : 0;
        pageable.setTotalElements(totalElements);
        pageable.calculateTotalPages();

        response.setPageable(pageable);
        return response;
    }
}