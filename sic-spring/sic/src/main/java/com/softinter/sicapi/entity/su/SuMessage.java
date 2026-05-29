package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "su_message",
       indexes = {
           @Index(name = "idx_module_program_message", columnList = "module_code, program_code, message_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuMessage extends BaseEntity {

    @Column(name = "module_code", nullable = false, length = 10)
    private String moduleCode;

    @Column(name = "program_code", nullable = false, length = 50)
    private String programCode;

    @Column(name = "message_code", nullable = false, length = 50)
    private String messageCode;

    @Column(name = "message_en", nullable = false, length = 255)
    private String messageEn;

    @Column(name = "message_local", nullable = false, length = 255)
    private String messageLocal;

    public void setIsActive(Boolean isActive) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setIsActive'");
    }
}
