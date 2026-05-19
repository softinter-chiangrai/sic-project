// DTO/Model: DbMailConfigDto.java (ปรับเพิ่ม Lombok ให้เต็มที่)
package spring.sic.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import spring.sic.entity.DbMailConfigEntity;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DbMailConfigModel {
    
    // ===== สำหรับ Response เท่านั้น (Read Only) =====
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String createdBy;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdDate;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedBy;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedDate;
    
    // ===== สำหรับ Request และ Response =====
    @NotBlank(message = "Config name is required")
    private String configName;
    
    @NotBlank(message = "SMTP server is required")
    private String smtpServer;
    
    @NotNull(message = "SMTP port is required")
    @Min(value = 1, message = "SMTP port must be greater than 0")
    private Integer smtpPort;
    
    private String emailFrom;
    
    private String username;
    
    // Password: รับได้จาก Request แต่ไม่ส่งกลับใน Response
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Builder.Default
    private Boolean enableSsl = false;
    
    @Min(value = 0, message = "Sort order must be 0 or greater")
    private Integer sortOrder;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Min(value = 0, message = "Max retry must be 0 or greater")
    @Builder.Default
    private Integer maxRetry = 3;
    
    private String description;
    
    
}