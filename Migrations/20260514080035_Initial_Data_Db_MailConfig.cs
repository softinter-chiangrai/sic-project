using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Db_MailConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(table: "db_mail_config", columns: new[] {
                "id",
                "config_name",
                "smtp_server",
                "smtp_port",
                "email_from",
                "username",
                "password",
                "enable_ssl",
                "sort_order",
                "is_active",
                "max_retry",
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
                    new Guid("019e1575-4c8f-799f-a977-cc5f21596587"), 
                    "Gmail Default", 
                    "smtp.gmail.com", 
                    587, 
                    "noreply-sic-project@gmail.com", 
                    "atthapon904@gmail.com", 
                    "ltycrjscgrpwgpfg", 
                    true, 
                    1, 
                    true, 
                    3, 
                    "system", 
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc), 
                    "system", 
                    new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc), 
                    false, 
                    null, 
                    null 
                },
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "db_mail_config",
                keyColumn: "id",
                keyValues: new object[]
                {
                    new Guid("019e1575-4c8f-799f-a977-cc5f21596587"),
                }
            );
        }
    }
}
