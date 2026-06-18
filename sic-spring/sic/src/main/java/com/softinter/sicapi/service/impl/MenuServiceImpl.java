package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.MenuProgramResponse;
import com.softinter.sicapi.dto.response.MenuResponse;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final SuProgramRepository programRepository;
    private final BusinessAccessService businessAccessService;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> getMenu(boolean useEnglish) {
        UUID businessId = businessAccessService.getBusinessId();
        String userId = currentUserService.getUserId();

        log.info("getMenu called: businessId = {}, userId = {}", businessId, userId);

        if (businessId == null || userId == null) {
            log.warn("BusinessId or UserId is null, cannot fetch menu.");
            return Collections.emptyList();
        }

        List<MenuProgramResponse> programs = programRepository.findAccessibleProgramsWithPermission(businessId, userId);

        if (programs.isEmpty()) {
            return Collections.emptyList();
        }

        // Build tree
        Map<UUID, List<MenuProgramResponse>> childrenMap = new HashMap<>();
        for (MenuProgramResponse p : programs) {
            UUID parentId = p.getParentProgramId();
            childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(p);
        }

        List<MenuProgramResponse> roots = new ArrayList<>(childrenMap.getOrDefault(null, Collections.emptyList()));
        roots.sort(Comparator.comparing(MenuProgramResponse::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(MenuProgramResponse::getProgramCode));

        List<MenuResponse> menuList = new ArrayList<>();
        for (MenuProgramResponse root : roots) {
            menuList.add(buildNode(root, childrenMap, useEnglish));
        }
        return menuList;
    }

    private MenuResponse buildNode(MenuProgramResponse program, Map<UUID, List<MenuProgramResponse>> childrenMap, boolean useEnglish) {
        MenuResponse node = new MenuResponse();

        // ข้อมูลหลัก
        node.setName(useEnglish ? program.getNameEn() : program.getNameLocal());
        node.setIcon(program.getIcon());
        node.setPath(program.getRoutePath());
        node.setCode(program.getProgramCode());

        // state และ rowVersion
        node.setState(program.getState() != null ? program.getState() : 0);
        node.setRowVersion(program.getRowVersion());

        // ✅ permission fields (ใช้ setter ที่ Lombok สร้างให้)
        node.setAdd(program.isAdd());
        node.setBack(program.isBack());
        node.setPrint(program.isPrint());
        node.setRemove(program.isRemove());
        node.setSave(program.isSave());
        node.setSearch(program.isSearch());

        // Children
        List<MenuProgramResponse> children = new ArrayList<>(childrenMap.getOrDefault(program.getId(), Collections.emptyList()));
        children.sort(Comparator.comparing(MenuProgramResponse::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(MenuProgramResponse::getProgramCode));

        for (MenuProgramResponse child : children) {
            node.getChildren().add(buildNode(child, childrenMap, useEnglish));
        }

        return node;
    }
}