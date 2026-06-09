using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_BusinessInviteUsageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "max_uses",
                table: "su_business_invite",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "use_count",
                table: "su_business_invite",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "max_uses",
                table: "su_business_invite");

            migrationBuilder.DropColumn(
                name: "use_count",
                table: "su_business_invite");
        }
    }
}
