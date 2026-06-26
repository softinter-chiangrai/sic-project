package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.MenuResponse;
import java.util.List;

public interface MenuService {
    List<MenuResponse> getMenu();
}
