using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class initial_data_su_program : Migration
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
                { new Guid("019e6d7a-9d66-730d-b4bf-a1029267928a"),  null, "BUDT1000", "bi bi-building","Business","ธุรกิจ", null, 10, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019e6d7a-fe78-7b70-80f4-6370188f196c"),  new Guid("019e6d7a-9d66-730d-b4bf-a1029267928a"), "BUDT1001", "bi bi-diagram-2","Business Infomation","ข้อมูลทางธุรกิจ", "bu/budt01", 100, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019e6d7b-1947-7681-9ceb-a7863d1ad497"),  new Guid("019e6d7a-9d66-730d-b4bf-a1029267928a"), "BUDT1002", "bi bi-diagram-2","Role Management","จัดการบทบาท", "bu/budt02", 100, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019e6d7b-4a07-763c-9593-71956b838a90"),  new Guid("019e6d7a-9d66-730d-b4bf-a1029267928a"), "BUDT1003", "bi bi-menu-button-wide-fill","Permission Management","จัดการสิทธิ์", "bu/budt03", 100, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019e6d7b-64dd-76f4-8afd-bf9f7b9db5bf"),  new Guid("019e6d7a-9d66-730d-b4bf-a1029267928a"), "BUDT1004", "bi bi-people","Team Management","จัดการทีม", "bu/budt04", 100, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
