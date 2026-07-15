using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Db_MailTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(table: "db_mail_template", columns: new[] {
                "id",
                "template_code",
                "template_name",
                "subject_en",
                "subject_local",
                "content_en",
                "content_local",
                "is_html",
                "is_active",
                "variables",
                "created_by",
                "created_date",
                "updated_by",
                "updated_date",
                "is_delete",
                "delete_by",
                "delete_date"
            },
            values: new object[,]
            {
                {
                    new Guid("019e1584-2f25-77e4-a1a6-3cd3b48acac2"),
                    "VERIFY_EMAIL",
                    "Email Verification",
                    "Please Verify Your Email Address",
                    "โปรดยืนยันที่อยู่อีเมลของคุณ",
                    "<html><body><p>Dear {Recipient},</p><p>Thank you for registering. Please verify your email address by clicking the link below:</p><p><a href=\"{VerificationLink}\">Verify Email</a></p><p>Or use this code: <strong>{VerifyToken}</strong></p><p>This link expires in {ExpirationMinutes} minutes.</p><p>Best regards,<br>SIC Project Team</p></body></html>",
                    "<html><body><p>เรียน {Recipient}</p><p>ขอบคุณสำหรับการลงทะเบียน กรุณายืนยันที่อยู่อีเมลของคุณโดยคลิกลิงก์ด้านล่าง:</p><p><a href=\"{VerificationLink}\">ยืนยันอีเมล</a></p><p>หรือใช้รหัสนี้: <strong>{VerifyToken}</strong></p><p>ลิงก์นี้จะหมดอายุภายใน {ExpirationMinutes} นาที</p><p>ขอแสดงความนับถือ<br>ทีมงาน SIC Project</p></body></html>",
                    true,
                    true,
                    "Recipient,VerificationLink,VerifyToken,ExpirationMinutes",
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    false,
                    null,
                    null
                },
                {
                    new Guid("019e1584-3a36-88f5-b2b7-4de4c59bdb3d"),
                    "RESET_PASSWORD",
                    "Password Reset Request",
                    "Reset Your Password",
                    "รีเซ็ตรหัสผ่านของคุณ",
                    "<html><body><p>Dear {Recipient},</p><p>You requested to reset your password. Click the link below to proceed:</p><p><a href=\"{ResetLink}\">Reset Password</a></p><p>Or use this code: <strong>{ResetToken}</strong></p><p>This link expires in {ExpirationMinutes} minutes.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>SIC Project Team</p></body></html>",
                    "<html><body><p>เรียน {Recipient}</p><p>คุณได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อดำเนินการ:</p><p><a href=\"{ResetLink}\">รีเซ็ตรหัสผ่าน</a></p><p>หรือใช้รหัสนี้: <strong>{ResetToken}</strong></p><p>ลิงก์นี้จะหมดอายุภายใน {ExpirationMinutes} นาที</p><p>หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p><p>ขอแสดงความนับถือ<br>ทีมงาน SIC Project</p></body></html>",
                    true,
                    true,
                    "Recipient,ResetLink,ResetToken,ExpirationMinutes",
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    false,
                    null,
                    null
                },
                {
                    new Guid("019e1584-4b47-99a6-c3c8-5ef5d60cec4e"),
                    "WELCOME_EMAIL",
                    "Welcome to SIC Project",
                    "Welcome Aboard!",
                    "ยินดีต้อนรับสู่ SIC Project",
                    "<html><body><p>Dear {Recipient},</p><p>Welcome to SIC Project! We are excited to have you on board.</p><p>Your account has been successfully created. You can now log in and start using our services.</p><p><a href=\"{AppUrl}\">Go to Application</a></p><p>If you have any questions, feel free to contact us.</p><p>Best regards,<br>SIC Project Team</p></body></html>",
                    "<html><body><p>เรียน {Recipient}</p><p>ยินดีต้อนรับสู่ SIC Project เราดีใจที่คุณเข้าร่วมใช้งานกับเรา</p><p>บัญชีของคุณถูกสร้างเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบและเริ่มใช้งานบริการของเราได้ทันที</p><p><a href=\"{AppUrl}\">เข้าสู่แอปพลิเคชัน</a></p><p>หากมีข้อสงสัย สามารถติดต่อเราได้</p><p>ขอแสดงความนับถือ<br>ทีมงาน SIC Project</p></body></html>",
                    true,
                    true,
                    "Recipient,AppUrl",
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    false,
                    null,
                    null
                },
                {
                    new Guid("019e1584-5c58-aab7-d4d9-6ef6e71dfd5f"),
                    "NOTIFICATION",
                    "Notification Template",
                    "{NotificationTitle}",
                    "{NotificationTitle}",
                    "<html><body><p>Dear {Recipient},</p><p>{NotificationMessage}</p><p>Best regards,<br>SIC Project Team</p></body></html>",
                    "<html><body><p>เรียน {Recipient}</p><p>{NotificationMessage}</p><p>ขอแสดงความนับถือ<br>ทีมงาน SIC Project</p></body></html>",
                    true,
                    true,
                    "Recipient,NotificationTitle,NotificationMessage",
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    "system",
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc),
                    false,
                    null,
                    null
                }
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
