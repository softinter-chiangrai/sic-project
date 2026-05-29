package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.dto.Pageable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse<T> {
    private List<T> data = new ArrayList<>();
    private Pageable pageable = new Pageable();
}
