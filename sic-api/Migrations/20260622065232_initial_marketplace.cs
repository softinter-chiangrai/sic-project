using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class initial_marketplace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MP_MARKETPLACE",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    app_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    app_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_MP_MARKETPLACE", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "MP_BUSINESS_MARKETPLACE",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    marketplace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    install_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    installed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_MP_BUSINESS_MARKETPLACE", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_BUSINESS_MARKETPLACE_MP_MARKETPLACE_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "MP_MARKETPLACE",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_ENTITY",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    marketplace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    label_en = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    label_local = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_MP_ENTITY", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_ENTITY_MP_MARKETPLACE_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "MP_MARKETPLACE",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_BUSINESS_ENTITY_TABLE",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    table_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_MP_BUSINESS_ENTITY_TABLE", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_BUSINESS_ENTITY_TABLE_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_ENTITY_BILINGUAL",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    key_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    key_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_MP_ENTITY_BILINGUAL", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_ENTITY_BILINGUAL_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_ENTITY_CONSTRAINT",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    constraint_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    fields_json = table.Column<string>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_MP_ENTITY_CONSTRAINT", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_ENTITY_CONSTRAINT_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_ENTITY_FIELD",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    label_en = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    label_local = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    reference_entity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    seq_no = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_MP_ENTITY_FIELD", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_ENTITY_FIELD_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_ENTITY_INITIAL",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    data_json = table.Column<string>(type: "jsonb", nullable: false),
                    seq_no = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_MP_ENTITY_INITIAL", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_ENTITY_INITIAL_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MP_PROGRAM",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    marketplace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    program_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name_en = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    name_local = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    template = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_MP_PROGRAM", x => x.id);
                    table.ForeignKey(
                        name: "FK_MP_PROGRAM_MP_ENTITY_entity_id",
                        column: x => x.entity_id,
                        principalTable: "MP_ENTITY",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MP_PROGRAM_MP_MARKETPLACE_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "MP_MARKETPLACE",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_business_id_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE",
                columns: new[] { "business_id", "entity_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_entity_id",
                table: "MP_BUSINESS_ENTITY_TABLE",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_ENTITY_TABLE_table_name",
                table: "MP_BUSINESS_ENTITY_TABLE",
                column: "table_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_business_id_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE",
                columns: new[] { "business_id", "marketplace_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_BUSINESS_MARKETPLACE_marketplace_id",
                table: "MP_BUSINESS_MARKETPLACE",
                column: "marketplace_id");

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_marketplace_id_name",
                table: "MP_ENTITY",
                columns: new[] { "marketplace_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_BILINGUAL_entity_id_key",
                table: "MP_ENTITY_BILINGUAL",
                columns: new[] { "entity_id", "key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_CONSTRAINT_entity_id",
                table: "MP_ENTITY_CONSTRAINT",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_FIELD_entity_id_field",
                table: "MP_ENTITY_FIELD",
                columns: new[] { "entity_id", "field" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_FIELD_entity_id_name",
                table: "MP_ENTITY_FIELD",
                columns: new[] { "entity_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_ENTITY_INITIAL_entity_id",
                table: "MP_ENTITY_INITIAL",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_MP_MARKETPLACE_app_code",
                table: "MP_MARKETPLACE",
                column: "app_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MP_PROGRAM_entity_id",
                table: "MP_PROGRAM",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_MP_PROGRAM_marketplace_id_program_code",
                table: "MP_PROGRAM",
                columns: new[] { "marketplace_id", "program_code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MP_BUSINESS_ENTITY_TABLE");

            migrationBuilder.DropTable(
                name: "MP_BUSINESS_MARKETPLACE");

            migrationBuilder.DropTable(
                name: "MP_ENTITY_BILINGUAL");

            migrationBuilder.DropTable(
                name: "MP_ENTITY_CONSTRAINT");

            migrationBuilder.DropTable(
                name: "MP_ENTITY_FIELD");

            migrationBuilder.DropTable(
                name: "MP_ENTITY_INITIAL");

            migrationBuilder.DropTable(
                name: "MP_PROGRAM");

            migrationBuilder.DropTable(
                name: "MP_ENTITY");

            migrationBuilder.DropTable(
                name: "MP_MARKETPLACE");
        }
    }
}
