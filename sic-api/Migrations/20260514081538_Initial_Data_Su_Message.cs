using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Su_Message : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(table: "su_message", columns: new[] {
                "id",
                "module_code",
                "program_code",
                "message_code",
                "message_en",
                "message_local",
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
                { new Guid("019d4294-2d6e-736b-a658-9827f03a0c64"),  "COMMON", "ALL", "APP_TITLE","SoftInter ChiangRai Co.,Ltd","บริษัท ซอฟต์อินเตอร์ เชียงราย จำกัด", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42a4-04d2-7349-b98c-b6d0597e1ddd"),  "COMMON", "ALL", "APP_SIGNIN","Sign In","เข้าใช้งาน", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42db-0e2f-7fc1-8eb6-8e1446810089"),  "COMMON", "ALL", "APP_CHANGE_LANGUAGE","Change Language","เปลี่ยนภาษา", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42e1-45c0-7370-b403-de065432bab9"),  "COMMON", "ALL", "APP_CHANGE_THEME","Change Theme","เปลี่ยนธีม", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42e1-5eb7-729e-8f72-138ecb4263b3"),  "COMMON", "ALL", "APP_CHAT","Chat","ข้อความ", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42e1-7f8a-7dd8-b079-ffa9173f3dae"),  "COMMON", "ALL", "APP_NOTIFY","Notification","การแจ้งเตือน", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42e1-9ab3-70c1-9507-24f1452759e8"),  "COMMON", "ALL", "APP_CALENDAR","Calendar","ตารางงาน", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d42f5-4454-716d-b8b4-9cd3723d2cf1"),  "COMMON", "ALL", "APP_SIGNOUT","Sign Out","ออกจากระบบ", "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "su_message",
                keyColumn: "id",
                keyValues: new object[]
                {
                    new Guid("019d4294-2d6e-736b-a658-9827f03a0c64"),
                    new Guid("019d42a4-04d2-7349-b98c-b6d0597e1ddd"),
                    new Guid("019d42db-0e2f-7fc1-8eb6-8e1446810089"),
                    new Guid("019d42e1-45c0-7370-b403-de065432bab9"),
                    new Guid("019d42e1-5eb7-729e-8f72-138ecb4263b3"),
                    new Guid("019d42e1-7f8a-7dd8-b079-ffa9173f3dae"),
                    new Guid("019d42e1-9ab3-70c1-9507-24f1452759e8"),
                    new Guid("019d42f5-4454-716d-b8b4-9cd3723d2cf1")
                });
        }
    }
}
