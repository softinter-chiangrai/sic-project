package spring.sic.model;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileModel {

    @NotBlank(message = "ชื่อจริงห้ามว่าง")
    @Size(max = 100, message = "ชื่อจริงยาวเกินไป")
    private String firstName;

    @NotBlank(message = "นามสกุลห้ามว่าง")
    @Size(max = 100, message = "นามสกุลยาวเกินไป")
    private String lastName;

    @NotBlank(message = "อีเมลห้ามว่าง")
    @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
    @Size(max = 150, message = "อีเมลยาวเกินไป")
    private String email;

    @NotBlank(message = "เบอร์โทรศัพท์ห้ามว่าง")
    @Pattern(
        regexp = "^0[689]\\d{8}$",
        message = "เบอร์มือถือต้องเป็นเลข 10 หลัก"
    )
    private String phone;

    @NotBlank(message = "กรุณาระบุเพศ")
    @Pattern(
        regexp = "^(male|female|other|prefer not to say)$",
        message = "ระบุเพศไม่ถูกต้อง"
    )
    private String gender;

    @NotNull(message = "กรุณาระบุวันเกิด")
    @Past(message = "วันเกิดต้องเป็นอดีต")
    private LocalDate birthDate;

    private String avatarUrl;

    @Size(max = 500)
    private String bio;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    @Pattern(
        regexp = "^\\d{5}$",
        message = "รหัสไปรษณีย์ 5 หลัก"
    )
    private String postalCode;

    @NotBlank
    private String country;

    private String subDistrict;

    @NotBlank
    @Size(min = 8)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "ต้องมีตัวเล็ก ตัวใหญ่ และเลข"
    )
    private String passwordHash;

}