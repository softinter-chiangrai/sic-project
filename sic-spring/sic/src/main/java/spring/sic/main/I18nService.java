package spring.sic.main;

import lombok.RequiredArgsConstructor;
import spring.sic.profile.su.su_message.SuMessageRepository;
import spring.sic.profile.utils.db_parameter.DbParameterRepository;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class I18nService {
    private final DbParameterRepository dbParameterRepository;
    private final SuMessageRepository suMessageRepository;

    public Map<String, String> getCommonTranslations(String lang) {
        Map<String, String> translations = new HashMap<>();
        boolean isThai = "th".equalsIgnoreCase(lang);

        // จาก db_parameter (module_code = 'COMMON')
        dbParameterRepository.findByModuleCodeAndIsActiveTrueAndIsDeleteFalse("COMMON")
                .forEach(p -> {
                    String key = p.getParameterCode();
                    String value = isThai ? p.getParameterNameLocal() : p.getParameterNameEn();
                    translations.put(key, value);
                });

        // จาก su_message (program_code = 'COMMON')
        suMessageRepository.findByProgramCodeAndIsActiveTrueAndIsDeleteFalse("COMMON")
                .forEach(m -> {
                    String key = m.getMessageCode();
                    String value = isThai ? m.getMessageLocal() : m.getMessageEn();
                    translations.put(key, value);
                });

        return translations;
    }
}