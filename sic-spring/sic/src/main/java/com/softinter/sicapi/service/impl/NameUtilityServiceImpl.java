package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.NameUtilityService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class NameUtilityServiceImpl implements NameUtilityService {

    @Override
    public String joinNames(String[] names) {
        if (names == null) {
            return "";
        }
        return Arrays.stream(names)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(" "))
                .trim();
    }
}
