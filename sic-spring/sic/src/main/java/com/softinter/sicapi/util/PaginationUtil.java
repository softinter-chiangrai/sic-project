package com.softinter.sicapi.util;

import com.softinter.sicapi.dto.Pageable;
import com.softinter.sicapi.dto.response.PaginationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

public class PaginationUtil {

    private PaginationUtil() {} // ป้องกันการ instantiate

    /**
     * Single conversion point: API contract is always 1-based `page`.
     * Spring's Pageable/PageRequest is always 0-based internally - never build
     * a PageRequest anywhere else in the codebase, always go through here.
     */
    public static org.springframework.data.domain.Pageable toPageable(int page, int size, Sort sort) {
        int zeroBasedPage = Math.max(page - 1, 0);
        int safeSize = size > 0 ? size : 10;
        return sort != null ? PageRequest.of(zeroBasedPage, safeSize, sort) : PageRequest.of(zeroBasedPage, safeSize);
    }

    public static org.springframework.data.domain.Pageable toPageable(int page, int size) {
        return toPageable(page, size, null);
    }

    public static <T> PaginationResponse<T> of(List<T> data, int pageNumberZeroBased, int pageSize, long totalElements) {
        PaginationResponse<T> response = new PaginationResponse<>();
        response.setData(data != null ? data : new ArrayList<>());

        Pageable pageable = new Pageable();
        pageable.setPageNumber(pageNumberZeroBased + 1);  
        pageable.setPageSize(pageSize);
        pageable.setTotalElements(totalElements);
        pageable.calculateTotalPages();

        response.setPageable(pageable);
        return response;
    }

    public static <T> PaginationResponse<T> of(Page<T> page) {
        if (page == null) {
            return of(new ArrayList<>(), 0, 10, 0);
        }
        return of(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
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