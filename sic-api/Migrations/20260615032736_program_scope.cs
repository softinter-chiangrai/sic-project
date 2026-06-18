using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class program_scope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_add",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_back",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_print",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_remove",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_save",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_search",
                table: "su_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_add",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_back",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_print",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_remove",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_save",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_search",
                table: "su_business_role_program",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_add",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_back",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_print",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_remove",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_save",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_search",
                table: "su_program");

            migrationBuilder.DropColumn(
                name: "is_add",
                table: "su_business_role_program");

            migrationBuilder.DropColumn(
                name: "is_back",
                table: "su_business_role_program");

            migrationBuilder.DropColumn(
                name: "is_print",
                table: "su_business_role_program");

            migrationBuilder.DropColumn(
                name: "is_remove",
                table: "su_business_role_program");

            migrationBuilder.DropColumn(
                name: "is_save",
                table: "su_business_role_program");

            migrationBuilder.DropColumn(
                name: "is_search",
                table: "su_business_role_program");
        }
    }
}
