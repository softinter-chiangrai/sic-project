package spring.sic.main;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/i18n")
@RequiredArgsConstructor
public class I18nController {
    private final I18nService i18nService;

    @GetMapping("/COMMON/ALL/{lang}")
    public Map<String, String> getAllCommon(@PathVariable String lang) {
        return i18nService.getCommonTranslations(lang);
    }
}
