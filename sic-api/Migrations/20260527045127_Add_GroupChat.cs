using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_GroupChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "su_chat_group",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_delete = table.Column<bool>(type: "boolean", nullable: false),
                    delete_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    delete_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    business_id = table.Column<Guid>(type: "uuid", maxLength: 100, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_su_chat_group", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "su_chat_group_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    message_type = table.Column<int>(type: "integer", nullable: false),
                    attachment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_cancelled = table.Column<bool>(type: "boolean", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_delete = table.Column<bool>(type: "boolean", nullable: false),
                    delete_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    delete_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    business_id = table.Column<Guid>(type: "uuid", maxLength: 100, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_su_chat_group_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_chat_group_log_su_chat_group_group_id",
                        column: x => x.group_id,
                        principalTable: "su_chat_group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_su_chat_group_log_su_upload_attachment_id",
                        column: x => x.attachment_id,
                        principalTable: "su_upload",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "su_chat_group_member",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_delete = table.Column<bool>(type: "boolean", nullable: false),
                    delete_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    delete_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    business_id = table.Column<Guid>(type: "uuid", maxLength: 100, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_su_chat_group_member", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_chat_group_member_su_chat_group_group_id",
                        column: x => x.group_id,
                        principalTable: "su_chat_group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_group_log_attachment_id",
                table: "su_chat_group_log",
                column: "attachment_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_group_log_group_id",
                table: "su_chat_group_log",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_group_member_group_id",
                table: "su_chat_group_member",
                column: "group_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "su_chat_group_log");

            migrationBuilder.DropTable(
                name: "su_chat_group_member");

            migrationBuilder.DropTable(
                name: "su_chat_group");
        }
    }
}
