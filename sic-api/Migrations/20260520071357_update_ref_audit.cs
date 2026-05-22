using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class update_ref_audit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "su_business_audit",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_su_business_audit_business_id",
                table: "su_business_audit",
                column: "business_id");

            migrationBuilder.AddForeignKey(
                name: "FK_su_business_audit_su_business_business_id",
                table: "su_business_audit",
                column: "business_id",
                principalTable: "su_business",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_su_business_audit_su_business_business_id",
                table: "su_business_audit");

            migrationBuilder.DropIndex(
                name: "IX_su_business_audit_business_id",
                table: "su_business_audit");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "su_business_audit");
        }
    }
}
