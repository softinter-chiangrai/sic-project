using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Struct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "db_country",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    country_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    iso_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    country_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    country_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    support_local_address = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_db_country", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "db_mail_config",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    config_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    smtp_server = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    smtp_port = table.Column<int>(type: "integer", nullable: false),
                    email_from = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    enable_ssl = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    max_retry = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_db_mail_config", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "db_mail_template",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    template_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    subject_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    subject_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content_en = table.Column<string>(type: "text", nullable: false),
                    content_local = table.Column<string>(type: "text", nullable: false),
                    is_html = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    variables = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: true),
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
                    table.PrimaryKey("PK_db_mail_template", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "db_parameter",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    parameter_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    parameter_value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    parameter_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    parameter_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_db_parameter", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "db_title",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    prefix_short_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    prefix_short_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    suffix_short_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    suffix_short_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    prefix_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    prefix_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    suffix_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    suffix_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_db_title", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ex_example",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    example_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message_en = table.Column<string>(type: "text", nullable: false),
                    message_local = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_time = table.Column<string>(type: "text", nullable: true),
                    end_time = table.Column<string>(type: "text", nullable: true),
                    is_accept = table.Column<string>(type: "text", nullable: true),
                    color = table.Column<string>(type: "text", nullable: true),
                    country_code = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<long>(type: "bigint", nullable: false),
                    upload_group_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_ex_example", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mp_marketplace",
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
                    table.PrimaryKey("PK_mp_marketplace", x => x.id);
                });

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
                name: "su_message",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    program_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    message_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
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
                    table.PrimaryKey("PK_su_message", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "su_program",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_program_id = table.Column<Guid>(type: "uuid", nullable: true),
                    program_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    route_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    role_back = table.Column<bool>(type: "boolean", nullable: false),
                    role_search = table.Column<bool>(type: "boolean", nullable: false),
                    role_add = table.Column<bool>(type: "boolean", nullable: false),
                    role_save = table.Column<bool>(type: "boolean", nullable: false),
                    role_delete = table.Column<bool>(type: "boolean", nullable: false),
                    role_print = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_program", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_program_su_program_parent_program_id",
                        column: x => x.parent_program_id,
                        principalTable: "su_program",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "su_task",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    task_name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    task_name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_task", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "su_upload",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    bussiness_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bucket_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    object_key = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    visibility = table.Column<int>(type: "integer", nullable: false),
                    storage_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    access_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    is_streaming = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    upload_group_id = table.Column<Guid>(type: "uuid", nullable: true),
                    temp_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_su_upload", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "su_verify",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    verify_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    reference_number = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    token = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    max_retry = table.Column<int>(type: "integer", maxLength: 300, nullable: false),
                    retry_count = table.Column<int>(type: "integer", nullable: false),
                    expire_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    recipient = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
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
                    table.PrimaryKey("PK_su_verify", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "db_province",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    country_id = table.Column<Guid>(type: "uuid", nullable: false),
                    province_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    province_name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    province_name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_db_province", x => x.id);
                    table.ForeignKey(
                        name: "FK_db_province_db_country_country_id",
                        column: x => x.country_id,
                        principalTable: "db_country",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "db_mail_queue",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    recipient_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    body_data = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    retry_count = table.Column<int>(type: "integer", nullable: false),
                    error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    scheduled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_retry_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    used_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                    use_english = table.Column<bool>(type: "boolean", nullable: false),
                    DbMailConfigId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_db_mail_queue", x => x.id);
                    table.ForeignKey(
                        name: "FK_db_mail_queue_db_mail_config_DbMailConfigId",
                        column: x => x.DbMailConfigId,
                        principalTable: "db_mail_config",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_db_mail_queue_db_mail_template_template_id",
                        column: x => x.template_id,
                        principalTable: "db_mail_template",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_business_marketplace",
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
                    table.PrimaryKey("PK_mp_business_marketplace", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_business_marketplace_mp_marketplace_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "mp_marketplace",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_entity",
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
                    table.PrimaryKey("PK_mp_entity", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_entity_mp_marketplace_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "mp_marketplace",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.CreateTable(
                name: "su_user_task",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_su_user_task", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_user_task_su_task_task_id",
                        column: x => x.task_id,
                        principalTable: "su_task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    call_accepted = table.Column<bool>(type: "boolean", nullable: true),
                    call_duration_seconds = table.Column<int>(type: "integer", nullable: true),
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
                name: "su_chat_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    receiver_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    message_type = table.Column<int>(type: "integer", nullable: false),
                    attachment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_cancelled = table.Column<bool>(type: "boolean", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    call_accepted = table.Column<bool>(type: "boolean", nullable: true),
                    call_duration_seconds = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_su_chat_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_chat_log_su_upload_attachment_id",
                        column: x => x.attachment_id,
                        principalTable: "su_upload",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "db_district",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    province_id = table.Column<Guid>(type: "uuid", nullable: false),
                    district_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    district_name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    district_name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_db_district", x => x.id);
                    table.ForeignKey(
                        name: "FK_db_district_db_province_province_id",
                        column: x => x.province_id,
                        principalTable: "db_province",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_business_entity_table",
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
                    table.PrimaryKey("PK_mp_business_entity_table", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_business_entity_table_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_entity_bilingual",
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
                    table.PrimaryKey("PK_mp_entity_bilingual", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_entity_bilingual_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_entity_constraint",
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
                    table.PrimaryKey("PK_mp_entity_constraint", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_entity_constraint_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_entity_field",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    format = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
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
                    table.PrimaryKey("PK_mp_entity_field", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_entity_field_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_entity_initial",
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
                    table.PrimaryKey("PK_mp_entity_initial", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_entity_initial_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mp_program",
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
                    table.PrimaryKey("PK_mp_program", x => x.id);
                    table.ForeignKey(
                        name: "FK_mp_program_mp_entity_entity_id",
                        column: x => x.entity_id,
                        principalTable: "mp_entity",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_mp_program_mp_marketplace_marketplace_id",
                        column: x => x.marketplace_id,
                        principalTable: "mp_marketplace",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateTable(
                name: "db_sub_district",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    district_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sub_district_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    sub_district_name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sub_district_name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    zip_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    latitude = table.Column<long>(type: "bigint", nullable: true),
                    longitude = table.Column<long>(type: "bigint", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_db_sub_district", x => x.id);
                    table.ForeignKey(
                        name: "FK_db_sub_district_db_district_district_id",
                        column: x => x.district_id,
                        principalTable: "db_district",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_business",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tax_id = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    business_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    branch_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    person_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    title_id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    middle_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    first_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    middle_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    country_id = table.Column<Guid>(type: "uuid", nullable: false),
                    support_local_address = table.Column<bool>(type: "boolean", nullable: false),
                    address_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    province_id = table.Column<Guid>(type: "uuid", nullable: true),
                    district_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sub_district_id = table.Column<Guid>(type: "uuid", nullable: true),
                    zip_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: true),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    fax = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    upload_group_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_business", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_business_db_country_country_id",
                        column: x => x.country_id,
                        principalTable: "db_country",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_su_business_db_district_district_id",
                        column: x => x.district_id,
                        principalTable: "db_district",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_business_db_province_province_id",
                        column: x => x.province_id,
                        principalTable: "db_province",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_business_db_sub_district_sub_district_id",
                        column: x => x.sub_district_id,
                        principalTable: "db_sub_district",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_business_db_title_title_id",
                        column: x => x.title_id,
                        principalTable: "db_title",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_profile",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tax_id = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    title_id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    middle_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name_en = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    first_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    middle_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name_local = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    country_id = table.Column<Guid>(type: "uuid", nullable: true),
                    support_local_address = table.Column<bool>(type: "boolean", nullable: false),
                    address_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    province_id = table.Column<Guid>(type: "uuid", nullable: true),
                    district_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sub_district_id = table.Column<Guid>(type: "uuid", nullable: true),
                    zip_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    upload_group_id = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_su_profile", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_profile_db_country_country_id",
                        column: x => x.country_id,
                        principalTable: "db_country",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_profile_db_district_district_id",
                        column: x => x.district_id,
                        principalTable: "db_district",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_profile_db_province_province_id",
                        column: x => x.province_id,
                        principalTable: "db_province",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_profile_db_sub_district_sub_district_id",
                        column: x => x.sub_district_id,
                        principalTable: "db_sub_district",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_su_profile_db_title_title_id",
                        column: x => x.title_id,
                        principalTable: "db_title",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_business_audit",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    session_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_su_business_audit", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_business_audit_su_business_business_id",
                        column: x => x.business_id,
                        principalTable: "su_business",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_business_role",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_role_id = table.Column<Guid>(type: "uuid", nullable: true),
                    role_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    role_name_en = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role_name_local = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_business_role", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_business_role_su_business_business_id",
                        column: x => x.business_id,
                        principalTable: "su_business",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_su_business_role_su_business_role_parent_role_id",
                        column: x => x.parent_role_id,
                        principalTable: "su_business_role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "su_user_business",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_user_business", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_user_business_su_business_business_id",
                        column: x => x.business_id,
                        principalTable: "su_business",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "su_business_invite",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invite_type = table.Column<string>(type: "text", nullable: false),
                    invite_email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: true),
                    invite_token = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    is_activated = table.Column<bool>(type: "boolean", nullable: false),
                    max_uses = table.Column<int>(type: "integer", nullable: true),
                    use_count = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_su_business_invite", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_business_invite_su_business_role_role_id",
                        column: x => x.role_id,
                        principalTable: "su_business_role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_business_role_program",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    program_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    role_back = table.Column<bool>(type: "boolean", nullable: false),
                    role_search = table.Column<bool>(type: "boolean", nullable: false),
                    role_add = table.Column<bool>(type: "boolean", nullable: false),
                    role_save = table.Column<bool>(type: "boolean", nullable: false),
                    role_delete = table.Column<bool>(type: "boolean", nullable: false),
                    role_print = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_business_role_program", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_business_role_program_su_business_role_business_role_id",
                        column: x => x.business_role_id,
                        principalTable: "su_business_role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_su_business_role_program_su_program_program_id",
                        column: x => x.program_id,
                        principalTable: "su_program",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "su_user_business_role",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_su_user_business_role", x => x.id);
                    table.ForeignKey(
                        name: "FK_su_user_business_role_su_business_role_business_role_id",
                        column: x => x.business_role_id,
                        principalTable: "su_business_role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_su_user_business_role_su_user_business_user_business_id",
                        column: x => x.user_business_id,
                        principalTable: "su_user_business",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_db_country_country_code",
                table: "db_country",
                column: "country_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_country_iso_code",
                table: "db_country",
                column: "iso_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_district_district_code",
                table: "db_district",
                column: "district_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_district_province_id",
                table: "db_district",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_db_mail_queue_DbMailConfigId",
                table: "db_mail_queue",
                column: "DbMailConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_db_mail_queue_template_id",
                table: "db_mail_queue",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_db_mail_template_template_code",
                table: "db_mail_template",
                column: "template_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_parameter_module_code_parameter_code_parameter_value",
                table: "db_parameter",
                columns: new[] { "module_code", "parameter_code", "parameter_value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_province_country_id",
                table: "db_province",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_db_province_province_code",
                table: "db_province",
                column: "province_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_db_sub_district_district_id",
                table: "db_sub_district",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_db_sub_district_sub_district_code",
                table: "db_sub_district",
                column: "sub_district_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_business_entity_table_business_id_entity_id",
                table: "mp_business_entity_table",
                columns: new[] { "business_id", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "IX_mp_business_entity_table_entity_id",
                table: "mp_business_entity_table",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_mp_business_entity_table_table_name",
                table: "mp_business_entity_table",
                column: "table_name");

            migrationBuilder.CreateIndex(
                name: "IX_mp_business_marketplace_business_id_marketplace_id",
                table: "mp_business_marketplace",
                columns: new[] { "business_id", "marketplace_id" });

            migrationBuilder.CreateIndex(
                name: "IX_mp_business_marketplace_marketplace_id",
                table: "mp_business_marketplace",
                column: "marketplace_id");

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_marketplace_id_name",
                table: "mp_entity",
                columns: new[] { "marketplace_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_bilingual_entity_id_key",
                table: "mp_entity_bilingual",
                columns: new[] { "entity_id", "key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_constraint_entity_id",
                table: "mp_entity_constraint",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_field_entity_id_field",
                table: "mp_entity_field",
                columns: new[] { "entity_id", "field" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_field_entity_id_name",
                table: "mp_entity_field",
                columns: new[] { "entity_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_entity_initial_entity_id",
                table: "mp_entity_initial",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_mp_marketplace_app_code",
                table: "mp_marketplace",
                column: "app_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mp_program_entity_id",
                table: "mp_program",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_mp_program_marketplace_id_program_code",
                table: "mp_program",
                columns: new[] { "marketplace_id", "program_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_su_business_business_code",
                table: "su_business",
                column: "business_code",
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_country_id",
                table: "su_business",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_district_id",
                table: "su_business",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_province_id",
                table: "su_business",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_sub_district_id",
                table: "su_business",
                column: "sub_district_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_title_id",
                table: "su_business",
                column: "title_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_audit_business_id",
                table: "su_business_audit",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_invite_role_id",
                table: "su_business_invite",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_business_id_role_code",
                table: "su_business_role",
                columns: new[] { "business_id", "role_code" },
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_parent_role_id",
                table: "su_business_role",
                column: "parent_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_program_business_role_id_program_id",
                table: "su_business_role_program",
                columns: new[] { "business_role_id", "program_id" },
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_program_program_id",
                table: "su_business_role_program",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_group_call_participant_log_id",
                table: "su_chat_group_call_participant",
                column: "log_id");

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

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_log_attachment_id",
                table: "su_chat_log",
                column: "attachment_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_chat_log_business_id_sender_id_receiver_id",
                table: "su_chat_log",
                columns: new[] { "business_id", "sender_id", "receiver_id" });

            migrationBuilder.CreateIndex(
                name: "IX_su_message_module_code_program_code_message_code",
                table: "su_message",
                columns: new[] { "module_code", "program_code", "message_code" },
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_country_id",
                table: "su_profile",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_district_id",
                table: "su_profile",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_province_id",
                table: "su_profile",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_sub_district_id",
                table: "su_profile",
                column: "sub_district_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_title_id",
                table: "su_profile",
                column: "title_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_user_id",
                table: "su_profile",
                column: "user_id",
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_program_parent_program_id",
                table: "su_program",
                column: "parent_program_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_program_program_code",
                table: "su_program",
                column: "program_code",
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_upload_bucket_name",
                table: "su_upload",
                column: "bucket_name");

            migrationBuilder.CreateIndex(
                name: "IX_su_upload_object_key",
                table: "su_upload",
                column: "object_key");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_business_id",
                table: "su_user_business",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_user_id_business_id",
                table: "su_user_business",
                columns: new[] { "user_id", "business_id" },
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_role_business_role_id",
                table: "su_user_business_role",
                column: "business_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_role_user_business_id_business_role_id",
                table: "su_user_business_role",
                columns: new[] { "user_business_id", "business_role_id" },
                unique: true,
                filter: "is_delete = false");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_task_task_id",
                table: "su_user_task",
                column: "task_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "db_mail_queue");

            migrationBuilder.DropTable(
                name: "db_parameter");

            migrationBuilder.DropTable(
                name: "ex_example");

            migrationBuilder.DropTable(
                name: "mp_business_entity_table");

            migrationBuilder.DropTable(
                name: "mp_business_marketplace");

            migrationBuilder.DropTable(
                name: "mp_entity_bilingual");

            migrationBuilder.DropTable(
                name: "mp_entity_constraint");

            migrationBuilder.DropTable(
                name: "mp_entity_field");

            migrationBuilder.DropTable(
                name: "mp_entity_initial");

            migrationBuilder.DropTable(
                name: "mp_program");

            migrationBuilder.DropTable(
                name: "su_business_audit");

            migrationBuilder.DropTable(
                name: "su_business_invite");

            migrationBuilder.DropTable(
                name: "su_business_role_program");

            migrationBuilder.DropTable(
                name: "su_chat_group_call_participant");

            migrationBuilder.DropTable(
                name: "su_chat_group_member");

            migrationBuilder.DropTable(
                name: "su_chat_log");

            migrationBuilder.DropTable(
                name: "su_message");

            migrationBuilder.DropTable(
                name: "su_profile");

            migrationBuilder.DropTable(
                name: "su_user_business_role");

            migrationBuilder.DropTable(
                name: "su_user_task");

            migrationBuilder.DropTable(
                name: "su_verify");

            migrationBuilder.DropTable(
                name: "db_mail_config");

            migrationBuilder.DropTable(
                name: "db_mail_template");

            migrationBuilder.DropTable(
                name: "mp_entity");

            migrationBuilder.DropTable(
                name: "su_program");

            migrationBuilder.DropTable(
                name: "su_chat_group_log");

            migrationBuilder.DropTable(
                name: "su_business_role");

            migrationBuilder.DropTable(
                name: "su_user_business");

            migrationBuilder.DropTable(
                name: "su_task");

            migrationBuilder.DropTable(
                name: "mp_marketplace");

            migrationBuilder.DropTable(
                name: "su_chat_group");

            migrationBuilder.DropTable(
                name: "su_upload");

            migrationBuilder.DropTable(
                name: "su_business");

            migrationBuilder.DropTable(
                name: "db_sub_district");

            migrationBuilder.DropTable(
                name: "db_title");

            migrationBuilder.DropTable(
                name: "db_district");

            migrationBuilder.DropTable(
                name: "db_province");

            migrationBuilder.DropTable(
                name: "db_country");
        }
    }
}
