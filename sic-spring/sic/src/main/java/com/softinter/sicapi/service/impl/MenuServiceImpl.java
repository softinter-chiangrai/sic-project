package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.MenuResponse;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.MenuService;
import com.softinter.sicapi.service.RequestLanguageProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final SuProgramRepository programRepository;
    private final BusinessAccessService businessAccessService;
    private final CurrentUserService currentUserService;
    private final RequestLanguageProvider requestLanguageProvider;

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

        // ดึง programs ที่ user มีสิทธิ์ตาม business
        List<SuProgram> programs = programRepository.findAccessiblePrograms(businessId, userId);

        if (programs.isEmpty()) {
            return Collections.emptyList();
        }

        // เตรียมข้อมูลสำหรับ build tree
        Map<UUID, List<SuProgram>> childrenMap = new HashMap<>();
        for (SuProgram p : programs) {
            UUID parentId = p.getParentProgramId();
            childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(p);
        }

        // สร้าง node root (parent = null)
        List<SuProgram> roots = new ArrayList<>(childrenMap.getOrDefault(null, Collections.emptyList()));
        roots.sort(Comparator.comparing(SuProgram::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(SuProgram::getProgramCode));

        List<MenuResponse> menuList = new ArrayList<>();
        for (SuProgram root : roots) {
            menuList.add(buildNode(root, childrenMap, useEnglish));
        }
        return menuList;
    }

    private MenuResponse buildNode(SuProgram program, Map<UUID, List<SuProgram>> childrenMap, boolean useEnglish) {
        MenuResponse node = new MenuResponse();
        node.setName(useEnglish ? program.getNameEn() : program.getNameLocal());
        node.setIcon(program.getIcon());
        node.setPath(program.getRoutePath());
        node.setCode(program.getProgramCode());

        List<SuProgram> children = new ArrayList<>(childrenMap.getOrDefault(program.getId(), Collections.emptyList()));
        children.sort(Comparator.comparing(SuProgram::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(SuProgram::getProgramCode));

        for (SuProgram child : children) {
            node.getChildren().add(buildNode(child, childrenMap, useEnglish));
        }
        return node;
    }
}