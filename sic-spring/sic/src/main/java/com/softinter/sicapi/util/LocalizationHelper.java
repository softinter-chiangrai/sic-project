package com.softinter.sicapi.util;

import com.softinter.sicapi.dto.response.MenuProgramResponse;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbParameter;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.db.DbTitle;
import com.softinter.sicapi.entity.ex.ExExample;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuMessage;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.su.SuProgram;
import lombok.experimental.UtilityClass;

import java.util.Map;
import java.util.function.Supplier;

@UtilityClass
public class LocalizationHelper {

    // ============================================================
    // 1. Core Methods
    // ============================================================

    public static String getLocalized(Map<String, Supplier<String>> langMap) {
        if (langMap == null || langMap.isEmpty()) {
            return null;
        }
        String lang = LanguageUtils.getLanguage();
        Supplier<String> supplier = langMap.get(lang);
        if (supplier == null) {
            supplier = langMap.get("en");
        }
        return supplier != null ? supplier.get() : null;
    }

    @Deprecated
    public static String getLocalized(Supplier<String> enSupplier, Supplier<String> localSupplier) {
        return getLocalized(Map.of("en", enSupplier, "th", localSupplier));
    }

    // ============================================================
    // 2. Helper Methods สำหรับ Entity / DTO
    // ============================================================

    // ---- 2.1 SuBusinessRole ----
    public static String getRoleName(SuBusinessRole role) {
        if (role == null) return null;
        return getLocalized(Map.of(
                "en", role::getRoleNameEn,
                "th", role::getRoleNameLocal
        ));
    }

    // ---- 2.2 SuProgram ----
    public static String getProgramName(SuProgram program) {
        if (program == null) return null;
        return getLocalized(Map.of(
                "en", program::getNameEn,
                "th", program::getNameLocal
        ));
    }

    // ---- 2.3 SuProfile ----
    public static String getFullName(SuProfile profile) {
        if (profile == null) return null;
        String lang = LanguageUtils.getLanguage();
        String firstName, middleName, lastName;
        switch (lang) {
            case "th":
                firstName = profile.getFirstNameLocal();
                middleName = profile.getMiddleNameLocal();
                lastName = profile.getLastNameLocal();
                break;
            case "en":
            default:
                firstName = profile.getFirstNameEn();
                middleName = profile.getMiddleNameEn();
                lastName = profile.getLastNameEn();
                break;
        }
        return joinNameParts(firstName, lastName, middleName);
    }

    // ---- 2.4 SuBusiness ----
    public static String getBusinessName(SuBusiness business) {
        if (business == null) return null;
        String lang = LanguageUtils.getLanguage();
        String firstName, middleName, lastName;
        switch (lang) {
            case "th":
                firstName = business.getFirstNameLocal();
                middleName = business.getMiddleNameLocal();
                lastName = business.getLastNameLocal();
                break;
            case "en":
            default:
                firstName = business.getFirstNameEn();
                middleName = business.getMiddleNameEn();
                lastName = business.getLastNameEn();
                break;
        }
         return joinNameParts(firstName, lastName, middleName);
    }

    // ---- 2.5 DbCountry ----
    public static String getCountryName(DbCountry country) {
        if (country == null) return null;
        return getLocalized(Map.of(
                "en", country::getCountryNameEn,
                "th", country::getCountryNameLocal
        ));
    }

    // ---- 2.6 DbProvince ----
    public static String getProvinceName(DbProvince province) {
        if (province == null) return null;
        return getLocalized(Map.of(
                "en", province::getProvinceNameEn,
                "th", province::getProvinceNameLocal
        ));
    }

    // ---- 2.7 DbDistrict ----
    public static String getDistrictName(DbDistrict district) {
        if (district == null) return null;
        return getLocalized(Map.of(
                "en", district::getDistrictNameEn,
                "th", district::getDistrictNameLocal
        ));
    }

    // ---- 2.8 DbSubDistrict ----
    public static String getSubDistrictName(DbSubDistrict subDistrict) {
        if (subDistrict == null) return null;
        return getLocalized(Map.of(
                "en", subDistrict::getSubDistrictNameEn,
                "th", subDistrict::getSubDistrictNameLocal
        ));
    }

    // ---- 2.9 SuMessage ----
    public static String getMessage(SuMessage message) {
        if (message == null) return null;
        return getLocalized(Map.of(
                "en", message::getMessageEn,
                "th", message::getMessageLocal
        ));
    }

    // ---- 2.10 DbTitle ----
    public static String getTitleName(DbTitle title) {
        if (title == null) return null;
        return getLocalized(Map.of(
                "en", title::getPrefixNameEn,
                "th", title::getPrefixNameLocal
        ));
    }

    // ---- 2.11 DbParameter ----
    public static String getParameterName(DbParameter param) {
        if (param == null) return null;
        return getLocalized(Map.of(
                "en", param::getParameterNameEn,
                "th", param::getParameterNameLocal
        ));
    }

    // ---- 2.12 MenuProgramResponse (DTO) ----
    public static String getMenuProgramName(MenuProgramResponse program) {
        if (program == null) return null;
        return getLocalized(Map.of(
                "en", program::getNameEn,
                "th", program::getNameLocal
        ));
    }

    // ============================================================
    // 3. Utility – Join Name Parts
    // ============================================================

    private static String joinNameParts(String... parts) {
        if (parts == null) return "";
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part != null && !part.isBlank()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(part);
            }
        }
        return sb.toString().trim();
    }

    // ============================================================
    // 4. Generic Helper
    // ============================================================

    public static String getText(Supplier<String> en, Supplier<String> local) {
        return getLocalized(Map.of("en", en, "th", local));
    }

    // LocalizationHelper.java
public static String getMessage(ExExample example) {
    if (example == null) return null;
    return getLocalized(Map.of(
            "en", example::getMessageEn,
            "th", example::getMessageLocal
    ));
}
}