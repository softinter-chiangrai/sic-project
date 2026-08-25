package com.softinter.sicapi.util;

/**
 * Utility to shift Thai upper vowels and tone marks to Private Use Area (PUA) codepoints
 * for proper rendering in JasperReports / iText PDF generation with SIPA TH Sarabun New font.
 */
public final class ThaiGlyphUtil {

    private ThaiGlyphUtil() {}

    /**
     * Shifts Thai upper vowels and tone marks to PUA codepoints.
     */
    public static String adjust(String text) {
        if (text == null || text.isEmpty()) return text;
        char[] chars = text.toCharArray();
        StringBuilder sb = new StringBuilder(chars.length);

        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];
            char prev = i > 0 ? chars[i - 1] : 0;
            char prev2 = i > 1 ? chars[i - 2] : 0;

            boolean prevIsUpperVowel = isUpperVowel(prev);
            boolean prevIsTall = isTallConsonant(prev);
            boolean prev2IsTall = isTallConsonant(prev2);

            // 1. Tone mark (0x0E48 - 0x0E4C: ่ ้ ๊ ๋ ์)
            if (isToneMark(c)) {
                if (prevIsUpperVowel) {
                    if (prev2IsTall) {
                        // Upper vowel + Tone mark on tall consonant -> Top-Left tone
                        sb.append(getTopLeftTone(c));
                    } else {
                        // Upper vowel + Tone mark on normal consonant -> Top tone
                        sb.append(getUpperTone(c));
                    }
                } else if (prevIsTall) {
                    // Tone mark directly on tall consonant -> Left tone
                    sb.append(getLeftTone(c));
                } else {
                    sb.append(c);
                }
            }
            // 2. Upper vowel (0x0E31, 0x0E34-0x0E37, 0x0E47, 0x0E4D: ั ิ ี ึ ื ็ ํ)
            else if (isUpperVowel(c)) {
                if (prevIsTall) {
                    sb.append(getLeftUpperVowel(c));
                } else {
                    sb.append(c);
                }
            }
            // 3. Lower vowel (0x0E38-0x0E3A: ุ ู ฺ) on ฎ ฏ
            else if (isLowerVowel(c)) {
                if (prev == 0x0E0E || prev == 0x0E0F) {
                    sb.append(getLowerVowelDeep(c));
                } else {
                    sb.append(c);
                }
            }
            // 4. Consonant ญ (0x0E0D) or ฐ (0x0E10) before lower vowel
            else if (c == 0x0E0D || c == 0x0E10) {
                char next = (i + 1 < chars.length) ? chars[i + 1] : 0;
                if (isLowerVowel(next)) {
                    sb.append(c == 0x0E0D ? (char)0xF70F : (char)0xF700);
                } else {
                    sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private static boolean isUpperVowel(char c) {
        return c == 0x0E31 || (c >= 0x0E34 && c <= 0x0E37) || c == 0x0E47 || c == 0x0E4D || c == 0x0E4E;
    }

    private static boolean isToneMark(char c) {
        return c >= 0x0E48 && c <= 0x0E4C;
    }

    private static boolean isLowerVowel(char c) {
        return c >= 0x0E38 && c <= 0x0E3A;
    }

    private static boolean isTallConsonant(char c) {
        return c == 0x0E1B || c == 0x0E1D || c == 0x0E1F || c == 0x0E2C; // ป ฝ ฟ ฬ
    }

    private static char getUpperTone(char c) {
        switch (c) {
            case 0x0E48: return 0xF713; // ไม้เอก บน
            case 0x0E49: return 0xF714; // ไม้โท บน
            case 0x0E4A: return 0xF715; // ไม้ตรี บน
            case 0x0E4B: return 0xF716; // ไม้จัตวา บน
            case 0x0E4C: return 0xF717; // ทัณฑฆาต บน
            default: return c;
        }
    }

    private static char getLeftTone(char c) {
        switch (c) {
            case 0x0E48: return 0xF70A; // ไม้เอก หลบซ้าย
            case 0x0E49: return 0xF70B; // ไม้โท หลบซ้าย
            case 0x0E4A: return 0xF70C; // ไม้ตรี หลบซ้าย
            case 0x0E4B: return 0xF70D; // ไม้จัตวา หลบซ้าย
            case 0x0E4C: return 0xF70E; // ทัณฑฆาต หลบซ้าย
            default: return c;
        }
    }

    private static char getTopLeftTone(char c) {
        switch (c) {
            case 0x0E48: return 0xF705; // ไม้เอก บนหลบซ้าย
            case 0x0E49: return 0xF706; // ไม้โท บนหลบซ้าย
            case 0x0E4A: return 0xF707; // ไม้ตรี บนหลบซ้าย
            case 0x0E4B: return 0xF708; // ไม้จัตวา บนหลบซ้าย
            case 0x0E4C: return 0xF709; // ทัณฑฆาต บนหลบซ้าย
            default: return c;
        }
    }

    private static char getLeftUpperVowel(char c) {
        switch (c) {
            case 0x0E31: return 0xF710; // ไม้หันอากาศ หลบซ้าย
            case 0x0E34: return 0xF701; // สระอิ หลบซ้าย
            case 0x0E35: return 0xF702; // สระอี หลบซ้าย
            case 0x0E36: return 0xF703; // สระอึ หลบซ้าย
            case 0x0E37: return 0xF704; // สระอือ หลบซ้าย
            case 0x0E47: return 0xF712; // ไม้ไต่คู้ หลบซ้าย
            case 0x0E4D: return 0xF711; // นฤคหิต หลบซ้าย
            default: return c;
        }
    }

    private static char getLowerVowelDeep(char c) {
        switch (c) {
            case 0x0E38: return 0xF718; // สระอุ หลบล่าง
            case 0x0E39: return 0xF719; // สระอู หลบล่าง
            case 0x0E3A: return 0xF71A; // พินทุ หลบล่าง
            default: return c;
        }
    }
}
