using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Data_Db_Title : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
             migrationBuilder.InsertData(table: "db_title", columns: new[] {
                    "id",
                    "person_type",
                    "prefix_short_name_en",
                    "prefix_short_name_local",
                    "suffix_short_name_en",
                    "suffix_short_name_local",
                    "prefix_name_en",
                    "prefix_name_local",
                    "suffix_name_en",
                    "suffix_name_local",
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
                // --- INDIVIDUAL: พื้นฐาน ---
                { new Guid("019dfbe9-fe57-7f0d-b514-413f66771dd6"), "INDIVIDUAL", "Mr.", "นาย", null, null, "Mister", "นาย", null, null, 1, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe58-7435-be8b-a343a5cdbbf0"), "INDIVIDUAL", "Mrs.", "นาง", null, null, "Mistress", "นาง", null, null, 2, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe59-7c6c-be72-11e1ff48fcf1"), "INDIVIDUAL", "Ms.", "น.ส.", null, null, "Miss", "นางสาว", null, null, 3, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe5a-7354-8be7-895235b5671e"), "INDIVIDUAL", "Master", "ด.ช.", null, null, "Master", "เด็กชาย", null, null, 4, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe5b-75b7-9d17-6bb6759db2ed"), "INDIVIDUAL", "Miss", "ด.ญ.", null, null, "Miss", "เด็กหญิง", null, null, 5, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

                // --- INDIVIDUAL: ตำแหน่งวิชาการ ---
                { new Guid("019dfbe9-fe5c-7181-8c89-a03c9f366c28"), "INDIVIDUAL", "Dr.", "ดร.", null, null, "Doctor", "ดอกเตอร์", null, null, 6, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe5e-71dc-8ab4-0ac2c68a2bd2"), "INDIVIDUAL", "Asst. Prof.", "ผศ.", null, null, "Assistant Professor", "ผู้ช่วยศาสตราจารย์", null, null, 7, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe5f-7e12-806e-9eaea341a98d"), "INDIVIDUAL", "Assoc. Prof.", "รอง ผศ.", null, null, "Associate Professor", "รองศาสตราจารย์", null, null, 8, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe60-7d48-b957-54999bfe82df"), "INDIVIDUAL", "Prof.", "ศ.", null, null, "Professor", "ศาสตราจารย์", null, null, 9, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

                // --- INDIVIDUAL: ฐานันดรศักดิ์ / พระสงฆ์ ---
                { new Guid("019dfbe9-fe61-7ea0-b38b-10c2a416ce31"), "INDIVIDUAL", "M.C.", "ม.จ.", null, null, "Mom Chao", "หม่อมเจ้า", null, null, 10, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe62-7df8-a559-841c153c8888"), "INDIVIDUAL", "M.R.", "ม.ร.ว.", null, null, "Mom Rajawong", "หม่อมราชวงศ์", null, null, 11, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe63-71e5-8bdf-407fe3e58398"), "INDIVIDUAL", "M.L.", "ม.ล.", null, null, "Mom Luang", "หม่อมหลวง", null, null, 12, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe64-73a9-a3c9-45605f67e3a4"), "INDIVIDUAL", "Phra", "พระ", null, null, "Buddhist Monk", "พระสงฆ์", null, null, 13, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },

                // --- CORPORATE: นิติบุคคลทั่วไป ---
                { new Guid("019dfbe9-fe65-7803-baac-87ba4718ccb7"), "CORPORATE", "Co.,", "บจก.", "Ltd.", null, "Company", "บริษัท", "Limited", "จำกัด", 14, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe66-7c72-a9ea-e79a674a66d2"), "CORPORATE", "Ltd. Part.", "หจก.", null, null, "Limited Partnership", "ห้างหุ้นส่วน", null, "จำกัด", 15, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe67-7091-94e7-46ed908918a3"), "CORPORATE", "Reg. Ord. Part.", "หสน.", null, null, "Registered Ordinary Partnership", "ห้างหุ้นส่วนสามัญนิติบุคคล", null, null, 16, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe68-73cd-b50f-ee4130b7dfbc"), "CORPORATE", "PCL.", "บมจ.", null, null, "Public Company Limited", "บริษัท", "Public Company Limited", "จำกัด (มหาชน)", 17, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe69-725a-adc1-d55d57745a2a"), "CORPORATE", "Found.", "มูลนิธิ", null, null, "Foundation", "มูลนิธิ", null, null, 18, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null },
                { new Guid("019dfbe9-fe6a-7401-8b97-94d23cc3b5ac"), "CORPORATE", "Assoc.", "สมาคม", null, null, "Association", "สมาคม", null, null, 19, true, "system", DateTime.UtcNow, "system", DateTime.UtcNow, false, null, null }

            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "db_title",
                keyColumn: "id",
                keyValues: new object[]
                {
                    new Guid("019dfbe9-fe5b-75b7-9d17-6bb6759db2ed"),
                    new Guid("019dfbe9-fe5c-7181-8c89-a03c9f366c28"),
                    new Guid("019dfbe9-fe5e-71dc-8ab4-0ac2c68a2bd2"),
                    new Guid("019dfbe9-fe5f-7e12-806e-9eaea341a98d"),
                    new Guid("019dfbe9-fe60-7d48-b957-54999bfe82df"),
                    new Guid("019dfbe9-fe61-7ea0-b38b-10c2a416ce31"),
                    new Guid("019dfbe9-fe62-7df8-a559-841c153c8888"),
                    new Guid("019dfbe9-fe63-71e5-8bdf-407fe3e58398"),
                    new Guid("019dfbe9-fe64-73a9-a3c9-45605f67e3a4"),
                    new Guid("019dfbe9-fe65-7803-baac-87ba4718ccb7"),
                    new Guid("019dfbe9-fe66-7c72-a9ea-e79a674a66d2"),
                    new Guid("019dfbe9-fe67-7091-94e7-46ed908918a3"),
                    new Guid("019dfbe9-fe68-73cd-b50f-ee4130b7dfbc"),
                    new Guid("019dfbe9-fe69-725a-adc1-d55d57745a2a"),
                    new Guid("019dfbe9-fe6a-7401-8b97-94d23cc3b5ac")
                });
        }
    }
}
