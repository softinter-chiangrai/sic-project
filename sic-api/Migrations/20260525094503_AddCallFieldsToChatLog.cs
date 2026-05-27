using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class AddCallFieldsToChatLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "call_accepted",
                table: "su_chat_log",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "call_duration_seconds",
                table: "su_chat_log",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "call_accepted",
                table: "su_chat_log");

            migrationBuilder.DropColumn(
                name: "call_duration_seconds",
                table: "su_chat_log");
        }
    }
}
