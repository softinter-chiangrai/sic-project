using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Su_Program : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(table: "su_program", columns: new[] {
                "id",
                "parent_program_id",
                "program_code",
                "icon",
                "name_en",
                "name_local",
                "route_path",
                "sort_order",
                "is_active",
                "role_back",
                "role_search",
                "role_add",
                "role_save",
                "role_delete",
                "role_print",
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
                { new Guid("019eb052-cb86-76e1-b193-aa7c049709c2"), null, "BU", "bi bi-building", "Business", "ธุรกิจ", null, 10, true, false, false, false, false, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb052-e6bc-7d6c-b099-d9b7e8e2625a"), new Guid("019eb052-cb86-76e1-b193-aa7c049709c2"), "BURT", "bi bi-gear", "Setting", "ตั้งค่า", null, 10, true, false, false, false, false, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb053-57ff-7647-a61e-55b24dd1f19c"), new Guid("019eb052-e6bc-7d6c-b099-d9b7e8e2625a"), "BURT01", "bi bi-building", "Business Infomation", "ข้อมูลทางธุรกิจ", "bu/burt01", 10, true, false, false, false, true, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb053-7344-754a-ad1a-4a3bf3f8df67"), new Guid("019eb052-e6bc-7d6c-b099-d9b7e8e2625a"), "BURT02", "bi bi-diagram-2", "Role Management", "จัดการบทบาท", "bu/burt02", 20, true, false, false, false, true, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb053-9560-7395-9afe-539cdb0cb5cb"), new Guid("019eb052-e6bc-7d6c-b099-d9b7e8e2625a"), "BURT03", "bi bi-menu-button-wide-fill", "Permission Management", "จัดการสิทธิ์", "bu/burt03", 30, true, false, false, false, true, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb053-ab89-7cd0-a5e4-672ceee3ec14"), new Guid("019eb052-e6bc-7d6c-b099-d9b7e8e2625a"), "BURT04", "bi bi-people", "Team Management", "จัดการทีม", "bu/burt04", 40, true, false, false, false, true, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb054-c2a5-7461-be43-070fefbcefac"), new Guid("019eb052-cb86-76e1-b193-aa7c049709c2"), "BURP", "bi bi-activity", "Activity", "กิจกรรม", null, 20, true, false, false, false, false, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019eb064-cd43-7f87-b6af-8be582607f2f"), new Guid("019eb054-c2a5-7461-be43-070fefbcefac"), "BURP01", "bi bi-hourglass", "Activity Log", "ประวัติกิจกรรม", "rp/burp01", 10, true, false, true, false, false, false, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },

                { new Guid("019f1c67-b144-72f2-8744-f2e47b91d69d"), null, "MP", "bi bi-wrench-adjustable", "Customized Business", "ปรับแต่งตามธุรกิจ", null, 20, true, false, false, false, false, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019f1c7a-ab21-7010-997c-577793b020c3"), new Guid("019f1c67-b144-72f2-8744-f2e47b91d69d"), "MPRT01", "bi bi-bag-plus-fill", "New Customized", "เพิ่มการปรับแต่ง", "mp/mprt01", 10, true, false, false, false, true, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019f1c7c-ae73-7060-988a-dc21e3bad35c"), new Guid("019f1c67-b144-72f2-8744-f2e47b91d69d"), "MPRT02", "bi bi-floppy", "Install Customized", "ติดตั้งการปรับแต่ง", "mp/mprt02", 20, true, false, false, false, false, false, false, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
