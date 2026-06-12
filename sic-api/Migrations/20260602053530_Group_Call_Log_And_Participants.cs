using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Group_Call_Log_And_Participants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "call_accepted",
                table: "su_chat_group_log",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "call_duration_seconds",
                table: "su_chat_group_log",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "su_chat_group_call_participant",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    log_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_delete = table.Column<bool>(type: "boolean", nullable: false),
                    delete_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    delete_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_su_chat_group_call_participant", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_chat_group_call_participant_su_chat_group_log_log_id",
                        column: x => x.log_id,
                        principalTable: "su_chat_group_log",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_group_call_participant_log_id",
                table: "su_chat_group_call_participant",
                column: "log_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "su_chat_group_call_participant");

            migrationBuilder.DropColumn(
                name: "call_accepted",
                table: "su_chat_group_log");

            migrationBuilder.DropColumn(
                name: "call_duration_seconds",
                table: "su_chat_group_log");
        }
    }
}
