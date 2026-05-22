using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Db_Parameter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(table: "db_parameter", columns: new[] {
                    "id",
                    "module_code",
                    "parameter_code",
                    "parameter_value",
                    "parameter_name_en",
                    "parameter_name_local",
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

                { new Guid("019d9592-01fe-79f6-9bae-33760096c5c6"),  "COMMON", "AWNSER", "Y","Yes","ใช่", 1, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019d9592-1d5a-72af-8370-e4a580bcd575"),  "COMMON", "AWNSER", "N","No","ไม่ใช่", 2, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
               
                { new Guid("019dfbd9-aa27-7a47-be44-8b805bff7e10"),  "DB", "PERSON_TYPE", "INDIVIDUAL","Individual ","บุคคลธรรมดา", 1, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null },
                { new Guid("019dfbd9-cd79-7a0b-915e-c9ef1452050b"),  "DB", "PERSON_TYPE", "CORPORATE","Corporate ","นิติบุคคล", 2, true, "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc), false, null, null }
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "db_parameter",
                keyColumn: "id",
                keyValues: new object[]
                {
                    new Guid("019d9592-01fe-79f6-9bae-33760096c5c6"),
                    new Guid("019d9592-1d5a-72af-8370-e4a580bcd575"),
                    new Guid("019dfbd9-aa27-7a47-be44-8b805bff7e10"),
                    new Guid("019dfbd9-cd79-7a0b-915e-c9ef1452050b")
                });
        }
    }
}
