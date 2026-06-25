using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class update_mp_business_xxx_index_key : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_business_id_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE");

            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_business_id_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE");

            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_table_name",
                table: "MP_BUSINESS_ENTITY_TABLE");

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_business_id_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE",
                columns: new[] { "business_id", "marketplace_id" });

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_business_id_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE",
                columns: new[] { "business_id", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_table_name",
                table: "MP_BUSINESS_ENTITY_TABLE",
                column: "table_name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_business_id_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE");

            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_business_id_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE");

            migrationBuilder.DropIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_table_name",
                table: "MP_BUSINESS_ENTITY_TABLE");

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_business_id_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE",
                columns: new[] { "business_id", "marketplace_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_business_id_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE",
                columns: new[] { "business_id", "entity_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_table_name",
                table: "MP_BUSINESS_ENTITY_TABLE",
                column: "table_name",
                unique: true);
        }
    }
}
