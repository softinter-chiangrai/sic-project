using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sic_api.Migrations
{
    /// <inheritdoc />
    public partial class Initial_struct_Database : Migration
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
                name: "su_business_audit",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    keycloak_user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    business_id = table.Column<Guid>(type: "uuid", maxLength: 50, nullable: false),
                    client_ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
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
                    keycloak_user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    keycloak_user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                name: "IX_su_business_invite_role_id",
                table: "su_business_invite",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_business_id_role_code",
                table: "su_business_role",
                columns: new[] { "business_id", "role_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_parent_role_id",
                table: "su_business_role",
                column: "parent_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_program_business_role_id_program_id",
                table: "su_business_role_program",
                columns: new[] { "business_role_id", "program_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_su_business_role_program_program_id",
                table: "su_business_role_program",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_message_module_code_program_code_message_code",
                table: "su_message",
                columns: new[] { "module_code", "program_code", "message_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_country_id",
                table: "su_profile",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_district_id",
                table: "su_profile",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_profile_keycloak_user_id",
                table: "su_profile",
                column: "keycloak_user_id",
                unique: true);

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
                name: "IX_su_program_parent_program_id",
                table: "su_program",
                column: "parent_program_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_program_program_code",
                table: "su_program",
                column: "program_code",
                unique: true);

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
                name: "IX_su_user_business_keycloak_user_id_business_id",
                table: "su_user_business",
                columns: new[] { "keycloak_user_id", "business_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_role_business_role_id",
                table: "su_user_business_role",
                column: "business_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_su_user_business_role_user_business_id_business_role_id",
                table: "su_user_business_role",
                columns: new[] { "user_business_id", "business_role_id" },
                unique: true);

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
                name: "su_business_audit");

            migrationBuilder.DropTable(
                name: "su_business_invite");

            migrationBuilder.DropTable(
                name: "su_business_role_program");

            migrationBuilder.DropTable(
                name: "su_message");

            migrationBuilder.DropTable(
                name: "su_profile");

            migrationBuilder.DropTable(
                name: "su_upload");

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
                name: "su_program");

            migrationBuilder.DropTable(
                name: "su_business_role");

            migrationBuilder.DropTable(
                name: "su_user_business");

            migrationBuilder.DropTable(
                name: "su_task");

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
