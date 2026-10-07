package com.softinter.sicapi.util;

import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** เลขสัญญาฉบับต่ออายุ: CT-001 → CT-001-R1 → CT-001-R2 (ตรงกับ Pmrt04BForm.computeRenewalContractNo ฝั่ง frontend) */
public final class ContractNoHelper {

    private static final Pattern RENEWAL_SUFFIX = Pattern.compile("^(.*?)-R(\\d+)$", Pattern.CASE_INSENSITIVE);

    private ContractNoHelper() {
    }

    public static String nextRenewalNo(String contractNo) {
        if (contractNo == null || contractNo.isBlank()) {
            return "";
        }
        Matcher m = RENEWAL_SUFFIX.matcher(contractNo);
        if (m.matches()) {
            return m.group(1) + "-R" + (Integer.parseInt(m.group(2)) + 1);
        }
        return contractNo + "-R1";
    }

    /** เหมือน nextRenewalNo แต่เลื่อนต่อไปถ้าเลขนั้นถูกใช้แล้ว */
    public static String nextAvailableRenewalNo(String contractNo, Predicate<String> exists) {
        String candidate = nextRenewalNo(contractNo);
        while (exists.test(candidate)) {
            candidate = nextRenewalNo(candidate);
        }
        return candidate;
    }
}
