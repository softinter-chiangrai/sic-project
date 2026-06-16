package com.softinter.sicapi.util;

import org.springframework.context.i18n.LocaleContextHolder;

public class LanguageUtils {

    public static boolean useEnglish() {
        return !"th".equalsIgnoreCase(getLanguage());
    }

    public static String getLanguage() {
        String lang = LocaleContextHolder.getLocale().getLanguage();
        return lang != null ? lang : "en";
    }
}