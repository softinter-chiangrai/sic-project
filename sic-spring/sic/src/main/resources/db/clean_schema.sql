--
-- PostgreSQL database dump
--


-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-09-10 14:51:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.pm_user_manual_section DROP CONSTRAINT IF EXISTS pm_user_manual_section_manual_id_fkey;
ALTER TABLE ONLY public.pm_edit_session DROP CONSTRAINT IF EXISTS pm_edit_session_change_request_id_fkey;
ALTER TABLE ONLY public.pm_delivery_item DROP CONSTRAINT IF EXISTS pm_delivery_item_delivery_id_fkey;
ALTER TABLE ONLY public.pm_delivery_checklist DROP CONSTRAINT IF EXISTS pm_delivery_checklist_delivery_id_fkey;
ALTER TABLE ONLY public.pm_customer_contract DROP CONSTRAINT IF EXISTS pm_customer_contract_project_id_fkey;
ALTER TABLE ONLY public.pm_customer_contract DROP CONSTRAINT IF EXISTS pm_customer_contract_parent_contract_id_fkey;
ALTER TABLE ONLY public.pm_cr_assignee DROP CONSTRAINT IF EXISTS pm_cr_assignee_change_request_id_fkey;
ALTER TABLE ONLY public.pm_change_request DROP CONSTRAINT IF EXISTS pm_change_request_project_id_fkey;
ALTER TABLE ONLY public.pm_change_impact DROP CONSTRAINT IF EXISTS pm_change_impact_change_request_id_fkey;
ALTER TABLE ONLY public.pm_change_impact_analysis DROP CONSTRAINT IF EXISTS pm_change_impact_analysis_change_request_id_fkey;
ALTER TABLE ONLY public.pm_diagram_versions DROP CONSTRAINT IF EXISTS fk_version_diagram;
ALTER TABLE ONLY public.pm_usecase DROP CONSTRAINT IF EXISTS fk_usecase_project;
ALTER TABLE ONLY public.pm_trace_link DROP CONSTRAINT IF EXISTS fk_trace_project;
ALTER TABLE ONLY public.pm_ma_ticket DROP CONSTRAINT IF EXISTS fk_ticket_ma;
ALTER TABLE ONLY public.pm_test_result DROP CONSTRAINT IF EXISTS fk_testresult_case;
ALTER TABLE ONLY public.pm_test_plan DROP CONSTRAINT IF EXISTS fk_testplan_project;
ALTER TABLE ONLY public.pm_test_case DROP CONSTRAINT IF EXISTS fk_testcase_scenario;
ALTER TABLE ONLY public.pm_task DROP CONSTRAINT IF EXISTS fk_task_spec;
ALTER TABLE ONLY public.pm_task DROP CONSTRAINT IF EXISTS fk_task_package;
ALTER TABLE ONLY public.su_business_role_program DROP CONSTRAINT IF EXISTS fk_su_business_role_program_program_id;
ALTER TABLE ONLY public.pm_approval_step_status DROP CONSTRAINT IF EXISTS fk_step_status_step;
ALTER TABLE ONLY public.pm_approval_step_status DROP CONSTRAINT IF EXISTS fk_step_status_approval;
ALTER TABLE ONLY public.pm_approval_flow_step DROP CONSTRAINT IF EXISTS fk_step_flow;
ALTER TABLE ONLY public.pm_specification DROP CONSTRAINT IF EXISTS fk_spec_requirement;
ALTER TABLE ONLY public.pm_specification DROP CONSTRAINT IF EXISTS fk_spec_project;
ALTER TABLE ONLY public.pm_test_scenario DROP CONSTRAINT IF EXISTS fk_scenario_plan;
ALTER TABLE ONLY public.pm_design_review DROP CONSTRAINT IF EXISTS fk_review_project;
ALTER TABLE ONLY public.pm_review_comment DROP CONSTRAINT IF EXISTS fk_review_comment_review;
ALTER TABLE ONLY public.pm_bug_retest_plan DROP CONSTRAINT IF EXISTS fk_retest_bug;
ALTER TABLE ONLY public.pm_requirement DROP CONSTRAINT IF EXISTS fk_req_project;
ALTER TABLE ONLY public.pm_ma_renewal DROP CONSTRAINT IF EXISTS fk_renewal_ma;
ALTER TABLE ONLY public.pm_approval_reminder DROP CONSTRAINT IF EXISTS fk_reminder_step_status;
ALTER TABLE ONLY public.pm_approval_reminder DROP CONSTRAINT IF EXISTS fk_reminder_approval;
ALTER TABLE ONLY public.pm_customer_project DROP CONSTRAINT IF EXISTS fk_project_customer;
ALTER TABLE ONLY public.pm_customer_project DROP CONSTRAINT IF EXISTS fk_project_contract;
ALTER TABLE ONLY public.pm_customer DROP CONSTRAINT IF EXISTS fk_pm_customer_sub_district;
ALTER TABLE ONLY public.pm_customer DROP CONSTRAINT IF EXISTS fk_pm_customer_province;
ALTER TABLE ONLY public.pm_customer DROP CONSTRAINT IF EXISTS fk_pm_customer_district;
ALTER TABLE ONLY public.pm_phase DROP CONSTRAINT IF EXISTS fk_phase_project;
ALTER TABLE ONLY public.pm_payment DROP CONSTRAINT IF EXISTS fk_payment_invoice;
ALTER TABLE ONLY public.pm_work_package DROP CONSTRAINT IF EXISTS fk_package_milestone;
ALTER TABLE ONLY public.pm_milestone DROP CONSTRAINT IF EXISTS fk_milestone_phase;
ALTER TABLE ONLY public.pm_user_manual DROP CONSTRAINT IF EXISTS fk_manual_delivery;
ALTER TABLE ONLY public.pm_ma_ticket_assignee DROP CONSTRAINT IF EXISTS fk_ma_ticket_assignee_ticket;
ALTER TABLE ONLY public.pm_ma_contract DROP CONSTRAINT IF EXISTS fk_ma_project;
ALTER TABLE ONLY public.pm_approval_log DROP CONSTRAINT IF EXISTS fk_log_step_status;
ALTER TABLE ONLY public.pm_approval_log DROP CONSTRAINT IF EXISTS fk_log_approval;
ALTER TABLE ONLY public.pm_invoice_item DROP CONSTRAINT IF EXISTS fk_invoiceitem_invoice;
ALTER TABLE ONLY public.pm_invoice DROP CONSTRAINT IF EXISTS fk_invoice_project;
ALTER TABLE ONLY public.pm_invoice DROP CONSTRAINT IF EXISTS fk_invoice_contract;
ALTER TABLE ONLY public.su_business_invite DROP CONSTRAINT IF EXISTS fk_invite_role;
ALTER TABLE ONLY public.su_business_invite DROP CONSTRAINT IF EXISTS fk_invite_business;
ALTER TABLE ONLY public.pm_delivery_document DROP CONSTRAINT IF EXISTS fk_doc_delivery;
ALTER TABLE ONLY public.pm_task_dependency DROP CONSTRAINT IF EXISTS fk_dep_task;
ALTER TABLE ONLY public.pm_task_dependency DROP CONSTRAINT IF EXISTS fk_dep_depends_on;
ALTER TABLE ONLY public.pm_delivery DROP CONSTRAINT IF EXISTS fk_delivery_project;
ALTER TABLE ONLY public.pm_customer_contract DROP CONSTRAINT IF EXISTS fk_contract_customer;
ALTER TABLE ONLY public.pm_ma_ticket_comment DROP CONSTRAINT IF EXISTS fk_comment_ticket;
ALTER TABLE ONLY public.pm_comment DROP CONSTRAINT IF EXISTS fk_comment_parent;
ALTER TABLE ONLY public.pm_delivery_checklist DROP CONSTRAINT IF EXISTS fk_checklist_delivery;
ALTER TABLE ONLY public.pm_diagram_chat DROP CONSTRAINT IF EXISTS fk_chat_diagram;
ALTER TABLE ONLY public.pm_bug_comment DROP CONSTRAINT IF EXISTS fk_bugcomment_bug;
ALTER TABLE ONLY public.pm_bug DROP CONSTRAINT IF EXISTS fk_bug_testcase;
ALTER TABLE ONLY public.pm_task_assignee DROP CONSTRAINT IF EXISTS fk_assignee_task;
ALTER TABLE ONLY public.pm_approval DROP CONSTRAINT IF EXISTS fk_approval_flow;
ALTER TABLE ONLY public.pm_approval DROP CONSTRAINT IF EXISTS fk_approval_current_step;
ALTER TABLE ONLY public.pm_approval DROP CONSTRAINT IF EXISTS fk_approval_attachment;
ALTER TABLE ONLY public.su_user_task DROP CONSTRAINT IF EXISTS "FK_su_user_task_su_task_task_id";
ALTER TABLE ONLY public.su_user_business DROP CONSTRAINT IF EXISTS "FK_su_user_business_su_business_business_id";
ALTER TABLE ONLY public.su_user_business_role DROP CONSTRAINT IF EXISTS "FK_su_user_business_role_su_user_business_user_business_id";
ALTER TABLE ONLY public.su_user_business_role DROP CONSTRAINT IF EXISTS "FK_su_user_business_role_su_business_role_business_role_id";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "FK_su_profile_db_title_title_id";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "FK_su_profile_db_sub_district_sub_district_id";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "FK_su_profile_db_province_province_id";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "FK_su_profile_db_district_district_id";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "FK_su_profile_db_country_country_id";
ALTER TABLE ONLY public.su_chat_log DROP CONSTRAINT IF EXISTS "FK_su_chat_log_su_upload_attachment_id";
ALTER TABLE ONLY public.su_chat_group_member DROP CONSTRAINT IF EXISTS "FK_su_chat_group_member_su_chat_group_group_id";
ALTER TABLE ONLY public.su_chat_group_log DROP CONSTRAINT IF EXISTS "FK_su_chat_group_log_su_upload_attachment_id";
ALTER TABLE ONLY public.su_chat_group_log DROP CONSTRAINT IF EXISTS "FK_su_chat_group_log_su_chat_group_group_id";
ALTER TABLE ONLY public.su_chat_group_call_participant DROP CONSTRAINT IF EXISTS "FK_su_chat_group_call_participant_su_chat_group_log_log_id";
ALTER TABLE ONLY public.su_business_role DROP CONSTRAINT IF EXISTS "FK_su_business_role_su_business_role_parent_role_id";
ALTER TABLE ONLY public.su_business_role DROP CONSTRAINT IF EXISTS "FK_su_business_role_su_business_business_id";
ALTER TABLE ONLY public.su_business_role_program DROP CONSTRAINT IF EXISTS "FK_su_business_role_program_su_business_role_business_role_id";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "FK_su_business_db_title_title_id";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "FK_su_business_db_sub_district_sub_district_id";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "FK_su_business_db_province_province_id";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "FK_su_business_db_district_district_id";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "FK_su_business_db_country_country_id";
ALTER TABLE ONLY public.su_business_audit DROP CONSTRAINT IF EXISTS "FK_su_business_audit_su_business_business_id";
ALTER TABLE ONLY public.db_sub_district DROP CONSTRAINT IF EXISTS "FK_db_sub_district_db_district_district_id";
ALTER TABLE ONLY public.db_province DROP CONSTRAINT IF EXISTS "FK_db_province_db_country_country_id";
ALTER TABLE ONLY public.db_mail_queue DROP CONSTRAINT IF EXISTS "FK_db_mail_queue_db_mail_template_template_id";
ALTER TABLE ONLY public.db_mail_queue DROP CONSTRAINT IF EXISTS "FK_db_mail_queue_db_mail_config_DbMailConfigId";
ALTER TABLE ONLY public.db_district DROP CONSTRAINT IF EXISTS "FK_db_district_db_province_province_id";
DROP INDEX IF EXISTS public.ix_su_business_role_business_id_role_code;
DROP INDEX IF EXISTS public.idx_version_document;
DROP INDEX IF EXISTS public.idx_version_diagram;
DROP INDEX IF EXISTS public.idx_user_id;
DROP INDEX IF EXISTS public.idx_user_business_role;
DROP INDEX IF EXISTS public.idx_user_business;
DROP INDEX IF EXISTS public.idx_trace_target_type_id;
DROP INDEX IF EXISTS public.idx_trace_target;
DROP INDEX IF EXISTS public.idx_trace_source_type_id;
DROP INDEX IF EXISTS public.idx_trace_source;
DROP INDEX IF EXISTS public.idx_trace_relationship;
DROP INDEX IF EXISTS public.idx_trace_project;
DROP INDEX IF EXISTS public.idx_template_code;
DROP INDEX IF EXISTS public.idx_sub_district_district_id;
DROP INDEX IF EXISTS public.idx_sub_district_code;
DROP INDEX IF EXISTS public.idx_step_status_step;
DROP INDEX IF EXISTS public.idx_step_status_approver;
DROP INDEX IF EXISTS public.idx_step_status_approval;
DROP INDEX IF EXISTS public.idx_step_role;
DROP INDEX IF EXISTS public.idx_step_flow;
DROP INDEX IF EXISTS public.idx_spec_requirement;
DROP INDEX IF EXISTS public.idx_session_target;
DROP INDEX IF EXISTS public.idx_session_id;
DROP INDEX IF EXISTS public.idx_session_active;
DROP INDEX IF EXISTS public.idx_reminder_recipient;
DROP INDEX IF EXISTS public.idx_reminder_approval;
DROP INDEX IF EXISTS public.idx_province_country_id;
DROP INDEX IF EXISTS public.idx_province_code;
DROP INDEX IF EXISTS public.idx_project_status;
DROP INDEX IF EXISTS public.idx_project_priority;
DROP INDEX IF EXISTS public.idx_project_customer;
DROP INDEX IF EXISTS public.idx_project_contract;
DROP INDEX IF EXISTS public.idx_project_business;
DROP INDEX IF EXISTS public.idx_program_code;
DROP INDEX IF EXISTS public.idx_pm_user_manual_project;
DROP INDEX IF EXISTS public.idx_pm_test_scenario_project;
DROP INDEX IF EXISTS public.idx_pm_test_case_project;
DROP INDEX IF EXISTS public.idx_pm_document_version_project;
DROP INDEX IF EXISTS public.idx_pm_document_version_previous;
DROP INDEX IF EXISTS public.idx_pm_document_version_document;
DROP INDEX IF EXISTS public.idx_pm_document_version_approval_status;
DROP INDEX IF EXISTS public.idx_pm_diagram_sql_history_tab_id;
DROP INDEX IF EXISTS public.idx_pm_diagram_sql_history_created_at;
DROP INDEX IF EXISTS public.idx_pm_delivery_project;
DROP INDEX IF EXISTS public.idx_pm_delivery_item_target;
DROP INDEX IF EXISTS public.idx_pm_delivery_item_delivery;
DROP INDEX IF EXISTS public.idx_pm_customer_is_active;
DROP INDEX IF EXISTS public.idx_pm_customer_customer_code;
DROP INDEX IF EXISTS public.idx_pm_customer_contract_parent;
DROP INDEX IF EXISTS public.idx_pm_customer_company_name_en;
DROP INDEX IF EXISTS public.idx_pm_customer_business_id;
DROP INDEX IF EXISTS public.idx_pm_bug_project;
DROP INDEX IF EXISTS public.idx_object_key;
DROP INDEX IF EXISTS public.idx_notification_receiver;
DROP INDEX IF EXISTS public.idx_module_program_message;
DROP INDEX IF EXISTS public.idx_module_param_value;
DROP INDEX IF EXISTS public.idx_mail_queue_template;
DROP INDEX IF EXISTS public.idx_mail_queue_config;
DROP INDEX IF EXISTS public.idx_log_approval;
DROP INDEX IF EXISTS public.idx_log_actor;
DROP INDEX IF EXISTS public.idx_log_action;
DROP INDEX IF EXISTS public.idx_iso_code;
DROP INDEX IF EXISTS public.idx_invite_business;
DROP INDEX IF EXISTS public.idx_flow_document_type;
DROP INDEX IF EXISTS public.idx_flow_business;
DROP INDEX IF EXISTS public.idx_district_province_id;
DROP INDEX IF EXISTS public.idx_district_code;
DROP INDEX IF EXISTS public.idx_diagram_user;
DROP INDEX IF EXISTS public.idx_diagram_type;
DROP INDEX IF EXISTS public.idx_diagram_project;
DROP INDEX IF EXISTS public.idx_diagram_metadata;
DROP INDEX IF EXISTS public.idx_diagram_graph;
DROP INDEX IF EXISTS public.idx_diagram_business;
DROP INDEX IF EXISTS public.idx_design_review_project;
DROP INDEX IF EXISTS public.idx_design_review_code;
DROP INDEX IF EXISTS public.idx_cr_target;
DROP INDEX IF EXISTS public.idx_cr_status;
DROP INDEX IF EXISTS public.idx_cr_impact_request;
DROP INDEX IF EXISTS public.idx_cr_assignee_user;
DROP INDEX IF EXISTS public.idx_cr_assignee_request;
DROP INDEX IF EXISTS public.idx_country_code;
DROP INDEX IF EXISTS public.idx_contract_sign_status;
DROP INDEX IF EXISTS public.idx_contract_customer;
DROP INDEX IF EXISTS public.idx_contract_business;
DROP INDEX IF EXISTS public.idx_comment_target_parent_null;
DROP INDEX IF EXISTS public.idx_comment_target;
DROP INDEX IF EXISTS public.idx_comment_parent;
DROP INDEX IF EXISTS public.idx_chat_user;
DROP INDEX IF EXISTS public.idx_chat_diagram;
DROP INDEX IF EXISTS public.idx_change_impact_analysis_status;
DROP INDEX IF EXISTS public.idx_change_impact_analysis_cr;
DROP INDEX IF EXISTS public.idx_business_sender_receiver;
DROP INDEX IF EXISTS public.idx_business_role_program;
DROP INDEX IF EXISTS public.idx_business_role_code;
DROP INDEX IF EXISTS public.idx_bucket_name;
DROP INDEX IF EXISTS public.idx_audit_user;
DROP INDEX IF EXISTS public.idx_audit_target;
DROP INDEX IF EXISTS public.idx_audit_created;
DROP INDEX IF EXISTS public.idx_audit_business;
DROP INDEX IF EXISTS public.idx_approval_status;
DROP INDEX IF EXISTS public.idx_approval_requested_by;
DROP INDEX IF EXISTS public.idx_approval_flow;
DROP INDEX IF EXISTS public.idx_approval_document;
DROP INDEX IF EXISTS public.idx_approval_current_step;
DROP INDEX IF EXISTS public.idx_approval_business;
DROP INDEX IF EXISTS public.flyway_schema_history_s_idx;
DROP INDEX IF EXISTS public."IX_su_user_task_task_id";
DROP INDEX IF EXISTS public."IX_su_user_business_user_id_business_id";
DROP INDEX IF EXISTS public."IX_su_user_business_role_user_business_id_business_role_id";
DROP INDEX IF EXISTS public."IX_su_user_business_role_business_role_id";
DROP INDEX IF EXISTS public."IX_su_user_business_business_id";
DROP INDEX IF EXISTS public."IX_su_upload_object_key";
DROP INDEX IF EXISTS public."IX_su_upload_bucket_name";
DROP INDEX IF EXISTS public."IX_su_profile_user_id";
DROP INDEX IF EXISTS public."IX_su_profile_title_id";
DROP INDEX IF EXISTS public."IX_su_profile_sub_district_id";
DROP INDEX IF EXISTS public."IX_su_profile_province_id";
DROP INDEX IF EXISTS public."IX_su_profile_district_id";
DROP INDEX IF EXISTS public."IX_su_profile_country_id";
DROP INDEX IF EXISTS public."IX_su_message_module_code_program_code_message_code";
DROP INDEX IF EXISTS public."IX_su_chat_log_business_id_sender_id_receiver_id";
DROP INDEX IF EXISTS public."IX_su_chat_log_attachment_id";
DROP INDEX IF EXISTS public."IX_su_chat_group_member_group_id";
DROP INDEX IF EXISTS public."IX_su_chat_group_log_group_id";
DROP INDEX IF EXISTS public."IX_su_chat_group_log_attachment_id";
DROP INDEX IF EXISTS public."IX_su_chat_group_call_participant_log_id";
DROP INDEX IF EXISTS public."IX_su_business_title_id";
DROP INDEX IF EXISTS public."IX_su_business_sub_district_id";
DROP INDEX IF EXISTS public."IX_su_business_role_program_program_id";
DROP INDEX IF EXISTS public."IX_su_business_role_program_business_role_id_program_id";
DROP INDEX IF EXISTS public."IX_su_business_role_parent_role_id";
DROP INDEX IF EXISTS public."IX_su_business_role_business_id_role_code";
DROP INDEX IF EXISTS public."IX_su_business_province_id";
DROP INDEX IF EXISTS public."IX_su_business_district_id";
DROP INDEX IF EXISTS public."IX_su_business_country_id";
DROP INDEX IF EXISTS public."IX_su_business_audit_business_id";
DROP INDEX IF EXISTS public."IX_db_sub_district_sub_district_code";
DROP INDEX IF EXISTS public."IX_db_sub_district_district_id";
DROP INDEX IF EXISTS public."IX_db_province_province_code";
DROP INDEX IF EXISTS public."IX_db_province_country_id";
DROP INDEX IF EXISTS public."IX_db_parameter_module_code_parameter_code_parameter_value";
DROP INDEX IF EXISTS public."IX_db_mail_template_template_code";
DROP INDEX IF EXISTS public."IX_db_mail_queue_template_id";
DROP INDEX IF EXISTS public."IX_db_mail_queue_DbMailConfigId";
DROP INDEX IF EXISTS public."IX_db_district_province_id";
DROP INDEX IF EXISTS public."IX_db_district_district_code";
DROP INDEX IF EXISTS public."IX_db_country_iso_code";
DROP INDEX IF EXISTS public."IX_db_country_country_code";
ALTER TABLE ONLY public.pm_customer_project DROP CONSTRAINT IF EXISTS uk_project_code_per_business;
ALTER TABLE ONLY public.pm_customer DROP CONSTRAINT IF EXISTS uk_pm_customer_code;
ALTER TABLE ONLY public.pm_customer_contract DROP CONSTRAINT IF EXISTS uk_contract_no_per_business;
ALTER TABLE ONLY public.pm_approval_flow DROP CONSTRAINT IF EXISTS uk_approval_flow_code;
ALTER TABLE ONLY public.su_program DROP CONSTRAINT IF EXISTS su_program_pkey;
ALTER TABLE ONLY public.su_notification DROP CONSTRAINT IF EXISTS su_notification_pkey;
ALTER TABLE ONLY public.su_business_invite DROP CONSTRAINT IF EXISTS su_business_invite_pkey;
ALTER TABLE ONLY public.pm_work_package DROP CONSTRAINT IF EXISTS pm_work_package_pkey;
ALTER TABLE ONLY public.pm_user_manual_section DROP CONSTRAINT IF EXISTS pm_user_manual_section_pkey;
ALTER TABLE ONLY public.pm_user_manual DROP CONSTRAINT IF EXISTS pm_user_manual_pkey;
ALTER TABLE ONLY public.pm_usecase DROP CONSTRAINT IF EXISTS pm_usecase_pkey;
ALTER TABLE ONLY public.pm_trace_link DROP CONSTRAINT IF EXISTS pm_trace_link_pkey;
ALTER TABLE ONLY public.pm_test_scenario DROP CONSTRAINT IF EXISTS pm_test_scenario_pkey;
ALTER TABLE ONLY public.pm_test_result DROP CONSTRAINT IF EXISTS pm_test_result_pkey;
ALTER TABLE ONLY public.pm_test_plan DROP CONSTRAINT IF EXISTS pm_test_plan_pkey;
ALTER TABLE ONLY public.pm_test_case DROP CONSTRAINT IF EXISTS pm_test_case_pkey;
ALTER TABLE ONLY public.pm_task DROP CONSTRAINT IF EXISTS pm_task_pkey;
ALTER TABLE ONLY public.pm_task_dependency DROP CONSTRAINT IF EXISTS pm_task_dependency_pkey;
ALTER TABLE ONLY public.pm_task_assignee DROP CONSTRAINT IF EXISTS pm_task_assignee_pkey;
ALTER TABLE ONLY public.pm_specification DROP CONSTRAINT IF EXISTS pm_specification_pkey;
ALTER TABLE ONLY public.pm_review_comment DROP CONSTRAINT IF EXISTS pm_review_comment_pkey;
ALTER TABLE ONLY public.pm_requirement DROP CONSTRAINT IF EXISTS pm_requirement_pkey;
ALTER TABLE ONLY public.pm_phase DROP CONSTRAINT IF EXISTS pm_phase_pkey;
ALTER TABLE ONLY public.pm_payment DROP CONSTRAINT IF EXISTS pm_payment_pkey;
ALTER TABLE ONLY public.pm_notification DROP CONSTRAINT IF EXISTS pm_notification_pkey;
ALTER TABLE ONLY public.pm_milestone DROP CONSTRAINT IF EXISTS pm_milestone_pkey;
ALTER TABLE ONLY public.pm_ma_ticket DROP CONSTRAINT IF EXISTS pm_ma_ticket_pkey;
ALTER TABLE ONLY public.pm_ma_ticket_comment DROP CONSTRAINT IF EXISTS pm_ma_ticket_comment_pkey;
ALTER TABLE ONLY public.pm_ma_ticket_assignee DROP CONSTRAINT IF EXISTS pm_ma_ticket_assignee_pkey;
ALTER TABLE ONLY public.pm_ma_renewal DROP CONSTRAINT IF EXISTS pm_ma_renewal_pkey;
ALTER TABLE ONLY public.pm_ma_contract DROP CONSTRAINT IF EXISTS pm_ma_contract_pkey;
ALTER TABLE ONLY public.pm_invoice DROP CONSTRAINT IF EXISTS pm_invoice_pkey;
ALTER TABLE ONLY public.pm_invoice_item DROP CONSTRAINT IF EXISTS pm_invoice_item_pkey;
ALTER TABLE ONLY public.pm_edit_session DROP CONSTRAINT IF EXISTS pm_edit_session_pkey;
ALTER TABLE ONLY public.pm_document_version DROP CONSTRAINT IF EXISTS pm_document_version_pkey;
ALTER TABLE ONLY public.pm_diagram_versions DROP CONSTRAINT IF EXISTS pm_diagram_versions_pkey;
ALTER TABLE ONLY public.pm_diagram_sql_history DROP CONSTRAINT IF EXISTS pm_diagram_sql_history_pkey;
ALTER TABLE ONLY public.pm_diagram DROP CONSTRAINT IF EXISTS pm_diagram_pkey;
ALTER TABLE ONLY public.pm_diagram_chat DROP CONSTRAINT IF EXISTS pm_diagram_chat_pkey;
ALTER TABLE ONLY public.pm_design_review DROP CONSTRAINT IF EXISTS pm_design_review_pkey;
ALTER TABLE ONLY public.pm_delivery DROP CONSTRAINT IF EXISTS pm_delivery_pkey;
ALTER TABLE ONLY public.pm_delivery_item DROP CONSTRAINT IF EXISTS pm_delivery_item_pkey;
ALTER TABLE ONLY public.pm_delivery_document DROP CONSTRAINT IF EXISTS pm_delivery_document_pkey;
ALTER TABLE ONLY public.pm_delivery_checklist DROP CONSTRAINT IF EXISTS pm_delivery_checklist_pkey;
ALTER TABLE ONLY public.pm_customer_project DROP CONSTRAINT IF EXISTS pm_customer_project_pkey;
ALTER TABLE ONLY public.pm_customer DROP CONSTRAINT IF EXISTS pm_customer_pkey;
ALTER TABLE ONLY public.pm_customer_contract DROP CONSTRAINT IF EXISTS pm_customer_contract_pkey;
ALTER TABLE ONLY public.pm_cr_assignee DROP CONSTRAINT IF EXISTS pm_cr_assignee_pkey;
ALTER TABLE ONLY public.pm_comment DROP CONSTRAINT IF EXISTS pm_comment_pkey;
ALTER TABLE ONLY public.pm_change_request DROP CONSTRAINT IF EXISTS pm_change_request_pkey;
ALTER TABLE ONLY public.pm_change_impact DROP CONSTRAINT IF EXISTS pm_change_impact_pkey;
ALTER TABLE ONLY public.pm_change_impact_analysis DROP CONSTRAINT IF EXISTS pm_change_impact_analysis_pkey;
ALTER TABLE ONLY public.pm_bug_retest_plan DROP CONSTRAINT IF EXISTS pm_bug_retest_plan_pkey;
ALTER TABLE ONLY public.pm_bug DROP CONSTRAINT IF EXISTS pm_bug_pkey;
ALTER TABLE ONLY public.pm_bug_comment DROP CONSTRAINT IF EXISTS pm_bug_comment_pkey;
ALTER TABLE ONLY public.su_audit_log DROP CONSTRAINT IF EXISTS pm_audit_log_pkey;
ALTER TABLE ONLY public.pm_approval_step_status DROP CONSTRAINT IF EXISTS pm_approval_step_status_pkey;
ALTER TABLE ONLY public.pm_approval_reminder DROP CONSTRAINT IF EXISTS pm_approval_reminder_pkey;
ALTER TABLE ONLY public.pm_approval DROP CONSTRAINT IF EXISTS pm_approval_pkey;
ALTER TABLE ONLY public.pm_approval_log DROP CONSTRAINT IF EXISTS pm_approval_log_pkey;
ALTER TABLE ONLY public.pm_approval_flow_step DROP CONSTRAINT IF EXISTS pm_approval_flow_step_pkey;
ALTER TABLE ONLY public.pm_approval_flow DROP CONSTRAINT IF EXISTS pm_approval_flow_pkey;
ALTER TABLE ONLY public.flyway_schema_history DROP CONSTRAINT IF EXISTS flyway_schema_history_pk;
ALTER TABLE ONLY public.su_verify DROP CONSTRAINT IF EXISTS "PK_su_verify";
ALTER TABLE ONLY public.su_user_task DROP CONSTRAINT IF EXISTS "PK_su_user_task";
ALTER TABLE ONLY public.su_user_business_role DROP CONSTRAINT IF EXISTS "PK_su_user_business_role";
ALTER TABLE ONLY public.su_user_business DROP CONSTRAINT IF EXISTS "PK_su_user_business";
ALTER TABLE ONLY public.su_upload DROP CONSTRAINT IF EXISTS "PK_su_upload";
ALTER TABLE ONLY public.su_task DROP CONSTRAINT IF EXISTS "PK_su_task";
ALTER TABLE ONLY public.su_profile DROP CONSTRAINT IF EXISTS "PK_su_profile";
ALTER TABLE ONLY public.su_message DROP CONSTRAINT IF EXISTS "PK_su_message";
ALTER TABLE ONLY public.su_chat_log DROP CONSTRAINT IF EXISTS "PK_su_chat_log";
ALTER TABLE ONLY public.su_chat_group_member DROP CONSTRAINT IF EXISTS "PK_su_chat_group_member";
ALTER TABLE ONLY public.su_chat_group_log DROP CONSTRAINT IF EXISTS "PK_su_chat_group_log";
ALTER TABLE ONLY public.su_chat_group_call_participant DROP CONSTRAINT IF EXISTS "PK_su_chat_group_call_participant";
ALTER TABLE ONLY public.su_chat_group DROP CONSTRAINT IF EXISTS "PK_su_chat_group";
ALTER TABLE ONLY public.su_business_role_program DROP CONSTRAINT IF EXISTS "PK_su_business_role_program";
ALTER TABLE ONLY public.su_business_role DROP CONSTRAINT IF EXISTS "PK_su_business_role";
ALTER TABLE ONLY public.su_business_audit DROP CONSTRAINT IF EXISTS "PK_su_business_audit";
ALTER TABLE ONLY public.su_business DROP CONSTRAINT IF EXISTS "PK_su_business";
ALTER TABLE ONLY public.ex_example DROP CONSTRAINT IF EXISTS "PK_ex_example";
ALTER TABLE ONLY public.db_title DROP CONSTRAINT IF EXISTS "PK_db_title";
ALTER TABLE ONLY public.db_sub_district DROP CONSTRAINT IF EXISTS "PK_db_sub_district";
ALTER TABLE ONLY public.db_province DROP CONSTRAINT IF EXISTS "PK_db_province";
ALTER TABLE ONLY public.db_parameter DROP CONSTRAINT IF EXISTS "PK_db_parameter";
ALTER TABLE ONLY public.db_mail_template DROP CONSTRAINT IF EXISTS "PK_db_mail_template";
ALTER TABLE ONLY public.db_mail_queue DROP CONSTRAINT IF EXISTS "PK_db_mail_queue";
ALTER TABLE ONLY public.db_mail_config DROP CONSTRAINT IF EXISTS "PK_db_mail_config";
ALTER TABLE ONLY public.db_district DROP CONSTRAINT IF EXISTS "PK_db_district";
ALTER TABLE ONLY public.db_country DROP CONSTRAINT IF EXISTS "PK_db_country";
ALTER TABLE ONLY public."__EFMigrationsHistory" DROP CONSTRAINT IF EXISTS "PK___EFMigrationsHistory";
DROP TABLE IF EXISTS public.su_verify;
DROP TABLE IF EXISTS public.su_user_task;
DROP TABLE IF EXISTS public.su_user_business_role;
DROP TABLE IF EXISTS public.su_user_business;
DROP TABLE IF EXISTS public.su_upload;
DROP TABLE IF EXISTS public.su_task;
DROP TABLE IF EXISTS public.su_program;
DROP TABLE IF EXISTS public.su_profile;
DROP TABLE IF EXISTS public.su_notification;
DROP TABLE IF EXISTS public.su_message;
DROP TABLE IF EXISTS public.su_chat_log;
DROP TABLE IF EXISTS public.su_chat_group_member;
DROP TABLE IF EXISTS public.su_chat_group_log;
DROP TABLE IF EXISTS public.su_chat_group_call_participant;
DROP TABLE IF EXISTS public.su_chat_group;
DROP TABLE IF EXISTS public.su_business_role_program;
DROP TABLE IF EXISTS public.su_business_role;
DROP TABLE IF EXISTS public.su_business_invite;
DROP TABLE IF EXISTS public.su_business_audit;
DROP TABLE IF EXISTS public.su_business;
DROP TABLE IF EXISTS public.su_audit_log;
DROP TABLE IF EXISTS public.pm_work_package;
DROP TABLE IF EXISTS public.pm_user_manual_section;
DROP TABLE IF EXISTS public.pm_user_manual;
DROP TABLE IF EXISTS public.pm_usecase;
DROP TABLE IF EXISTS public.pm_trace_link;
DROP TABLE IF EXISTS public.pm_test_scenario;
DROP TABLE IF EXISTS public.pm_test_result;
DROP TABLE IF EXISTS public.pm_test_plan;
DROP TABLE IF EXISTS public.pm_test_case;
DROP TABLE IF EXISTS public.pm_task_dependency;
DROP TABLE IF EXISTS public.pm_task_assignee;
DROP TABLE IF EXISTS public.pm_task;
DROP TABLE IF EXISTS public.pm_specification;
DROP TABLE IF EXISTS public.pm_review_comment;
DROP TABLE IF EXISTS public.pm_requirement;
DROP TABLE IF EXISTS public.pm_phase;
DROP TABLE IF EXISTS public.pm_payment;
DROP TABLE IF EXISTS public.pm_notification;
DROP TABLE IF EXISTS public.pm_milestone;
DROP TABLE IF EXISTS public.pm_ma_ticket_comment;
DROP TABLE IF EXISTS public.pm_ma_ticket_assignee;
DROP TABLE IF EXISTS public.pm_ma_ticket;
DROP TABLE IF EXISTS public.pm_ma_renewal;
DROP TABLE IF EXISTS public.pm_ma_contract;
DROP TABLE IF EXISTS public.pm_invoice_item;
DROP TABLE IF EXISTS public.pm_invoice;
DROP TABLE IF EXISTS public.pm_edit_session;
DROP TABLE IF EXISTS public.pm_document_version;
DROP TABLE IF EXISTS public.pm_diagram_versions;
DROP TABLE IF EXISTS public.pm_diagram_sql_history;
DROP TABLE IF EXISTS public.pm_diagram_chat;
DROP TABLE IF EXISTS public.pm_diagram;
DROP TABLE IF EXISTS public.pm_design_review;
DROP TABLE IF EXISTS public.pm_delivery_item;
DROP TABLE IF EXISTS public.pm_delivery_document;
DROP TABLE IF EXISTS public.pm_delivery_checklist;
DROP TABLE IF EXISTS public.pm_delivery;
DROP TABLE IF EXISTS public.pm_customer_project;
DROP TABLE IF EXISTS public.pm_customer_contract;
DROP TABLE IF EXISTS public.pm_customer;
DROP TABLE IF EXISTS public.pm_cr_assignee;
DROP TABLE IF EXISTS public.pm_comment;
DROP TABLE IF EXISTS public.pm_change_request;
DROP TABLE IF EXISTS public.pm_change_impact_analysis;
DROP TABLE IF EXISTS public.pm_change_impact;
DROP TABLE IF EXISTS public.pm_bug_retest_plan;
DROP TABLE IF EXISTS public.pm_bug_comment;
DROP TABLE IF EXISTS public.pm_bug;
DROP TABLE IF EXISTS public.pm_approval_step_status;
DROP TABLE IF EXISTS public.pm_approval_reminder;
DROP TABLE IF EXISTS public.pm_approval_log;
DROP TABLE IF EXISTS public.pm_approval_flow_step;
DROP TABLE IF EXISTS public.pm_approval_flow;
DROP TABLE IF EXISTS public.pm_approval;
DROP TABLE IF EXISTS public.flyway_schema_history;
DROP TABLE IF EXISTS public.ex_example;
DROP TABLE IF EXISTS public.db_title;
DROP TABLE IF EXISTS public.db_sub_district;
DROP TABLE IF EXISTS public.db_province;
DROP TABLE IF EXISTS public.db_parameter;
DROP TABLE IF EXISTS public.db_mail_template;
DROP TABLE IF EXISTS public.db_mail_queue;
DROP TABLE IF EXISTS public.db_mail_config;
DROP TABLE IF EXISTS public.db_district;
DROP TABLE IF EXISTS public.db_country;
DROP TABLE IF EXISTS public."__EFMigrationsHistory";
DROP TYPE IF EXISTS public.trace_relationship;
DROP EXTENSION "uuid-ossp";
DROP EXTENSION pgcrypto;
--
-- TOC entry 3 (class 3079 OID 606302)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4684 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 221297)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4685 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1208 (class 1247 OID 319567)
-- Name: trace_relationship; Type: TYPE; Schema: public; Owner: sic-app
--

CREATE TYPE public.trace_relationship AS ENUM (
    'DESIGNED_BY',
    'IMPLEMENTED_BY',
    'DOCUMENTED_BY',
    'VERIFIED_BY',
    'FAILED_BY',
    'AFFECTED_BY',
    'RELATED_TO'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 81930)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);



--
-- TOC entry 220 (class 1259 OID 81935)
-- Name: db_country; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_country (
    id uuid NOT NULL,
    country_code character varying(10) NOT NULL,
    iso_code character varying(10) NOT NULL,
    country_name_en character varying(100) NOT NULL,
    country_name_local character varying(100) NOT NULL,
    support_local_address boolean NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 234 (class 1259 OID 82065)
-- Name: db_district; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_district (
    id uuid NOT NULL,
    province_id uuid NOT NULL,
    district_code character varying(10) NOT NULL,
    district_name_en character varying(255) NOT NULL,
    district_name_local character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 221 (class 1259 OID 81942)
-- Name: db_mail_config; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_mail_config (
    id uuid NOT NULL,
    config_name character varying(100) NOT NULL,
    smtp_server character varying(255) NOT NULL,
    smtp_port integer NOT NULL,
    email_from character varying(320) NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(500) NOT NULL,
    enable_ssl boolean NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    max_retry integer NOT NULL,
    description character varying(500),
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 232 (class 1259 OID 82036)
-- Name: db_mail_queue; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_mail_queue (
    id uuid NOT NULL,
    template_id uuid NOT NULL,
    recipient_email character varying(255) NOT NULL,
    recipient_name character varying(255),
    body_data text,
    status character varying(20) NOT NULL,
    retry_count integer NOT NULL,
    error_message character varying(500),
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    next_retry_at timestamp with time zone,
    used_config_id uuid,
    use_english boolean NOT NULL,
    "DbMailConfigId" uuid,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 222 (class 1259 OID 81949)
-- Name: db_mail_template; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_mail_template (
    id uuid NOT NULL,
    template_code character varying(50) NOT NULL,
    template_name character varying(255) NOT NULL,
    subject_en character varying(255) NOT NULL,
    subject_local character varying(255) NOT NULL,
    content_en text NOT NULL,
    content_local text NOT NULL,
    is_html boolean NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    variables character varying(3000),
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 223 (class 1259 OID 81956)
-- Name: db_parameter; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_parameter (
    id uuid NOT NULL,
    module_code character varying(50) NOT NULL,
    parameter_code character varying(50) NOT NULL,
    parameter_value character varying(50) NOT NULL,
    parameter_name_en character varying(100) NOT NULL,
    parameter_name_local character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 231 (class 1259 OID 82024)
-- Name: db_province; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_province (
    id uuid NOT NULL,
    country_id uuid NOT NULL,
    province_code character varying(10) NOT NULL,
    province_name_en character varying(255) NOT NULL,
    province_name_local character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 235 (class 1259 OID 82077)
-- Name: db_sub_district; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_sub_district (
    id uuid NOT NULL,
    district_id uuid NOT NULL,
    sub_district_code character varying(10) NOT NULL,
    sub_district_name_en character varying(255) NOT NULL,
    sub_district_name_local character varying(255) NOT NULL,
    zip_code character varying(20) NOT NULL,
    latitude bigint,
    longitude bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 224 (class 1259 OID 81963)
-- Name: db_title; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.db_title (
    id uuid NOT NULL,
    person_type character varying(20) NOT NULL,
    prefix_short_name_en character varying(100) NOT NULL,
    prefix_short_name_local character varying(100) NOT NULL,
    suffix_short_name_en character varying(100),
    suffix_short_name_local character varying(100),
    prefix_name_en character varying(100) NOT NULL,
    prefix_name_local character varying(100) NOT NULL,
    suffix_name_en character varying(100),
    suffix_name_local character varying(100),
    sort_order integer,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 225 (class 1259 OID 81970)
-- Name: ex_example; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.ex_example (
    id uuid NOT NULL,
    example_code character varying(50) NOT NULL,
    message_en text NOT NULL,
    message_local text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    start_time text,
    end_time text,
    is_accept text,
    color text,
    country_code text,
    total bigint NOT NULL,
    upload_group_id uuid,
    is_active boolean NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 291 (class 1259 OID 294922)
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);



--
-- TOC entry 287 (class 1259 OID 245831)
-- Name: pm_approval; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL,
    document_type character varying(50) NOT NULL,
    document_id uuid NOT NULL,
    document_code character varying(50),
    document_title character varying(500),
    version character varying(20),
    requested_by character varying(100) NOT NULL,
    requested_by_name character varying(255),
    requested_date timestamp with time zone DEFAULT now(),
    flow_id uuid NOT NULL,
    current_step_id uuid,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    final_approver character varying(100),
    final_approval_date timestamp with time zone,
    comment text,
    attachment_id uuid,
    extra_data jsonb,
    reference_id uuid,
    is_active boolean DEFAULT true
);



--
-- TOC entry 4686 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE pm_approval; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON TABLE public.pm_approval IS 'คำขออนุมัติแต่ละรายการ (Instance)';


--
-- TOC entry 4687 (class 0 OID 0)
-- Dependencies: 287
-- Name: COLUMN pm_approval.status; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON COLUMN public.pm_approval.status IS 'PENDING, PARTIALLY_APPROVED, APPROVED, REJECTED, NEED_REVISION, CANCELLED, EXPIRED';


--
-- TOC entry 285 (class 1259 OID 245792)
-- Name: pm_approval_flow; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval_flow (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    flow_code character varying(50) NOT NULL,
    flow_name character varying(255) NOT NULL,
    document_type character varying(50) NOT NULL,
    approval_mode character varying(20) DEFAULT 'CHAIN'::character varying,
    is_active boolean DEFAULT true,
    description text
);



--
-- TOC entry 4688 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE pm_approval_flow; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON TABLE public.pm_approval_flow IS 'นิยามกระบวนการอนุมัติ (Workflow Template)';


--
-- TOC entry 4689 (class 0 OID 0)
-- Dependencies: 285
-- Name: COLUMN pm_approval_flow.approval_mode; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON COLUMN public.pm_approval_flow.approval_mode IS 'CHAIN=เรียงลำดับ, PARALLEL=พร้อมกัน, ANY=ใครก็ได้, SINGLE=คนเดียว';


--
-- TOC entry 286 (class 1259 OID 245810)
-- Name: pm_approval_flow_step; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval_flow_step (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    flow_id uuid NOT NULL,
    step_order integer NOT NULL,
    step_name character varying(255) NOT NULL,
    approver_role character varying(50),
    approver_user_id character varying(1000),
    is_required boolean DEFAULT true,
    timeout_days integer,
    can_skip boolean DEFAULT false,
    condition_expression character varying(500),
    timeout_action character varying(30) DEFAULT 'NONE'::character varying
);



--
-- TOC entry 4690 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE pm_approval_flow_step; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON TABLE public.pm_approval_flow_step IS 'ขั้นตอนในกระบวนการอนุมัติ';


--
-- TOC entry 4691 (class 0 OID 0)
-- Dependencies: 286
-- Name: COLUMN pm_approval_flow_step.approver_role; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON COLUMN public.pm_approval_flow_step.approver_role IS 'Role ที่ต้องอนุมัติ (BA, CUSTOMER, PM, HEAD, FINANCE, QA_LEAD)';


--
-- TOC entry 289 (class 1259 OID 245894)
-- Name: pm_approval_log; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval_log (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    approval_id uuid NOT NULL,
    step_status_id uuid,
    action character varying(30) NOT NULL,
    actor character varying(100) NOT NULL,
    actor_name character varying(255),
    comment text,
    old_status character varying(20),
    new_status character varying(20),
    ip_address character varying(50),
    user_agent text,
    extra_data jsonb
);



--
-- TOC entry 4692 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE pm_approval_log; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON TABLE public.pm_approval_log IS 'ประวัติการกระทำทั้งหมดในคำขออนุมัติ';


--
-- TOC entry 290 (class 1259 OID 245919)
-- Name: pm_approval_reminder; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval_reminder (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    approval_id uuid NOT NULL,
    step_status_id uuid,
    reminder_type character varying(20) DEFAULT 'AUTO'::character varying,
    sent_at timestamp with time zone DEFAULT now(),
    recipient character varying(100),
    recipient_email character varying(320),
    channel character varying(20),
    message text,
    is_read boolean DEFAULT false
);



--
-- TOC entry 288 (class 1259 OID 245867)
-- Name: pm_approval_step_status; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_approval_step_status (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    approval_id uuid NOT NULL,
    step_id uuid NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    approver character varying(100),
    approver_name character varying(255),
    approval_date timestamp with time zone,
    comment text,
    signature_url character varying(500),
    ip_address character varying(50),
    user_agent text,
    is_completed boolean DEFAULT false
);



--
-- TOC entry 4693 (class 0 OID 0)
-- Dependencies: 288
-- Name: TABLE pm_approval_step_status; Type: COMMENT; Schema: public; Owner: sic-app
--

COMMENT ON TABLE public.pm_approval_step_status IS 'สถานะของแต่ละขั้นตอนในคำขออนุมัติ (ใช้สำหรับ Parallel)';


--
-- TOC entry 266 (class 1259 OID 221747)
-- Name: pm_bug; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_bug (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    task_id uuid,
    test_case_id uuid,
    bug_code character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    severity character varying(20) NOT NULL,
    priority character varying(20) NOT NULL,
    found_by character varying(100),
    assigned_to character varying(100),
    found_date timestamp with time zone,
    fix_due_date date,
    fixed_date timestamp with time zone,
    status character varying(20) DEFAULT 'Open'::character varying,
    related_spec character varying(255),
    project_id uuid,
    steps_to_reproduce text,
    environment character varying(50),
    issue_type character varying(20) DEFAULT 'Bug'::character varying,
    attachment_group_id uuid
);



--
-- TOC entry 268 (class 1259 OID 221784)
-- Name: pm_bug_comment; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_bug_comment (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    bug_id uuid NOT NULL,
    comment_text text NOT NULL
);



--
-- TOC entry 267 (class 1259 OID 221768)
-- Name: pm_bug_retest_plan; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_bug_retest_plan (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    bug_id uuid NOT NULL,
    fix_plan text,
    retest_date date,
    status character varying(20) DEFAULT 'Open'::character varying
);



--
-- TOC entry 299 (class 1259 OID 409738)
-- Name: pm_change_impact; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_change_impact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    change_request_id uuid NOT NULL,
    impacted_type character varying(50) NOT NULL,
    impacted_id uuid NOT NULL,
    impacted_title character varying(255),
    impact_level character varying(20) DEFAULT 'MEDIUM'::character varying,
    created_by character varying(100) DEFAULT 'system'::character varying,
    created_date timestamp with time zone DEFAULT now(),
    updated_by character varying(100) DEFAULT 'system'::character varying,
    updated_date timestamp with time zone DEFAULT now(),
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp without time zone
);



--
-- TOC entry 300 (class 1259 OID 450577)
-- Name: pm_change_impact_analysis; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_change_impact_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    change_request_id uuid NOT NULL,
    dfd_impact text,
    er_impact text,
    ui_impact text,
    api_impact text,
    test_impact text,
    manday_impact integer,
    timeline_impact integer,
    cost_impact text,
    impacted_requirement_ids uuid[],
    impacted_spec_ids uuid[],
    impacted_task_ids uuid[],
    impacted_test_case_ids uuid[],
    impacted_bug_ids uuid[],
    impacted_table_names text[],
    analysis_status character varying(20) DEFAULT 'MANUAL'::character varying,
    analyzed_at timestamp without time zone,
    analyzed_by character varying(100),
    created_by character varying(100),
    created_date timestamp without time zone DEFAULT now(),
    updated_by character varying(100),
    updated_date timestamp without time zone,
    delete_by character varying(100),
    delete_date timestamp without time zone,
    is_delete boolean DEFAULT false,
    impacted_diagram_ids uuid[]
);



--
-- TOC entry 296 (class 1259 OID 409673)
-- Name: pm_change_request; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_change_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    change_reason character varying(50) NOT NULL,
    requester_id character varying(100) NOT NULL,
    assignee_id character varying(100) NOT NULL,
    target_version character varying(20),
    status character varying(20) DEFAULT 'DRAFT'::character varying,
    created_by character varying(100) DEFAULT 'system'::character varying,
    created_date timestamp with time zone DEFAULT now(),
    updated_by character varying(100) DEFAULT 'system'::character varying,
    updated_date timestamp with time zone DEFAULT now(),
    is_delete boolean DEFAULT false,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    approved_at timestamp without time zone,
    approved_by character varying(100),
    implemented_at timestamp without time zone,
    cr_code character varying(50),
    priority character varying(20) DEFAULT 'MEDIUM'::character varying
);



--
-- TOC entry 280 (class 1259 OID 221973)
-- Name: pm_comment; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_comment (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    parent_comment_id uuid,
    content text NOT NULL,
    is_decision boolean DEFAULT false,
    is_question boolean DEFAULT false,
    is_resolved boolean DEFAULT false,
    pinned boolean DEFAULT false,
    mention_user_id character varying(100),
    subject character varying(255),
    attachment_group_id uuid,
    extra_data jsonb
);



--
-- TOC entry 298 (class 1259 OID 409719)
-- Name: pm_cr_assignee; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_cr_assignee (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    change_request_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    completed_at timestamp with time zone,
    created_by character varying(100) DEFAULT 'system'::character varying,
    created_date timestamp with time zone DEFAULT now(),
    updated_by character varying(100) DEFAULT 'system'::character varying,
    updated_date timestamp with time zone DEFAULT now(),
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 248 (class 1259 OID 155670)
-- Name: pm_customer; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_customer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    customer_code character varying(30) NOT NULL,
    tax_id character varying(30),
    company_name_en character varying(255) NOT NULL,
    company_name_local character varying(255) NOT NULL,
    contact_person character varying(255),
    phone_number character varying(20),
    email character varying(320),
    line_id character varying(100),
    address_en character varying(500),
    address_local character varying(500),
    province_id uuid,
    district_id uuid,
    sub_district_id uuid,
    zip_code character varying(20),
    person_type character varying(50),
    is_active boolean DEFAULT true,
    remark text,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp without time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false,
    delete_by character varying(100),
    delete_date timestamp without time zone,
    upload_group_id uuid
);



--
-- TOC entry 249 (class 1259 OID 221195)
-- Name: pm_customer_contract; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_customer_contract (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    customer_id uuid NOT NULL,
    contract_no character varying(50) NOT NULL,
    contract_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    contract_value numeric(18,2) NOT NULL,
    payment_terms text,
    scope_summary text,
    sign_status character varying(20) DEFAULT 'Draft'::character varying NOT NULL,
    renewal_status character varying(20),
    file_attachment uuid,
    is_active boolean DEFAULT true NOT NULL,
    row_version integer,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp without time zone,
    parent_contract_id uuid,
    project_id uuid
);



--
-- TOC entry 250 (class 1259 OID 221220)
-- Name: pm_customer_project; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_customer_project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    customer_id uuid NOT NULL,
    contract_id uuid,
    project_code character varying(50) NOT NULL,
    project_name character varying(255) NOT NULL,
    project_manager character varying(100),
    ba character varying(100),
    sa character varying(100),
    start_date date NOT NULL,
    planned_end_date date NOT NULL,
    actual_end_date date,
    budget_manday integer DEFAULT 0 NOT NULL,
    used_manday integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'Prospect'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'Medium'::character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    row_version integer,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp without time zone
);



--
-- TOC entry 269 (class 1259 OID 221799)
-- Name: pm_delivery; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_delivery (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    delivery_date timestamp with time zone,
    delivery_status character varying(20) DEFAULT 'In Progress'::character varying,
    released_version character varying(50),
    release_notes text,
    delivery_letter_path character varying(500),
    is_locked boolean DEFAULT false NOT NULL,
    attachment_group_id uuid,
    contract_id uuid,
    milestone_id uuid,
    delivery_version character varying(20) DEFAULT '1.0'::character varying,
    release_note text,
    delivery_summary text,
    pm_approved_by character varying(255),
    pm_approved_date timestamp with time zone,
    customer_signed_by character varying(255),
    customer_signed_date timestamp with time zone,
    delivery_code character varying(50),
    delivery_title character varying(255),
    delivery_type character varying(50) DEFAULT 'FINAL'::character varying,
    status character varying(30) DEFAULT 'DRAFT'::character varying
);



--
-- TOC entry 272 (class 1259 OID 221845)
-- Name: pm_delivery_checklist; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_delivery_checklist (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    delivery_id uuid NOT NULL,
    checklist_name character varying(255),
    is_checked boolean DEFAULT false,
    checked_by character varying(100),
    checked_at timestamp with time zone,
    remark text,
    project_id uuid,
    item_name character varying(255),
    item_category character varying(50),
    checked_date timestamp with time zone,
    sort_order integer DEFAULT 0
);



--
-- TOC entry 270 (class 1259 OID 221815)
-- Name: pm_delivery_document; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_delivery_document (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    delivery_id uuid NOT NULL,
    document_name character varying(255) NOT NULL,
    document_type character varying(50) NOT NULL,
    file_path character varying(500),
    file_size bigint,
    version character varying(20)
);



--
-- TOC entry 303 (class 1259 OID 573462)
-- Name: pm_delivery_item; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_delivery_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    delivery_id uuid NOT NULL,
    item_type character varying(50) NOT NULL,
    item_id uuid NOT NULL,
    item_code character varying(50),
    item_title character varying(255),
    item_status character varying(50),
    remark text,
    sort_order integer DEFAULT 0,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL
);



--
-- TOC entry 260 (class 1259 OID 221653)
-- Name: pm_design_review; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_design_review (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    review_item_type character varying(50),
    review_item_id uuid,
    reviewer character varying(100),
    status character varying(20) DEFAULT 'Open'::character varying,
    due_date timestamp with time zone,
    review_code character varying(30),
    title character varying(255),
    description text,
    severity character varying(20) DEFAULT 'Medium'::character varying,
    assigned_to character varying(100),
    figma_url text,
    embed_mode character varying(20) DEFAULT 'prototype'::character varying,
    is_active boolean DEFAULT true
);



--
-- TOC entry 292 (class 1259 OID 294931)
-- Name: pm_diagram; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_diagram (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    diagram_type character varying(50) NOT NULL,
    mermaid_script text,
    metadata jsonb DEFAULT '{}'::jsonb,
    graph_data jsonb DEFAULT '{}'::jsonb,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    parsed_json_data jsonb,
    diagram_code character varying(50)
);



--
-- TOC entry 294 (class 1259 OID 294964)
-- Name: pm_diagram_chat; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_diagram_chat (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    diagram_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    context_data jsonb
);



--
-- TOC entry 305 (class 1259 OID 819231)
-- Name: pm_diagram_sql_history; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_diagram_sql_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tab_id character varying(100) NOT NULL,
    page_name character varying(255),
    version_no integer NOT NULL,
    generation_type character varying(20) DEFAULT 'FULL'::character varying NOT NULL,
    vendor character varying(50) DEFAULT 'postgresql'::character varying NOT NULL,
    engine character varying(20) DEFAULT 'ai'::character varying NOT NULL,
    summary_note text,
    schema_json text,
    generated_sql text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(100)
);



--
-- TOC entry 293 (class 1259 OID 294947)
-- Name: pm_diagram_versions; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_diagram_versions (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    diagram_id uuid NOT NULL,
    mermaid_script text NOT NULL,
    version_number integer NOT NULL,
    change_comment text
);



--
-- TOC entry 281 (class 1259 OID 222005)
-- Name: pm_document_version; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_document_version (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    document_type character varying(50) NOT NULL,
    document_id uuid NOT NULL,
    version_no character varying(20) NOT NULL,
    change_summary text,
    file_path character varying(500),
    is_active boolean DEFAULT true,
    document_code character varying(100),
    project_id uuid,
    previous_version_id uuid,
    approval_status character varying(30) DEFAULT 'DRAFT'::character varying,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    snapshot_data text,
    file_ref_id uuid
);



--
-- TOC entry 297 (class 1259 OID 409692)
-- Name: pm_edit_session; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_edit_session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    change_request_id uuid NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    assignee_id character varying(100) NOT NULL,
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by character varying(100) DEFAULT 'system'::character varying,
    created_date timestamp with time zone DEFAULT now(),
    updated_by character varying(100) DEFAULT 'system'::character varying,
    updated_date timestamp with time zone DEFAULT now(),
    is_delete boolean DEFAULT false,
    edit_type character varying(20) DEFAULT 'CHANGE_REQUEST'::character varying,
    delete_by character varying(100),
    delete_date timestamp without time zone
);



--
-- TOC entry 273 (class 1259 OID 221861)
-- Name: pm_invoice; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_invoice (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    contract_id uuid,
    invoice_no character varying(50) NOT NULL,
    invoice_date date,
    due_date timestamp with time zone,
    amount numeric(19,2),
    vat numeric(19,2),
    total_amount numeric(19,2),
    payment_status character varying(20) DEFAULT 'Unpaid'::character varying,
    payment_date date,
    receipt_file character varying(500),
    billing_type character varying(50),
    milestone character varying(255),
    customer_id uuid,
    delivery_id uuid,
    milestone_id uuid,
    issue_date timestamp with time zone,
    subtotal_amount numeric(15,2) DEFAULT 0,
    vat_rate numeric(5,2) DEFAULT 7.00,
    vat_amount numeric(15,2) DEFAULT 0,
    paid_amount numeric(15,2) DEFAULT 0,
    approval_status character varying(30) DEFAULT 'DRAFT'::character varying,
    receipt_file_ref text,
    remark text
);



--
-- TOC entry 274 (class 1259 OID 221882)
-- Name: pm_invoice_item; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_invoice_item (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    invoice_id uuid NOT NULL,
    description text,
    quantity numeric(19,2),
    unit_price numeric(19,2),
    total_price numeric(19,2),
    item_name character varying(255) DEFAULT ''::character varying,
    amount numeric(18,2) DEFAULT 0,
    sort_order integer DEFAULT 0
);



--
-- TOC entry 276 (class 1259 OID 221912)
-- Name: pm_ma_contract; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_ma_contract (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    contract_no character varying(50) NOT NULL,
    start_date date,
    end_date date,
    contract_value numeric(19,2),
    status character varying(20) DEFAULT 'Active'::character varying
);



--
-- TOC entry 279 (class 1259 OID 221957)
-- Name: pm_ma_renewal; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_ma_renewal (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    contract_id uuid NOT NULL,
    renewal_date date,
    new_end_date timestamp with time zone,
    renewal_status character varying(20) DEFAULT 'Pending'::character varying,
    note text,
    renewal_no character varying(50),
    customer_id uuid,
    project_id uuid,
    current_end_date timestamp with time zone,
    new_start_date timestamp with time zone,
    proposed_amount numeric(15,2) DEFAULT 0.00,
    status character varying(30) DEFAULT 'DRAFT'::character varying,
    new_contract_id uuid,
    remark text
);



--
-- TOC entry 277 (class 1259 OID 221926)
-- Name: pm_ma_ticket; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_ma_ticket (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    ma_contract_id uuid,
    ticket_no character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    severity character varying(20),
    sla_hours integer,
    assigned_to character varying(100),
    status character varying(30) DEFAULT 'Open'::character varying,
    reported_date timestamp with time zone,
    due_date timestamp with time zone,
    resolved_date timestamp with time zone,
    customer_id uuid,
    project_id uuid,
    contract_id uuid,
    ticket_type character varying(30) DEFAULT 'BUG_SUPPORT'::character varying,
    reported_by character varying(100) DEFAULT 'Customer'::character varying,
    target_response_date timestamp with time zone,
    target_resolve_date timestamp with time zone,
    closed_date timestamp with time zone,
    resolution_summary text,
    start_date timestamp with time zone,
    start_time character varying(5),
    end_date timestamp with time zone,
    end_time character varying(5)
);



--
-- TOC entry 304 (class 1259 OID 729189)
-- Name: pm_ma_ticket_assignee; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_ma_ticket_assignee (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    ma_ticket_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL
);



--
-- TOC entry 278 (class 1259 OID 221942)
-- Name: pm_ma_ticket_comment; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_ma_ticket_comment (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    ticket_id uuid NOT NULL,
    comment_text text NOT NULL
);



--
-- TOC entry 255 (class 1259 OID 221567)
-- Name: pm_milestone; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_milestone (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    phase_id uuid NOT NULL,
    milestone_name character varying(255) NOT NULL,
    description text,
    due_date date,
    status character varying(20) DEFAULT 'Not Started'::character varying,
    color character varying(20)
);



--
-- TOC entry 282 (class 1259 OID 222017)
-- Name: pm_notification; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_notification (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    receiver_id character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    link character varying(500),
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    event_type character varying(50),
    target_type character varying(50),
    target_id uuid
);



--
-- TOC entry 275 (class 1259 OID 221897)
-- Name: pm_payment; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_payment (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    invoice_id uuid NOT NULL,
    payment_date timestamp with time zone,
    amount numeric(19,2),
    payment_method character varying(50),
    reference_no character varying(100),
    note text,
    payment_no character varying(50) DEFAULT 'PAY-TEMP'::character varying,
    bank_name character varying(100),
    receipt_file text,
    payment_status character varying(20) DEFAULT 'PAID'::character varying,
    notes text
);



--
-- TOC entry 254 (class 1259 OID 221550)
-- Name: pm_phase; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_phase (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    project_id uuid NOT NULL,
    phase_name character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date,
    owner character varying(100),
    status character varying(20) DEFAULT 'Not Started'::character varying,
    dependency uuid,
    progress integer DEFAULT 0,
    business_id uuid,
    color character varying(20),
    phase_code character varying(30)
);



--
-- TOC entry 251 (class 1259 OID 221330)
-- Name: pm_requirement; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_requirement (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    requirement_code character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    requirement_type character varying(50),
    source character varying(100),
    priority character varying(20),
    business_value character varying(255),
    acceptance_criteria text,
    ba_confirm_status character varying(20) DEFAULT 'Pending'::character varying,
    customer_confirm_status character varying(20) DEFAULT 'Pending'::character varying,
    version character varying(10),
    status character varying(20) DEFAULT 'Draft'::character varying,
    is_active boolean DEFAULT true,
    upload_group_id uuid
);



--
-- TOC entry 261 (class 1259 OID 221669)
-- Name: pm_review_comment; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_review_comment (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    review_id uuid NOT NULL,
    comment_type character varying(20) NOT NULL,
    comment_text text NOT NULL,
    severity character varying(20),
    assigned_to character varying(100),
    status character varying(20) DEFAULT 'Open'::character varying
);



--
-- TOC entry 252 (class 1259 OID 221517)
-- Name: pm_specification; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_specification (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    specification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    estimated_manday integer,
    status character varying(20) DEFAULT 'Draft'::character varying,
    requirement_id uuid NOT NULL,
    version character varying(20) DEFAULT '1.0'::character varying,
    is_active boolean DEFAULT true,
    approval_flow_id uuid,
    specification_code character varying(50) NOT NULL,
    owner character varying(100),
    priority character varying(20) DEFAULT 'Medium'::character varying,
    upload_group_id uuid
);



--
-- TOC entry 257 (class 1259 OID 221599)
-- Name: pm_task; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_task (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    work_package_id uuid NOT NULL,
    spec_id uuid,
    task_code character varying(30) NOT NULL,
    task_name character varying(255) NOT NULL,
    description text,
    assigned_to character varying(100),
    start_date date,
    end_date date,
    actual_start date,
    actual_end date,
    estimate_manday integer,
    actual_manday integer DEFAULT 0,
    status character varying(20) DEFAULT 'Todo'::character varying,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    dependency_on uuid,
    impact_if_delay text,
    color character varying(20)
);



--
-- TOC entry 259 (class 1259 OID 221640)
-- Name: pm_task_assignee; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_task_assignee (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    task_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    role_in_task character varying(50)
);



--
-- TOC entry 258 (class 1259 OID 221622)
-- Name: pm_task_dependency; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_task_dependency (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    task_id uuid NOT NULL,
    depends_on_task_id uuid NOT NULL
);



--
-- TOC entry 264 (class 1259 OID 221716)
-- Name: pm_test_case; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_test_case (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    scenario_id uuid,
    test_case_code character varying(30) NOT NULL,
    test_step text NOT NULL,
    expected_result text NOT NULL,
    actual_result text,
    test_status character varying(20) DEFAULT 'Pending'::character varying,
    tester character varying(100),
    test_date timestamp with time zone,
    related_requirement text,
    related_spec text,
    related_task text,
    project_id uuid,
    title character varying(255),
    priority character varying(20) DEFAULT 'Medium'::character varying,
    task_id uuid,
    scenario_name character varying(255)
);



--
-- TOC entry 262 (class 1259 OID 221685)
-- Name: pm_test_plan; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_test_plan (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    plan_name character varying(255) NOT NULL,
    test_type character varying(50) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'Draft'::character varying
);



--
-- TOC entry 265 (class 1259 OID 221732)
-- Name: pm_test_result; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_test_result (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    test_case_id uuid NOT NULL,
    execution_date timestamp with time zone,
    result character varying(20) NOT NULL,
    actual_output text,
    remarks text
);



--
-- TOC entry 263 (class 1259 OID 221701)
-- Name: pm_test_scenario; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_test_scenario (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    test_plan_id uuid,
    scenario_name character varying(255) NOT NULL,
    description text,
    prerequisite text,
    project_id uuid,
    status character varying(20) DEFAULT 'Active'::character varying,
    task_id uuid,
    priority character varying(50),
    scenario_code character varying(50)
);



--
-- TOC entry 295 (class 1259 OID 319581)
-- Name: pm_trace_link; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_trace_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    source_type character varying(50) NOT NULL,
    source_id uuid NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    relationship_type public.trace_relationship NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 253 (class 1259 OID 221535)
-- Name: pm_usecase; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_usecase (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    project_id uuid NOT NULL,
    usecase_name character varying(255) NOT NULL,
    description text,
    actor character varying(100),
    pre_condition text,
    post_condition text,
    basic_flow text,
    alternative_flow text
);



--
-- TOC entry 271 (class 1259 OID 221830)
-- Name: pm_user_manual; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_user_manual (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    delivery_id uuid,
    manual_type character varying(50),
    content text,
    file_path character varying(500),
    version character varying(20),
    project_id uuid,
    attachment_group_id uuid,
    manual_code character varying(50),
    manual_title character varying(255),
    related_spec_id uuid,
    status character varying(30) DEFAULT 'DRAFT'::character varying
);



--
-- TOC entry 301 (class 1259 OID 532495)
-- Name: pm_user_manual_section; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_user_manual_section (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    manual_id uuid NOT NULL,
    section_code character varying(50),
    section_title character varying(255) NOT NULL,
    content text,
    sort_order integer DEFAULT 0,
    permission_roles text,
    screenshot_group_id uuid,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid
);



--
-- TOC entry 256 (class 1259 OID 221583)
-- Name: pm_work_package; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.pm_work_package (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    milestone_id uuid NOT NULL,
    package_name character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'Not Started'::character varying,
    color character varying(20)
);



--
-- TOC entry 283 (class 1259 OID 222029)
-- Name: su_audit_log; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_audit_log (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    user_id character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    old_value jsonb,
    new_value jsonb,
    ip_address character varying(50),
    user_agent text,
    username character varying(100),
    user_fullname character varying(200),
    module character varying(100) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    description text,
    status character varying(20) DEFAULT 'Success'::character varying NOT NULL,
    details text
);



--
-- TOC entry 236 (class 1259 OID 82089)
-- Name: su_business; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_business (
    id uuid NOT NULL,
    tax_id character varying(30),
    person_type character varying(100) NOT NULL,
    title_id uuid NOT NULL,
    first_name_en character varying(100) NOT NULL,
    middle_name_en character varying(100),
    last_name_en character varying(100),
    first_name_local character varying(100) NOT NULL,
    middle_name_local character varying(100),
    last_name_local character varying(100),
    country_id uuid NOT NULL,
    support_local_address boolean NOT NULL,
    address_en character varying(255),
    address_local character varying(255),
    province_id uuid,
    district_id uuid,
    sub_district_id uuid,
    zip_code character varying(20),
    email character varying(320),
    phone_number character varying(20),
    fax character varying(20),
    upload_group_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_code character varying(30) DEFAULT ''::character varying NOT NULL,
    branch_code character varying(30) DEFAULT ''::character varying
);



--
-- TOC entry 226 (class 1259 OID 81977)
-- Name: su_business_audit; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_business_audit (
    id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    session_id character varying(100) NOT NULL,
    username character varying(100),
    business_id uuid NOT NULL,
    client_ip character varying(50),
    remark character varying(500),
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    is_active boolean DEFAULT false NOT NULL
);



--
-- TOC entry 284 (class 1259 OID 245769)
-- Name: su_business_invite; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_business_invite (
    id uuid NOT NULL,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL,
    role_id uuid NOT NULL,
    invite_type character varying(50) NOT NULL,
    invite_email character varying(320),
    invite_token character varying(300),
    is_activated boolean DEFAULT false NOT NULL,
    expire_at timestamp with time zone,
    max_uses integer,
    use_count integer DEFAULT 0
);



--
-- TOC entry 238 (class 1259 OID 82153)
-- Name: su_business_role; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_business_role (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    parent_role_id uuid,
    role_code character varying(50) NOT NULL,
    role_name_en character varying(255) NOT NULL,
    role_name_local character varying(255) NOT NULL,
    role_level character varying(50),
    sort_order integer,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    color character varying(20)
);



--
-- TOC entry 240 (class 1259 OID 82192)
-- Name: su_business_role_program; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_business_role_program (
    id uuid NOT NULL,
    business_role_id uuid NOT NULL,
    program_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    is_add boolean DEFAULT false NOT NULL,
    is_back boolean DEFAULT false NOT NULL,
    is_print boolean DEFAULT false NOT NULL,
    is_remove boolean DEFAULT false NOT NULL,
    is_save boolean DEFAULT false NOT NULL,
    is_search boolean DEFAULT false NOT NULL
);



--
-- TOC entry 243 (class 1259 OID 82284)
-- Name: su_chat_group; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_chat_group (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL
);



--
-- TOC entry 246 (class 1259 OID 82322)
-- Name: su_chat_group_call_participant; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_chat_group_call_participant (
    id uuid NOT NULL,
    log_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 244 (class 1259 OID 82291)
-- Name: su_chat_group_log; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_chat_group_log (
    id uuid NOT NULL,
    group_id uuid NOT NULL,
    sender_id character varying(100) NOT NULL,
    message character varying(4000) NOT NULL,
    message_type integer NOT NULL,
    attachment_id uuid,
    is_cancelled boolean NOT NULL,
    cancelled_at timestamp with time zone,
    cancelled_by character varying(100),
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL,
    call_accepted boolean,
    call_duration_seconds integer
);



--
-- TOC entry 245 (class 1259 OID 82308)
-- Name: su_chat_group_member; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_chat_group_member (
    id uuid NOT NULL,
    group_id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL
);



--
-- TOC entry 242 (class 1259 OID 82270)
-- Name: su_chat_log; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_chat_log (
    id uuid NOT NULL,
    sender_id character varying(100) NOT NULL,
    receiver_id character varying(100) NOT NULL,
    message character varying(4000) NOT NULL,
    message_type integer NOT NULL,
    attachment_id uuid,
    is_cancelled boolean NOT NULL,
    cancelled_at timestamp with time zone,
    cancelled_by character varying(100),
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid,
    call_accepted boolean,
    call_duration_seconds integer,
    is_read boolean DEFAULT false,
    sender_name character varying(100),
    receiver_name character varying(100)
);



--
-- TOC entry 227 (class 1259 OID 81984)
-- Name: su_message; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_message (
    id uuid NOT NULL,
    module_code character varying(10) NOT NULL,
    program_code character varying(50) NOT NULL,
    message_code character varying(50) NOT NULL,
    message_en character varying(255) NOT NULL,
    message_local character varying(255) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 302 (class 1259 OID 532527)
-- Name: su_notification; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    recipient_user_id character varying(100) NOT NULL,
    sender_id character varying(100),
    sender_name character varying(100),
    title character varying(255) NOT NULL,
    message character varying(2000) NOT NULL,
    type character varying(50),
    link_url character varying(500),
    is_read boolean DEFAULT false NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_delete boolean DEFAULT false NOT NULL,
    delete_by character varying(100),
    delete_date timestamp without time zone
);



--
-- TOC entry 237 (class 1259 OID 82121)
-- Name: su_profile; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_profile (
    id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    tax_id character varying(30),
    title_id uuid NOT NULL,
    first_name_en character varying(100) NOT NULL,
    middle_name_en character varying(100),
    last_name_en character varying(100),
    first_name_local character varying(100) NOT NULL,
    middle_name_local character varying(100),
    last_name_local character varying(100),
    country_id uuid,
    support_local_address boolean NOT NULL,
    address_en character varying(255),
    address_local character varying(255),
    province_id uuid,
    district_id uuid,
    sub_district_id uuid,
    zip_code character varying(20),
    email character varying(320) NOT NULL,
    phone_number character varying(20),
    upload_group_id uuid,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 247 (class 1259 OID 147469)
-- Name: su_program; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_program (
    id uuid NOT NULL,
    parent_program_id uuid,
    program_code character varying(50),
    icon character varying(100),
    name_en character varying(255),
    name_local character varying(255),
    route_path character varying(500),
    sort_order integer,
    is_active boolean DEFAULT true,
    created_by character varying(100),
    created_date timestamp with time zone,
    updated_by character varying(100),
    updated_date timestamp with time zone,
    is_delete boolean,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    is_add boolean,
    is_back boolean,
    is_print boolean,
    is_remove boolean,
    is_save boolean,
    is_search boolean
);



--
-- TOC entry 228 (class 1259 OID 82003)
-- Name: su_task; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_task (
    id uuid NOT NULL,
    task_code character varying(20) NOT NULL,
    task_name_en character varying(255),
    task_name_local character varying(255),
    is_active boolean NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL
);



--
-- TOC entry 229 (class 1259 OID 82010)
-- Name: su_upload; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_upload (
    id uuid NOT NULL,
    bussiness_id uuid,
    bucket_name character varying(100) NOT NULL,
    object_key character varying(1000) NOT NULL,
    file_name character varying(255) NOT NULL,
    content_type character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    category character varying(50) NOT NULL,
    visibility integer NOT NULL,
    storage_url character varying(2000) NOT NULL,
    access_url character varying(2000) NOT NULL,
    is_streaming boolean NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    upload_group_id uuid,
    temp_expires_at timestamp with time zone,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    session_id uuid
);



--
-- TOC entry 239 (class 1259 OID 82170)
-- Name: su_user_business; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_user_business (
    id uuid NOT NULL,
    user_id character varying(100) NOT NULL,
    business_id uuid NOT NULL,
    is_default boolean NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 241 (class 1259 OID 82207)
-- Name: su_user_business_role; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_user_business_role (
    id uuid NOT NULL,
    user_business_id uuid NOT NULL,
    business_role_id uuid NOT NULL,
    is_primary boolean NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 233 (class 1259 OID 82053)
-- Name: su_user_task; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_user_task (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    description character varying(2000),
    task_id uuid NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone,
    business_id uuid NOT NULL
);



--
-- TOC entry 230 (class 1259 OID 82017)
-- Name: su_verify; Type: TABLE; Schema: public; Owner: sic-app
--

CREATE TABLE public.su_verify (
    id uuid NOT NULL,
    verify_type character varying(100) NOT NULL,
    reference_number character varying(300) NOT NULL,
    token character varying(300) NOT NULL,
    max_retry integer NOT NULL,
    retry_count integer NOT NULL,
    expire_at timestamp with time zone NOT NULL,
    recipient character varying(255) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_by character varying(100) NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    is_delete boolean NOT NULL,
    delete_by character varying(100),
    delete_date timestamp with time zone
);



--
-- TOC entry 4591 (class 0 OID 81930)
-- Dependencies: 219
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4592 (class 0 OID 81935)
-- Dependencies: 220
-- Data for Name: db_country; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4606 (class 0 OID 82065)
-- Dependencies: 234
-- Data for Name: db_district; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4593 (class 0 OID 81942)
-- Dependencies: 221
-- Data for Name: db_mail_config; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4604 (class 0 OID 82036)
-- Dependencies: 232
-- Data for Name: db_mail_queue; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4594 (class 0 OID 81949)
-- Dependencies: 222
-- Data for Name: db_mail_template; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4595 (class 0 OID 81956)
-- Dependencies: 223
-- Data for Name: db_parameter; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4603 (class 0 OID 82024)
-- Dependencies: 231
-- Data for Name: db_province; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4607 (class 0 OID 82077)
-- Dependencies: 235
-- Data for Name: db_sub_district; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4596 (class 0 OID 81963)
-- Dependencies: 224
-- Data for Name: db_title; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4597 (class 0 OID 81970)
-- Dependencies: 225
-- Data for Name: ex_example; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4663 (class 0 OID 294922)
-- Dependencies: 291
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4659 (class 0 OID 245831)
-- Dependencies: 287
-- Data for Name: pm_approval; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4657 (class 0 OID 245792)
-- Dependencies: 285
-- Data for Name: pm_approval_flow; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4658 (class 0 OID 245810)
-- Dependencies: 286
-- Data for Name: pm_approval_flow_step; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4661 (class 0 OID 245894)
-- Dependencies: 289
-- Data for Name: pm_approval_log; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4662 (class 0 OID 245919)
-- Dependencies: 290
-- Data for Name: pm_approval_reminder; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4660 (class 0 OID 245867)
-- Dependencies: 288
-- Data for Name: pm_approval_step_status; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4638 (class 0 OID 221747)
-- Dependencies: 266
-- Data for Name: pm_bug; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4640 (class 0 OID 221784)
-- Dependencies: 268
-- Data for Name: pm_bug_comment; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4639 (class 0 OID 221768)
-- Dependencies: 267
-- Data for Name: pm_bug_retest_plan; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4671 (class 0 OID 409738)
-- Dependencies: 299
-- Data for Name: pm_change_impact; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4672 (class 0 OID 450577)
-- Dependencies: 300
-- Data for Name: pm_change_impact_analysis; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4668 (class 0 OID 409673)
-- Dependencies: 296
-- Data for Name: pm_change_request; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4652 (class 0 OID 221973)
-- Dependencies: 280
-- Data for Name: pm_comment; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4670 (class 0 OID 409719)
-- Dependencies: 298
-- Data for Name: pm_cr_assignee; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4620 (class 0 OID 155670)
-- Dependencies: 248
-- Data for Name: pm_customer; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4621 (class 0 OID 221195)
-- Dependencies: 249
-- Data for Name: pm_customer_contract; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4622 (class 0 OID 221220)
-- Dependencies: 250
-- Data for Name: pm_customer_project; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4641 (class 0 OID 221799)
-- Dependencies: 269
-- Data for Name: pm_delivery; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4644 (class 0 OID 221845)
-- Dependencies: 272
-- Data for Name: pm_delivery_checklist; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4642 (class 0 OID 221815)
-- Dependencies: 270
-- Data for Name: pm_delivery_document; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4675 (class 0 OID 573462)
-- Dependencies: 303
-- Data for Name: pm_delivery_item; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4632 (class 0 OID 221653)
-- Dependencies: 260
-- Data for Name: pm_design_review; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4664 (class 0 OID 294931)
-- Dependencies: 292
-- Data for Name: pm_diagram; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4666 (class 0 OID 294964)
-- Dependencies: 294
-- Data for Name: pm_diagram_chat; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4677 (class 0 OID 819231)
-- Dependencies: 305
-- Data for Name: pm_diagram_sql_history; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4665 (class 0 OID 294947)
-- Dependencies: 293
-- Data for Name: pm_diagram_versions; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4653 (class 0 OID 222005)
-- Dependencies: 281
-- Data for Name: pm_document_version; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4669 (class 0 OID 409692)
-- Dependencies: 297
-- Data for Name: pm_edit_session; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4645 (class 0 OID 221861)
-- Dependencies: 273
-- Data for Name: pm_invoice; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4646 (class 0 OID 221882)
-- Dependencies: 274
-- Data for Name: pm_invoice_item; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4648 (class 0 OID 221912)
-- Dependencies: 276
-- Data for Name: pm_ma_contract; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4651 (class 0 OID 221957)
-- Dependencies: 279
-- Data for Name: pm_ma_renewal; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4649 (class 0 OID 221926)
-- Dependencies: 277
-- Data for Name: pm_ma_ticket; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4676 (class 0 OID 729189)
-- Dependencies: 304
-- Data for Name: pm_ma_ticket_assignee; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4650 (class 0 OID 221942)
-- Dependencies: 278
-- Data for Name: pm_ma_ticket_comment; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4627 (class 0 OID 221567)
-- Dependencies: 255
-- Data for Name: pm_milestone; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4654 (class 0 OID 222017)
-- Dependencies: 282
-- Data for Name: pm_notification; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4647 (class 0 OID 221897)
-- Dependencies: 275
-- Data for Name: pm_payment; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4626 (class 0 OID 221550)
-- Dependencies: 254
-- Data for Name: pm_phase; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4623 (class 0 OID 221330)
-- Dependencies: 251
-- Data for Name: pm_requirement; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4633 (class 0 OID 221669)
-- Dependencies: 261
-- Data for Name: pm_review_comment; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4624 (class 0 OID 221517)
-- Dependencies: 252
-- Data for Name: pm_specification; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4629 (class 0 OID 221599)
-- Dependencies: 257
-- Data for Name: pm_task; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4631 (class 0 OID 221640)
-- Dependencies: 259
-- Data for Name: pm_task_assignee; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4630 (class 0 OID 221622)
-- Dependencies: 258
-- Data for Name: pm_task_dependency; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4636 (class 0 OID 221716)
-- Dependencies: 264
-- Data for Name: pm_test_case; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4634 (class 0 OID 221685)
-- Dependencies: 262
-- Data for Name: pm_test_plan; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4637 (class 0 OID 221732)
-- Dependencies: 265
-- Data for Name: pm_test_result; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4635 (class 0 OID 221701)
-- Dependencies: 263
-- Data for Name: pm_test_scenario; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4667 (class 0 OID 319581)
-- Dependencies: 295
-- Data for Name: pm_trace_link; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4625 (class 0 OID 221535)
-- Dependencies: 253
-- Data for Name: pm_usecase; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4643 (class 0 OID 221830)
-- Dependencies: 271
-- Data for Name: pm_user_manual; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4673 (class 0 OID 532495)
-- Dependencies: 301
-- Data for Name: pm_user_manual_section; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4628 (class 0 OID 221583)
-- Dependencies: 256
-- Data for Name: pm_work_package; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4655 (class 0 OID 222029)
-- Dependencies: 283
-- Data for Name: su_audit_log; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4608 (class 0 OID 82089)
-- Dependencies: 236
-- Data for Name: su_business; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4598 (class 0 OID 81977)
-- Dependencies: 226
-- Data for Name: su_business_audit; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4656 (class 0 OID 245769)
-- Dependencies: 284
-- Data for Name: su_business_invite; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4610 (class 0 OID 82153)
-- Dependencies: 238
-- Data for Name: su_business_role; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4612 (class 0 OID 82192)
-- Dependencies: 240
-- Data for Name: su_business_role_program; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4615 (class 0 OID 82284)
-- Dependencies: 243
-- Data for Name: su_chat_group; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4618 (class 0 OID 82322)
-- Dependencies: 246
-- Data for Name: su_chat_group_call_participant; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4616 (class 0 OID 82291)
-- Dependencies: 244
-- Data for Name: su_chat_group_log; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4617 (class 0 OID 82308)
-- Dependencies: 245
-- Data for Name: su_chat_group_member; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4614 (class 0 OID 82270)
-- Dependencies: 242
-- Data for Name: su_chat_log; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4599 (class 0 OID 81984)
-- Dependencies: 227
-- Data for Name: su_message; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4674 (class 0 OID 532527)
-- Dependencies: 302
-- Data for Name: su_notification; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4609 (class 0 OID 82121)
-- Dependencies: 237
-- Data for Name: su_profile; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4619 (class 0 OID 147469)
-- Dependencies: 247
-- Data for Name: su_program; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4600 (class 0 OID 82003)
-- Dependencies: 228
-- Data for Name: su_task; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4601 (class 0 OID 82010)
-- Dependencies: 229
-- Data for Name: su_upload; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4611 (class 0 OID 82170)
-- Dependencies: 239
-- Data for Name: su_user_business; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4613 (class 0 OID 82207)
-- Dependencies: 241
-- Data for Name: su_user_business_role; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4605 (class 0 OID 82053)
-- Dependencies: 233
-- Data for Name: su_user_task; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4602 (class 0 OID 82017)
-- Dependencies: 230
-- Data for Name: su_verify; Type: TABLE DATA; Schema: public; Owner: sic-app
--



--
-- TOC entry 4022 (class 2606 OID 81934)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 4026 (class 2606 OID 81941)
-- Name: db_country PK_db_country; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_country
    ADD CONSTRAINT "PK_db_country" PRIMARY KEY (id);


--
-- TOC entry 4079 (class 2606 OID 82071)
-- Name: db_district PK_db_district; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_district
    ADD CONSTRAINT "PK_db_district" PRIMARY KEY (id);


--
-- TOC entry 4030 (class 2606 OID 81948)
-- Name: db_mail_config PK_db_mail_config; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_mail_config
    ADD CONSTRAINT "PK_db_mail_config" PRIMARY KEY (id);


--
-- TOC entry 4070 (class 2606 OID 82042)
-- Name: db_mail_queue PK_db_mail_queue; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_mail_queue
    ADD CONSTRAINT "PK_db_mail_queue" PRIMARY KEY (id);


--
-- TOC entry 4033 (class 2606 OID 81955)
-- Name: db_mail_template PK_db_mail_template; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_mail_template
    ADD CONSTRAINT "PK_db_mail_template" PRIMARY KEY (id);


--
-- TOC entry 4037 (class 2606 OID 81962)
-- Name: db_parameter PK_db_parameter; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_parameter
    ADD CONSTRAINT "PK_db_parameter" PRIMARY KEY (id);


--
-- TOC entry 4064 (class 2606 OID 82030)
-- Name: db_province PK_db_province; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_province
    ADD CONSTRAINT "PK_db_province" PRIMARY KEY (id);


--
-- TOC entry 4085 (class 2606 OID 82083)
-- Name: db_sub_district PK_db_sub_district; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_sub_district
    ADD CONSTRAINT "PK_db_sub_district" PRIMARY KEY (id);


--
-- TOC entry 4040 (class 2606 OID 81969)
-- Name: db_title PK_db_title; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_title
    ADD CONSTRAINT "PK_db_title" PRIMARY KEY (id);


--
-- TOC entry 4042 (class 2606 OID 81976)
-- Name: ex_example PK_ex_example; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.ex_example
    ADD CONSTRAINT "PK_ex_example" PRIMARY KEY (id);


--
-- TOC entry 4094 (class 2606 OID 82095)
-- Name: su_business PK_su_business; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "PK_su_business" PRIMARY KEY (id);


--
-- TOC entry 4045 (class 2606 OID 81983)
-- Name: su_business_audit PK_su_business_audit; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_audit
    ADD CONSTRAINT "PK_su_business_audit" PRIMARY KEY (id);


--
-- TOC entry 4107 (class 2606 OID 82159)
-- Name: su_business_role PK_su_business_role; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role
    ADD CONSTRAINT "PK_su_business_role" PRIMARY KEY (id);


--
-- TOC entry 4118 (class 2606 OID 82196)
-- Name: su_business_role_program PK_su_business_role_program; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role_program
    ADD CONSTRAINT "PK_su_business_role_program" PRIMARY KEY (id);


--
-- TOC entry 4131 (class 2606 OID 82290)
-- Name: su_chat_group PK_su_chat_group; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group
    ADD CONSTRAINT "PK_su_chat_group" PRIMARY KEY (id);


--
-- TOC entry 4141 (class 2606 OID 82326)
-- Name: su_chat_group_call_participant PK_su_chat_group_call_participant; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_call_participant
    ADD CONSTRAINT "PK_su_chat_group_call_participant" PRIMARY KEY (id);


--
-- TOC entry 4135 (class 2606 OID 82297)
-- Name: su_chat_group_log PK_su_chat_group_log; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_log
    ADD CONSTRAINT "PK_su_chat_group_log" PRIMARY KEY (id);


--
-- TOC entry 4138 (class 2606 OID 82312)
-- Name: su_chat_group_member PK_su_chat_group_member; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_member
    ADD CONSTRAINT "PK_su_chat_group_member" PRIMARY KEY (id);


--
-- TOC entry 4128 (class 2606 OID 82276)
-- Name: su_chat_log PK_su_chat_log; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_log
    ADD CONSTRAINT "PK_su_chat_log" PRIMARY KEY (id);


--
-- TOC entry 4048 (class 2606 OID 81990)
-- Name: su_message PK_su_message; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_message
    ADD CONSTRAINT "PK_su_message" PRIMARY KEY (id);


--
-- TOC entry 4102 (class 2606 OID 82127)
-- Name: su_profile PK_su_profile; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "PK_su_profile" PRIMARY KEY (id);


--
-- TOC entry 4051 (class 2606 OID 82009)
-- Name: su_task PK_su_task; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_task
    ADD CONSTRAINT "PK_su_task" PRIMARY KEY (id);


--
-- TOC entry 4055 (class 2606 OID 82016)
-- Name: su_upload PK_su_upload; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_upload
    ADD CONSTRAINT "PK_su_upload" PRIMARY KEY (id);


--
-- TOC entry 4113 (class 2606 OID 82174)
-- Name: su_user_business PK_su_user_business; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_business
    ADD CONSTRAINT "PK_su_user_business" PRIMARY KEY (id);


--
-- TOC entry 4123 (class 2606 OID 82211)
-- Name: su_user_business_role PK_su_user_business_role; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_business_role
    ADD CONSTRAINT "PK_su_user_business_role" PRIMARY KEY (id);


--
-- TOC entry 4075 (class 2606 OID 82059)
-- Name: su_user_task PK_su_user_task; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_task
    ADD CONSTRAINT "PK_su_user_task" PRIMARY KEY (id);


--
-- TOC entry 4060 (class 2606 OID 82023)
-- Name: su_verify PK_su_verify; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_verify
    ADD CONSTRAINT "PK_su_verify" PRIMARY KEY (id);


--
-- TOC entry 4293 (class 2606 OID 294929)
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- TOC entry 4263 (class 2606 OID 245805)
-- Name: pm_approval_flow pm_approval_flow_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_flow
    ADD CONSTRAINT pm_approval_flow_pkey PRIMARY KEY (id);


--
-- TOC entry 4269 (class 2606 OID 245823)
-- Name: pm_approval_flow_step pm_approval_flow_step_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_flow_step
    ADD CONSTRAINT pm_approval_flow_step_pkey PRIMARY KEY (id);


--
-- TOC entry 4287 (class 2606 OID 245905)
-- Name: pm_approval_log pm_approval_log_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_log
    ADD CONSTRAINT pm_approval_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4277 (class 2606 OID 245845)
-- Name: pm_approval pm_approval_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval
    ADD CONSTRAINT pm_approval_pkey PRIMARY KEY (id);


--
-- TOC entry 4291 (class 2606 OID 245933)
-- Name: pm_approval_reminder pm_approval_reminder_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_reminder
    ADD CONSTRAINT pm_approval_reminder_pkey PRIMARY KEY (id);


--
-- TOC entry 4282 (class 2606 OID 245880)
-- Name: pm_approval_step_status pm_approval_step_status_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_step_status
    ADD CONSTRAINT pm_approval_step_status_pkey PRIMARY KEY (id);


--
-- TOC entry 4256 (class 2606 OID 222038)
-- Name: su_audit_log pm_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_audit_log
    ADD CONSTRAINT pm_audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 221793)
-- Name: pm_bug_comment pm_bug_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug_comment
    ADD CONSTRAINT pm_bug_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4207 (class 2606 OID 221757)
-- Name: pm_bug pm_bug_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug
    ADD CONSTRAINT pm_bug_pkey PRIMARY KEY (id);


--
-- TOC entry 4209 (class 2606 OID 221778)
-- Name: pm_bug_retest_plan pm_bug_retest_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug_retest_plan
    ADD CONSTRAINT pm_bug_retest_plan_pkey PRIMARY KEY (id);


--
-- TOC entry 4336 (class 2606 OID 450587)
-- Name: pm_change_impact_analysis pm_change_impact_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_impact_analysis
    ADD CONSTRAINT pm_change_impact_analysis_pkey PRIMARY KEY (id);


--
-- TOC entry 4332 (class 2606 OID 409751)
-- Name: pm_change_impact pm_change_impact_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_impact
    ADD CONSTRAINT pm_change_impact_pkey PRIMARY KEY (id);


--
-- TOC entry 4321 (class 2606 OID 409686)
-- Name: pm_change_request pm_change_request_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_request
    ADD CONSTRAINT pm_change_request_pkey PRIMARY KEY (id);


--
-- TOC entry 4240 (class 2606 OID 221986)
-- Name: pm_comment pm_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_comment
    ADD CONSTRAINT pm_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4329 (class 2606 OID 409730)
-- Name: pm_cr_assignee pm_cr_assignee_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_cr_assignee
    ADD CONSTRAINT pm_cr_assignee_pkey PRIMARY KEY (id);


--
-- TOC entry 4158 (class 2606 OID 221209)
-- Name: pm_customer_contract pm_customer_contract_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_contract
    ADD CONSTRAINT pm_customer_contract_pkey PRIMARY KEY (id);


--
-- TOC entry 4150 (class 2606 OID 155683)
-- Name: pm_customer pm_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer
    ADD CONSTRAINT pm_customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4167 (class 2606 OID 221237)
-- Name: pm_customer_project pm_customer_project_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_project
    ADD CONSTRAINT pm_customer_project_pkey PRIMARY KEY (id);


--
-- TOC entry 4221 (class 2606 OID 221855)
-- Name: pm_delivery_checklist pm_delivery_checklist_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_checklist
    ADD CONSTRAINT pm_delivery_checklist_pkey PRIMARY KEY (id);


--
-- TOC entry 4216 (class 2606 OID 221824)
-- Name: pm_delivery_document pm_delivery_document_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_document
    ADD CONSTRAINT pm_delivery_document_pkey PRIMARY KEY (id);


--
-- TOC entry 4344 (class 2606 OID 573475)
-- Name: pm_delivery_item pm_delivery_item_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_item
    ADD CONSTRAINT pm_delivery_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4214 (class 2606 OID 221809)
-- Name: pm_delivery pm_delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery
    ADD CONSTRAINT pm_delivery_pkey PRIMARY KEY (id);


--
-- TOC entry 4192 (class 2606 OID 221663)
-- Name: pm_design_review pm_design_review_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_design_review
    ADD CONSTRAINT pm_design_review_pkey PRIMARY KEY (id);


--
-- TOC entry 4309 (class 2606 OID 294975)
-- Name: pm_diagram_chat pm_diagram_chat_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram_chat
    ADD CONSTRAINT pm_diagram_chat_pkey PRIMARY KEY (id);


--
-- TOC entry 4302 (class 2606 OID 294946)
-- Name: pm_diagram pm_diagram_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram
    ADD CONSTRAINT pm_diagram_pkey PRIMARY KEY (id);


--
-- TOC entry 4350 (class 2606 OID 819242)
-- Name: pm_diagram_sql_history pm_diagram_sql_history_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram_sql_history
    ADD CONSTRAINT pm_diagram_sql_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4305 (class 2606 OID 294958)
-- Name: pm_diagram_versions pm_diagram_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram_versions
    ADD CONSTRAINT pm_diagram_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 4247 (class 2606 OID 222015)
-- Name: pm_document_version pm_document_version_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_document_version
    ADD CONSTRAINT pm_document_version_pkey PRIMARY KEY (id);


--
-- TOC entry 4325 (class 2606 OID 409704)
-- Name: pm_edit_session pm_edit_session_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_edit_session
    ADD CONSTRAINT pm_edit_session_pkey PRIMARY KEY (id);


--
-- TOC entry 4225 (class 2606 OID 221891)
-- Name: pm_invoice_item pm_invoice_item_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_invoice_item
    ADD CONSTRAINT pm_invoice_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4223 (class 2606 OID 221871)
-- Name: pm_invoice pm_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_invoice
    ADD CONSTRAINT pm_invoice_pkey PRIMARY KEY (id);


--
-- TOC entry 4229 (class 2606 OID 221920)
-- Name: pm_ma_contract pm_ma_contract_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_contract
    ADD CONSTRAINT pm_ma_contract_pkey PRIMARY KEY (id);


--
-- TOC entry 4235 (class 2606 OID 221967)
-- Name: pm_ma_renewal pm_ma_renewal_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_renewal
    ADD CONSTRAINT pm_ma_renewal_pkey PRIMARY KEY (id);


--
-- TOC entry 4346 (class 2606 OID 729199)
-- Name: pm_ma_ticket_assignee pm_ma_ticket_assignee_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket_assignee
    ADD CONSTRAINT pm_ma_ticket_assignee_pkey PRIMARY KEY (id);


--
-- TOC entry 4233 (class 2606 OID 221951)
-- Name: pm_ma_ticket_comment pm_ma_ticket_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket_comment
    ADD CONSTRAINT pm_ma_ticket_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4231 (class 2606 OID 221936)
-- Name: pm_ma_ticket pm_ma_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket
    ADD CONSTRAINT pm_ma_ticket_pkey PRIMARY KEY (id);


--
-- TOC entry 4180 (class 2606 OID 221577)
-- Name: pm_milestone pm_milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_milestone
    ADD CONSTRAINT pm_milestone_pkey PRIMARY KEY (id);


--
-- TOC entry 4250 (class 2606 OID 222027)
-- Name: pm_notification pm_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_notification
    ADD CONSTRAINT pm_notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4227 (class 2606 OID 221906)
-- Name: pm_payment pm_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_payment
    ADD CONSTRAINT pm_payment_pkey PRIMARY KEY (id);


--
-- TOC entry 4178 (class 2606 OID 221561)
-- Name: pm_phase pm_phase_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_phase
    ADD CONSTRAINT pm_phase_pkey PRIMARY KEY (id);


--
-- TOC entry 4171 (class 2606 OID 221342)
-- Name: pm_requirement pm_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_requirement
    ADD CONSTRAINT pm_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 4194 (class 2606 OID 221679)
-- Name: pm_review_comment pm_review_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_review_comment
    ADD CONSTRAINT pm_review_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4174 (class 2606 OID 221529)
-- Name: pm_specification pm_specification_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_specification
    ADD CONSTRAINT pm_specification_pkey PRIMARY KEY (id);


--
-- TOC entry 4188 (class 2606 OID 221647)
-- Name: pm_task_assignee pm_task_assignee_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task_assignee
    ADD CONSTRAINT pm_task_assignee_pkey PRIMARY KEY (id);


--
-- TOC entry 4186 (class 2606 OID 221629)
-- Name: pm_task_dependency pm_task_dependency_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task_dependency
    ADD CONSTRAINT pm_task_dependency_pkey PRIMARY KEY (id);


--
-- TOC entry 4184 (class 2606 OID 221611)
-- Name: pm_task pm_task_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task
    ADD CONSTRAINT pm_task_pkey PRIMARY KEY (id);


--
-- TOC entry 4202 (class 2606 OID 221726)
-- Name: pm_test_case pm_test_case_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_case
    ADD CONSTRAINT pm_test_case_pkey PRIMARY KEY (id);


--
-- TOC entry 4196 (class 2606 OID 221695)
-- Name: pm_test_plan pm_test_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_plan
    ADD CONSTRAINT pm_test_plan_pkey PRIMARY KEY (id);


--
-- TOC entry 4204 (class 2606 OID 221741)
-- Name: pm_test_result pm_test_result_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_result
    ADD CONSTRAINT pm_test_result_pkey PRIMARY KEY (id);


--
-- TOC entry 4199 (class 2606 OID 221710)
-- Name: pm_test_scenario pm_test_scenario_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_scenario
    ADD CONSTRAINT pm_test_scenario_pkey PRIMARY KEY (id);


--
-- TOC entry 4317 (class 2606 OID 319591)
-- Name: pm_trace_link pm_trace_link_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_trace_link
    ADD CONSTRAINT pm_trace_link_pkey PRIMARY KEY (id);


--
-- TOC entry 4176 (class 2606 OID 221544)
-- Name: pm_usecase pm_usecase_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_usecase
    ADD CONSTRAINT pm_usecase_pkey PRIMARY KEY (id);


--
-- TOC entry 4219 (class 2606 OID 221839)
-- Name: pm_user_manual pm_user_manual_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_user_manual
    ADD CONSTRAINT pm_user_manual_pkey PRIMARY KEY (id);


--
-- TOC entry 4338 (class 2606 OID 532508)
-- Name: pm_user_manual_section pm_user_manual_section_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_user_manual_section
    ADD CONSTRAINT pm_user_manual_section_pkey PRIMARY KEY (id);


--
-- TOC entry 4182 (class 2606 OID 221593)
-- Name: pm_work_package pm_work_package_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_work_package
    ADD CONSTRAINT pm_work_package_pkey PRIMARY KEY (id);


--
-- TOC entry 4259 (class 2606 OID 245780)
-- Name: su_business_invite su_business_invite_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_invite
    ADD CONSTRAINT su_business_invite_pkey PRIMARY KEY (id);


--
-- TOC entry 4340 (class 2606 OID 532538)
-- Name: su_notification su_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_notification
    ADD CONSTRAINT su_notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4144 (class 2606 OID 188427)
-- Name: su_program su_program_pkey; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_program
    ADD CONSTRAINT su_program_pkey PRIMARY KEY (id);


--
-- TOC entry 4265 (class 2606 OID 245807)
-- Name: pm_approval_flow uk_approval_flow_code; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_flow
    ADD CONSTRAINT uk_approval_flow_code UNIQUE (flow_code);


--
-- TOC entry 4160 (class 2606 OID 221211)
-- Name: pm_customer_contract uk_contract_no_per_business; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_contract
    ADD CONSTRAINT uk_contract_no_per_business UNIQUE (business_id, contract_no, is_delete);


--
-- TOC entry 4152 (class 2606 OID 155685)
-- Name: pm_customer uk_pm_customer_code; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer
    ADD CONSTRAINT uk_pm_customer_code UNIQUE (business_id, customer_code);


--
-- TOC entry 4169 (class 2606 OID 221239)
-- Name: pm_customer_project uk_project_code_per_business; Type: CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_project
    ADD CONSTRAINT uk_project_code_per_business UNIQUE (business_id, project_code, is_delete);


--
-- TOC entry 4023 (class 1259 OID 82222)
-- Name: IX_db_country_country_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_country_country_code" ON public.db_country USING btree (country_code);


--
-- TOC entry 4024 (class 1259 OID 82223)
-- Name: IX_db_country_iso_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_country_iso_code" ON public.db_country USING btree (iso_code);


--
-- TOC entry 4076 (class 1259 OID 82224)
-- Name: IX_db_district_district_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_district_district_code" ON public.db_district USING btree (district_code);


--
-- TOC entry 4077 (class 1259 OID 82225)
-- Name: IX_db_district_province_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_db_district_province_id" ON public.db_district USING btree (province_id);


--
-- TOC entry 4067 (class 1259 OID 82226)
-- Name: IX_db_mail_queue_DbMailConfigId; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_db_mail_queue_DbMailConfigId" ON public.db_mail_queue USING btree ("DbMailConfigId");


--
-- TOC entry 4068 (class 1259 OID 82227)
-- Name: IX_db_mail_queue_template_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_db_mail_queue_template_id" ON public.db_mail_queue USING btree (template_id);


--
-- TOC entry 4031 (class 1259 OID 82228)
-- Name: IX_db_mail_template_template_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_mail_template_template_code" ON public.db_mail_template USING btree (template_code);


--
-- TOC entry 4035 (class 1259 OID 82229)
-- Name: IX_db_parameter_module_code_parameter_code_parameter_value; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_parameter_module_code_parameter_code_parameter_value" ON public.db_parameter USING btree (module_code, parameter_code, parameter_value);


--
-- TOC entry 4061 (class 1259 OID 82230)
-- Name: IX_db_province_country_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_db_province_country_id" ON public.db_province USING btree (country_id);


--
-- TOC entry 4062 (class 1259 OID 82231)
-- Name: IX_db_province_province_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_province_province_code" ON public.db_province USING btree (province_code);


--
-- TOC entry 4082 (class 1259 OID 82232)
-- Name: IX_db_sub_district_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_db_sub_district_district_id" ON public.db_sub_district USING btree (district_id);


--
-- TOC entry 4083 (class 1259 OID 82233)
-- Name: IX_db_sub_district_sub_district_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_db_sub_district_sub_district_code" ON public.db_sub_district USING btree (sub_district_code);


--
-- TOC entry 4043 (class 1259 OID 82262)
-- Name: IX_su_business_audit_business_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_audit_business_id" ON public.su_business_audit USING btree (business_id);


--
-- TOC entry 4088 (class 1259 OID 82234)
-- Name: IX_su_business_country_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_country_id" ON public.su_business USING btree (country_id);


--
-- TOC entry 4089 (class 1259 OID 82235)
-- Name: IX_su_business_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_district_id" ON public.su_business USING btree (district_id);


--
-- TOC entry 4090 (class 1259 OID 82236)
-- Name: IX_su_business_province_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_province_id" ON public.su_business USING btree (province_id);


--
-- TOC entry 4104 (class 1259 OID 82240)
-- Name: IX_su_business_role_business_id_role_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_business_role_business_id_role_code" ON public.su_business_role USING btree (business_id, role_code);


--
-- TOC entry 4105 (class 1259 OID 82241)
-- Name: IX_su_business_role_parent_role_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_role_parent_role_id" ON public.su_business_role USING btree (parent_role_id);


--
-- TOC entry 4115 (class 1259 OID 82242)
-- Name: IX_su_business_role_program_business_role_id_program_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_business_role_program_business_role_id_program_id" ON public.su_business_role_program USING btree (business_role_id, program_id);


--
-- TOC entry 4116 (class 1259 OID 82243)
-- Name: IX_su_business_role_program_program_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_role_program_program_id" ON public.su_business_role_program USING btree (program_id);


--
-- TOC entry 4091 (class 1259 OID 82237)
-- Name: IX_su_business_sub_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_sub_district_id" ON public.su_business USING btree (sub_district_id);


--
-- TOC entry 4092 (class 1259 OID 82238)
-- Name: IX_su_business_title_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_business_title_id" ON public.su_business USING btree (title_id);


--
-- TOC entry 4139 (class 1259 OID 82332)
-- Name: IX_su_chat_group_call_participant_log_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_group_call_participant_log_id" ON public.su_chat_group_call_participant USING btree (log_id);


--
-- TOC entry 4132 (class 1259 OID 82318)
-- Name: IX_su_chat_group_log_attachment_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_group_log_attachment_id" ON public.su_chat_group_log USING btree (attachment_id);


--
-- TOC entry 4133 (class 1259 OID 82319)
-- Name: IX_su_chat_group_log_group_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_group_log_group_id" ON public.su_chat_group_log USING btree (group_id);


--
-- TOC entry 4136 (class 1259 OID 82320)
-- Name: IX_su_chat_group_member_group_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_group_member_group_id" ON public.su_chat_group_member USING btree (group_id);


--
-- TOC entry 4125 (class 1259 OID 82282)
-- Name: IX_su_chat_log_attachment_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_log_attachment_id" ON public.su_chat_log USING btree (attachment_id);


--
-- TOC entry 4126 (class 1259 OID 82283)
-- Name: IX_su_chat_log_business_id_sender_id_receiver_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_chat_log_business_id_sender_id_receiver_id" ON public.su_chat_log USING btree (business_id, sender_id, receiver_id);


--
-- TOC entry 4046 (class 1259 OID 82244)
-- Name: IX_su_message_module_code_program_code_message_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_message_module_code_program_code_message_code" ON public.su_message USING btree (module_code, program_code, message_code);


--
-- TOC entry 4095 (class 1259 OID 82245)
-- Name: IX_su_profile_country_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_profile_country_id" ON public.su_profile USING btree (country_id);


--
-- TOC entry 4096 (class 1259 OID 82246)
-- Name: IX_su_profile_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_profile_district_id" ON public.su_profile USING btree (district_id);


--
-- TOC entry 4097 (class 1259 OID 82247)
-- Name: IX_su_profile_province_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_profile_province_id" ON public.su_profile USING btree (province_id);


--
-- TOC entry 4098 (class 1259 OID 82248)
-- Name: IX_su_profile_sub_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_profile_sub_district_id" ON public.su_profile USING btree (sub_district_id);


--
-- TOC entry 4099 (class 1259 OID 82249)
-- Name: IX_su_profile_title_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_profile_title_id" ON public.su_profile USING btree (title_id);


--
-- TOC entry 4100 (class 1259 OID 82250)
-- Name: IX_su_profile_user_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_profile_user_id" ON public.su_profile USING btree (user_id);


--
-- TOC entry 4052 (class 1259 OID 82253)
-- Name: IX_su_upload_bucket_name; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_upload_bucket_name" ON public.su_upload USING btree (bucket_name);


--
-- TOC entry 4053 (class 1259 OID 82254)
-- Name: IX_su_upload_object_key; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_upload_object_key" ON public.su_upload USING btree (object_key);


--
-- TOC entry 4110 (class 1259 OID 82255)
-- Name: IX_su_user_business_business_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_user_business_business_id" ON public.su_user_business USING btree (business_id);


--
-- TOC entry 4120 (class 1259 OID 82257)
-- Name: IX_su_user_business_role_business_role_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_user_business_role_business_role_id" ON public.su_user_business_role USING btree (business_role_id);


--
-- TOC entry 4121 (class 1259 OID 82258)
-- Name: IX_su_user_business_role_user_business_id_business_role_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_user_business_role_user_business_id_business_role_id" ON public.su_user_business_role USING btree (user_business_id, business_role_id);


--
-- TOC entry 4111 (class 1259 OID 82256)
-- Name: IX_su_user_business_user_id_business_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX "IX_su_user_business_user_id_business_id" ON public.su_user_business USING btree (user_id, business_id);


--
-- TOC entry 4073 (class 1259 OID 82259)
-- Name: IX_su_user_task_task_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX "IX_su_user_task_task_id" ON public.su_user_task USING btree (task_id);


--
-- TOC entry 4294 (class 1259 OID 294930)
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- TOC entry 4270 (class 1259 OID 245864)
-- Name: idx_approval_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_business ON public.pm_approval USING btree (business_id);


--
-- TOC entry 4271 (class 1259 OID 245866)
-- Name: idx_approval_current_step; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_current_step ON public.pm_approval USING btree (current_step_id);


--
-- TOC entry 4272 (class 1259 OID 245861)
-- Name: idx_approval_document; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_document ON public.pm_approval USING btree (document_type, document_id);


--
-- TOC entry 4273 (class 1259 OID 245865)
-- Name: idx_approval_flow; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_flow ON public.pm_approval USING btree (flow_id);


--
-- TOC entry 4274 (class 1259 OID 245863)
-- Name: idx_approval_requested_by; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_requested_by ON public.pm_approval USING btree (requested_by);


--
-- TOC entry 4275 (class 1259 OID 245862)
-- Name: idx_approval_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_approval_status ON public.pm_approval USING btree (status);


--
-- TOC entry 4251 (class 1259 OID 532586)
-- Name: idx_audit_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_audit_business ON public.su_audit_log USING btree (business_id);


--
-- TOC entry 4252 (class 1259 OID 532585)
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_audit_created ON public.su_audit_log USING btree (created_date DESC);


--
-- TOC entry 4253 (class 1259 OID 222039)
-- Name: idx_audit_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_audit_target ON public.su_audit_log USING btree (target_type, target_id);


--
-- TOC entry 4254 (class 1259 OID 222040)
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_audit_user ON public.su_audit_log USING btree (user_id);


--
-- TOC entry 4056 (class 1259 OID 221326)
-- Name: idx_bucket_name; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_bucket_name ON public.su_upload USING btree (bucket_name);


--
-- TOC entry 4108 (class 1259 OID 221320)
-- Name: idx_business_role_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_business_role_code ON public.su_business_role USING btree (business_id, role_code);


--
-- TOC entry 4119 (class 1259 OID 221321)
-- Name: idx_business_role_program; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_business_role_program ON public.su_business_role_program USING btree (business_role_id, program_id);


--
-- TOC entry 4129 (class 1259 OID 221328)
-- Name: idx_business_sender_receiver; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_business_sender_receiver ON public.su_chat_log USING btree (business_id, sender_id, receiver_id);


--
-- TOC entry 4333 (class 1259 OID 450593)
-- Name: idx_change_impact_analysis_cr; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_change_impact_analysis_cr ON public.pm_change_impact_analysis USING btree (change_request_id);


--
-- TOC entry 4334 (class 1259 OID 450594)
-- Name: idx_change_impact_analysis_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_change_impact_analysis_status ON public.pm_change_impact_analysis USING btree (analysis_status);


--
-- TOC entry 4306 (class 1259 OID 294988)
-- Name: idx_chat_diagram; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_chat_diagram ON public.pm_diagram_chat USING btree (diagram_id);


--
-- TOC entry 4307 (class 1259 OID 294989)
-- Name: idx_chat_user; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_chat_user ON public.pm_diagram_chat USING btree (user_id);


--
-- TOC entry 4236 (class 1259 OID 335889)
-- Name: idx_comment_parent; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_comment_parent ON public.pm_comment USING btree (parent_comment_id);


--
-- TOC entry 4237 (class 1259 OID 221992)
-- Name: idx_comment_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_comment_target ON public.pm_comment USING btree (target_type, target_id);


--
-- TOC entry 4238 (class 1259 OID 335890)
-- Name: idx_comment_target_parent_null; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_comment_target_parent_null ON public.pm_comment USING btree (target_type, target_id) WHERE ((parent_comment_id IS NULL) AND (is_delete = false));


--
-- TOC entry 4153 (class 1259 OID 221218)
-- Name: idx_contract_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_contract_business ON public.pm_customer_contract USING btree (business_id);


--
-- TOC entry 4154 (class 1259 OID 221217)
-- Name: idx_contract_customer; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_contract_customer ON public.pm_customer_contract USING btree (customer_id);


--
-- TOC entry 4155 (class 1259 OID 221219)
-- Name: idx_contract_sign_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_contract_sign_status ON public.pm_customer_contract USING btree (sign_status);


--
-- TOC entry 4027 (class 1259 OID 221308)
-- Name: idx_country_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_country_code ON public.db_country USING btree (country_code);


--
-- TOC entry 4326 (class 1259 OID 409736)
-- Name: idx_cr_assignee_request; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_cr_assignee_request ON public.pm_cr_assignee USING btree (change_request_id);


--
-- TOC entry 4327 (class 1259 OID 409737)
-- Name: idx_cr_assignee_user; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_cr_assignee_user ON public.pm_cr_assignee USING btree (user_id);


--
-- TOC entry 4330 (class 1259 OID 409757)
-- Name: idx_cr_impact_request; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_cr_impact_request ON public.pm_change_impact USING btree (change_request_id);


--
-- TOC entry 4318 (class 1259 OID 409711)
-- Name: idx_cr_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_cr_status ON public.pm_change_request USING btree (status);


--
-- TOC entry 4319 (class 1259 OID 409710)
-- Name: idx_cr_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_cr_target ON public.pm_change_request USING btree (target_type, target_id);


--
-- TOC entry 4189 (class 1259 OID 589841)
-- Name: idx_design_review_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_design_review_code ON public.pm_design_review USING btree (review_code);


--
-- TOC entry 4190 (class 1259 OID 589840)
-- Name: idx_design_review_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_design_review_project ON public.pm_design_review USING btree (project_id);


--
-- TOC entry 4295 (class 1259 OID 294983)
-- Name: idx_diagram_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_business ON public.pm_diagram USING btree (business_id);


--
-- TOC entry 4296 (class 1259 OID 294986)
-- Name: idx_diagram_graph; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_graph ON public.pm_diagram USING gin (graph_data);


--
-- TOC entry 4297 (class 1259 OID 294985)
-- Name: idx_diagram_metadata; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_metadata ON public.pm_diagram USING gin (metadata);


--
-- TOC entry 4298 (class 1259 OID 295003)
-- Name: idx_diagram_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_project ON public.pm_diagram USING btree (project_id);


--
-- TOC entry 4299 (class 1259 OID 294984)
-- Name: idx_diagram_type; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_type ON public.pm_diagram USING btree (diagram_type);


--
-- TOC entry 4300 (class 1259 OID 294982)
-- Name: idx_diagram_user; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_diagram_user ON public.pm_diagram USING btree (user_id);


--
-- TOC entry 4080 (class 1259 OID 221312)
-- Name: idx_district_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_district_code ON public.db_district USING btree (district_code);


--
-- TOC entry 4081 (class 1259 OID 221313)
-- Name: idx_district_province_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_district_province_id ON public.db_district USING btree (province_id);


--
-- TOC entry 4260 (class 1259 OID 245809)
-- Name: idx_flow_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_flow_business ON public.pm_approval_flow USING btree (business_id);


--
-- TOC entry 4261 (class 1259 OID 245808)
-- Name: idx_flow_document_type; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_flow_document_type ON public.pm_approval_flow USING btree (document_type);


--
-- TOC entry 4257 (class 1259 OID 245791)
-- Name: idx_invite_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_invite_business ON public.su_business_invite USING btree (business_id);


--
-- TOC entry 4028 (class 1259 OID 221309)
-- Name: idx_iso_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_iso_code ON public.db_country USING btree (iso_code);


--
-- TOC entry 4283 (class 1259 OID 245918)
-- Name: idx_log_action; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_log_action ON public.pm_approval_log USING btree (action);


--
-- TOC entry 4284 (class 1259 OID 245917)
-- Name: idx_log_actor; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_log_actor ON public.pm_approval_log USING btree (actor);


--
-- TOC entry 4285 (class 1259 OID 245916)
-- Name: idx_log_approval; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_log_approval ON public.pm_approval_log USING btree (approval_id);


--
-- TOC entry 4071 (class 1259 OID 221319)
-- Name: idx_mail_queue_config; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_mail_queue_config ON public.db_mail_queue USING btree ("DbMailConfigId");


--
-- TOC entry 4072 (class 1259 OID 221318)
-- Name: idx_mail_queue_template; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_mail_queue_template ON public.db_mail_queue USING btree (template_id);


--
-- TOC entry 4038 (class 1259 OID 221316)
-- Name: idx_module_param_value; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_module_param_value ON public.db_parameter USING btree (module_code, parameter_code, parameter_value);


--
-- TOC entry 4049 (class 1259 OID 221329)
-- Name: idx_module_program_message; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_module_program_message ON public.su_message USING btree (module_code, program_code, message_code);


--
-- TOC entry 4248 (class 1259 OID 222028)
-- Name: idx_notification_receiver; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_notification_receiver ON public.pm_notification USING btree (receiver_id);


--
-- TOC entry 4057 (class 1259 OID 221327)
-- Name: idx_object_key; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_object_key ON public.su_upload USING btree (object_key);


--
-- TOC entry 4205 (class 1259 OID 532520)
-- Name: idx_pm_bug_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_bug_project ON public.pm_bug USING btree (project_id);


--
-- TOC entry 4145 (class 1259 OID 155701)
-- Name: idx_pm_customer_business_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_customer_business_id ON public.pm_customer USING btree (business_id);


--
-- TOC entry 4146 (class 1259 OID 155704)
-- Name: idx_pm_customer_company_name_en; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_customer_company_name_en ON public.pm_customer USING btree (company_name_en);


--
-- TOC entry 4156 (class 1259 OID 647249)
-- Name: idx_pm_customer_contract_parent; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_customer_contract_parent ON public.pm_customer_contract USING btree (parent_contract_id);


--
-- TOC entry 4147 (class 1259 OID 155703)
-- Name: idx_pm_customer_customer_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_customer_customer_code ON public.pm_customer USING btree (customer_code);


--
-- TOC entry 4148 (class 1259 OID 155702)
-- Name: idx_pm_customer_is_active; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_customer_is_active ON public.pm_customer USING btree (is_active);


--
-- TOC entry 4341 (class 1259 OID 573481)
-- Name: idx_pm_delivery_item_delivery; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_delivery_item_delivery ON public.pm_delivery_item USING btree (delivery_id);


--
-- TOC entry 4342 (class 1259 OID 573482)
-- Name: idx_pm_delivery_item_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_delivery_item_target ON public.pm_delivery_item USING btree (item_type, item_id);


--
-- TOC entry 4212 (class 1259 OID 532489)
-- Name: idx_pm_delivery_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_delivery_project ON public.pm_delivery USING btree (project_id, business_id);


--
-- TOC entry 4347 (class 1259 OID 819244)
-- Name: idx_pm_diagram_sql_history_created_at; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_diagram_sql_history_created_at ON public.pm_diagram_sql_history USING btree (created_at DESC);


--
-- TOC entry 4348 (class 1259 OID 819243)
-- Name: idx_pm_diagram_sql_history_tab_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_diagram_sql_history_tab_id ON public.pm_diagram_sql_history USING btree (tab_id);


--
-- TOC entry 4241 (class 1259 OID 532493)
-- Name: idx_pm_document_version_approval_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_document_version_approval_status ON public.pm_document_version USING btree (approval_status);


--
-- TOC entry 4242 (class 1259 OID 532492)
-- Name: idx_pm_document_version_document; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_document_version_document ON public.pm_document_version USING btree (document_type, document_id);


--
-- TOC entry 4243 (class 1259 OID 532494)
-- Name: idx_pm_document_version_previous; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_document_version_previous ON public.pm_document_version USING btree (previous_version_id);


--
-- TOC entry 4244 (class 1259 OID 532491)
-- Name: idx_pm_document_version_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_document_version_project ON public.pm_document_version USING btree (project_id);


--
-- TOC entry 4200 (class 1259 OID 532521)
-- Name: idx_pm_test_case_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_test_case_project ON public.pm_test_case USING btree (project_id);


--
-- TOC entry 4197 (class 1259 OID 532522)
-- Name: idx_pm_test_scenario_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_test_scenario_project ON public.pm_test_scenario USING btree (project_id);


--
-- TOC entry 4217 (class 1259 OID 532519)
-- Name: idx_pm_user_manual_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_pm_user_manual_project ON public.pm_user_manual USING btree (project_id, business_id);


--
-- TOC entry 4142 (class 1259 OID 221325)
-- Name: idx_program_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_program_code ON public.su_program USING btree (program_code);


--
-- TOC entry 4161 (class 1259 OID 221252)
-- Name: idx_project_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_project_business ON public.pm_customer_project USING btree (business_id);


--
-- TOC entry 4162 (class 1259 OID 221251)
-- Name: idx_project_contract; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_project_contract ON public.pm_customer_project USING btree (contract_id);


--
-- TOC entry 4163 (class 1259 OID 221250)
-- Name: idx_project_customer; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_project_customer ON public.pm_customer_project USING btree (customer_id);


--
-- TOC entry 4164 (class 1259 OID 221254)
-- Name: idx_project_priority; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_project_priority ON public.pm_customer_project USING btree (priority);


--
-- TOC entry 4165 (class 1259 OID 221253)
-- Name: idx_project_status; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_project_status ON public.pm_customer_project USING btree (status);


--
-- TOC entry 4065 (class 1259 OID 221310)
-- Name: idx_province_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_province_code ON public.db_province USING btree (province_code);


--
-- TOC entry 4066 (class 1259 OID 221311)
-- Name: idx_province_country_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_province_country_id ON public.db_province USING btree (country_id);


--
-- TOC entry 4288 (class 1259 OID 245944)
-- Name: idx_reminder_approval; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_reminder_approval ON public.pm_approval_reminder USING btree (approval_id);


--
-- TOC entry 4289 (class 1259 OID 245945)
-- Name: idx_reminder_recipient; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_reminder_recipient ON public.pm_approval_reminder USING btree (recipient);


--
-- TOC entry 4322 (class 1259 OID 409713)
-- Name: idx_session_active; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_session_active ON public.pm_edit_session USING btree (is_active);


--
-- TOC entry 4058 (class 1259 OID 352280)
-- Name: idx_session_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_session_id ON public.su_upload USING btree (session_id);


--
-- TOC entry 4323 (class 1259 OID 409712)
-- Name: idx_session_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_session_target ON public.pm_edit_session USING btree (target_type, target_id);


--
-- TOC entry 4172 (class 1259 OID 335888)
-- Name: idx_spec_requirement; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_spec_requirement ON public.pm_specification USING btree (requirement_id);


--
-- TOC entry 4266 (class 1259 OID 245829)
-- Name: idx_step_flow; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_step_flow ON public.pm_approval_flow_step USING btree (flow_id, step_order);


--
-- TOC entry 4267 (class 1259 OID 245830)
-- Name: idx_step_role; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_step_role ON public.pm_approval_flow_step USING btree (approver_role);


--
-- TOC entry 4278 (class 1259 OID 245891)
-- Name: idx_step_status_approval; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_step_status_approval ON public.pm_approval_step_status USING btree (approval_id);


--
-- TOC entry 4279 (class 1259 OID 245893)
-- Name: idx_step_status_approver; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_step_status_approver ON public.pm_approval_step_status USING btree (approver);


--
-- TOC entry 4280 (class 1259 OID 245892)
-- Name: idx_step_status_step; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_step_status_step ON public.pm_approval_step_status USING btree (step_id);


--
-- TOC entry 4086 (class 1259 OID 221314)
-- Name: idx_sub_district_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_sub_district_code ON public.db_sub_district USING btree (sub_district_code);


--
-- TOC entry 4087 (class 1259 OID 221315)
-- Name: idx_sub_district_district_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_sub_district_district_id ON public.db_sub_district USING btree (district_id);


--
-- TOC entry 4034 (class 1259 OID 221317)
-- Name: idx_template_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_template_code ON public.db_mail_template USING btree (template_code);


--
-- TOC entry 4310 (class 1259 OID 319594)
-- Name: idx_trace_project; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_project ON public.pm_trace_link USING btree (project_id);


--
-- TOC entry 4311 (class 1259 OID 319595)
-- Name: idx_trace_relationship; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_relationship ON public.pm_trace_link USING btree (relationship_type);


--
-- TOC entry 4312 (class 1259 OID 319592)
-- Name: idx_trace_source; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_source ON public.pm_trace_link USING btree (source_type, source_id);


--
-- TOC entry 4313 (class 1259 OID 385226)
-- Name: idx_trace_source_type_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_source_type_id ON public.pm_trace_link USING btree (source_type, source_id);


--
-- TOC entry 4314 (class 1259 OID 319593)
-- Name: idx_trace_target; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_target ON public.pm_trace_link USING btree (target_type, target_id);


--
-- TOC entry 4315 (class 1259 OID 385227)
-- Name: idx_trace_target_type_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_trace_target_type_id ON public.pm_trace_link USING btree (target_type, target_id);


--
-- TOC entry 4114 (class 1259 OID 221322)
-- Name: idx_user_business; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_user_business ON public.su_user_business USING btree (user_id, business_id);


--
-- TOC entry 4124 (class 1259 OID 221323)
-- Name: idx_user_business_role; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_user_business_role ON public.su_user_business_role USING btree (user_business_id, business_role_id);


--
-- TOC entry 4103 (class 1259 OID 221324)
-- Name: idx_user_id; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX idx_user_id ON public.su_profile USING btree (user_id);


--
-- TOC entry 4303 (class 1259 OID 294987)
-- Name: idx_version_diagram; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_version_diagram ON public.pm_diagram_versions USING btree (diagram_id);


--
-- TOC entry 4245 (class 1259 OID 222016)
-- Name: idx_version_document; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE INDEX idx_version_document ON public.pm_document_version USING btree (document_type, document_id);


--
-- TOC entry 4109 (class 1259 OID 188425)
-- Name: ix_su_business_role_business_id_role_code; Type: INDEX; Schema: public; Owner: sic-app
--

CREATE UNIQUE INDEX ix_su_business_role_business_id_role_code ON public.su_business_role USING btree (business_id, role_code) WHERE (is_delete = false);


--
-- TOC entry 4356 (class 2606 OID 82072)
-- Name: db_district FK_db_district_db_province_province_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_district
    ADD CONSTRAINT "FK_db_district_db_province_province_id" FOREIGN KEY (province_id) REFERENCES public.db_province(id) ON DELETE CASCADE;


--
-- TOC entry 4353 (class 2606 OID 82043)
-- Name: db_mail_queue FK_db_mail_queue_db_mail_config_DbMailConfigId; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_mail_queue
    ADD CONSTRAINT "FK_db_mail_queue_db_mail_config_DbMailConfigId" FOREIGN KEY ("DbMailConfigId") REFERENCES public.db_mail_config(id);


--
-- TOC entry 4354 (class 2606 OID 82048)
-- Name: db_mail_queue FK_db_mail_queue_db_mail_template_template_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_mail_queue
    ADD CONSTRAINT "FK_db_mail_queue_db_mail_template_template_id" FOREIGN KEY (template_id) REFERENCES public.db_mail_template(id) ON DELETE CASCADE;


--
-- TOC entry 4352 (class 2606 OID 82031)
-- Name: db_province FK_db_province_db_country_country_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_province
    ADD CONSTRAINT "FK_db_province_db_country_country_id" FOREIGN KEY (country_id) REFERENCES public.db_country(id) ON DELETE CASCADE;


--
-- TOC entry 4357 (class 2606 OID 82084)
-- Name: db_sub_district FK_db_sub_district_db_district_district_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.db_sub_district
    ADD CONSTRAINT "FK_db_sub_district_db_district_district_id" FOREIGN KEY (district_id) REFERENCES public.db_district(id) ON DELETE CASCADE;


--
-- TOC entry 4351 (class 2606 OID 82263)
-- Name: su_business_audit FK_su_business_audit_su_business_business_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_audit
    ADD CONSTRAINT "FK_su_business_audit_su_business_business_id" FOREIGN KEY (business_id) REFERENCES public.su_business(id) ON DELETE CASCADE;


--
-- TOC entry 4358 (class 2606 OID 82096)
-- Name: su_business FK_su_business_db_country_country_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "FK_su_business_db_country_country_id" FOREIGN KEY (country_id) REFERENCES public.db_country(id) ON DELETE CASCADE;


--
-- TOC entry 4359 (class 2606 OID 82101)
-- Name: su_business FK_su_business_db_district_district_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "FK_su_business_db_district_district_id" FOREIGN KEY (district_id) REFERENCES public.db_district(id);


--
-- TOC entry 4360 (class 2606 OID 82106)
-- Name: su_business FK_su_business_db_province_province_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "FK_su_business_db_province_province_id" FOREIGN KEY (province_id) REFERENCES public.db_province(id);


--
-- TOC entry 4361 (class 2606 OID 82111)
-- Name: su_business FK_su_business_db_sub_district_sub_district_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "FK_su_business_db_sub_district_sub_district_id" FOREIGN KEY (sub_district_id) REFERENCES public.db_sub_district(id);


--
-- TOC entry 4362 (class 2606 OID 82116)
-- Name: su_business FK_su_business_db_title_title_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business
    ADD CONSTRAINT "FK_su_business_db_title_title_id" FOREIGN KEY (title_id) REFERENCES public.db_title(id) ON DELETE CASCADE;


--
-- TOC entry 4371 (class 2606 OID 82197)
-- Name: su_business_role_program FK_su_business_role_program_su_business_role_business_role_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role_program
    ADD CONSTRAINT "FK_su_business_role_program_su_business_role_business_role_id" FOREIGN KEY (business_role_id) REFERENCES public.su_business_role(id) ON DELETE CASCADE;


--
-- TOC entry 4368 (class 2606 OID 82160)
-- Name: su_business_role FK_su_business_role_su_business_business_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role
    ADD CONSTRAINT "FK_su_business_role_su_business_business_id" FOREIGN KEY (business_id) REFERENCES public.su_business(id) ON DELETE RESTRICT;


--
-- TOC entry 4369 (class 2606 OID 82165)
-- Name: su_business_role FK_su_business_role_su_business_role_parent_role_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role
    ADD CONSTRAINT "FK_su_business_role_su_business_role_parent_role_id" FOREIGN KEY (parent_role_id) REFERENCES public.su_business_role(id) ON DELETE RESTRICT;


--
-- TOC entry 4379 (class 2606 OID 82327)
-- Name: su_chat_group_call_participant FK_su_chat_group_call_participant_su_chat_group_log_log_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_call_participant
    ADD CONSTRAINT "FK_su_chat_group_call_participant_su_chat_group_log_log_id" FOREIGN KEY (log_id) REFERENCES public.su_chat_group_log(id) ON DELETE CASCADE;


--
-- TOC entry 4376 (class 2606 OID 82298)
-- Name: su_chat_group_log FK_su_chat_group_log_su_chat_group_group_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_log
    ADD CONSTRAINT "FK_su_chat_group_log_su_chat_group_group_id" FOREIGN KEY (group_id) REFERENCES public.su_chat_group(id) ON DELETE CASCADE;


--
-- TOC entry 4377 (class 2606 OID 82303)
-- Name: su_chat_group_log FK_su_chat_group_log_su_upload_attachment_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_log
    ADD CONSTRAINT "FK_su_chat_group_log_su_upload_attachment_id" FOREIGN KEY (attachment_id) REFERENCES public.su_upload(id) ON DELETE SET NULL;


--
-- TOC entry 4378 (class 2606 OID 82313)
-- Name: su_chat_group_member FK_su_chat_group_member_su_chat_group_group_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_group_member
    ADD CONSTRAINT "FK_su_chat_group_member_su_chat_group_group_id" FOREIGN KEY (group_id) REFERENCES public.su_chat_group(id) ON DELETE CASCADE;


--
-- TOC entry 4375 (class 2606 OID 82277)
-- Name: su_chat_log FK_su_chat_log_su_upload_attachment_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_chat_log
    ADD CONSTRAINT "FK_su_chat_log_su_upload_attachment_id" FOREIGN KEY (attachment_id) REFERENCES public.su_upload(id) ON DELETE SET NULL;


--
-- TOC entry 4363 (class 2606 OID 82128)
-- Name: su_profile FK_su_profile_db_country_country_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "FK_su_profile_db_country_country_id" FOREIGN KEY (country_id) REFERENCES public.db_country(id);


--
-- TOC entry 4364 (class 2606 OID 82133)
-- Name: su_profile FK_su_profile_db_district_district_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "FK_su_profile_db_district_district_id" FOREIGN KEY (district_id) REFERENCES public.db_district(id);


--
-- TOC entry 4365 (class 2606 OID 82138)
-- Name: su_profile FK_su_profile_db_province_province_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "FK_su_profile_db_province_province_id" FOREIGN KEY (province_id) REFERENCES public.db_province(id);


--
-- TOC entry 4366 (class 2606 OID 82143)
-- Name: su_profile FK_su_profile_db_sub_district_sub_district_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "FK_su_profile_db_sub_district_sub_district_id" FOREIGN KEY (sub_district_id) REFERENCES public.db_sub_district(id);


--
-- TOC entry 4367 (class 2606 OID 82148)
-- Name: su_profile FK_su_profile_db_title_title_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_profile
    ADD CONSTRAINT "FK_su_profile_db_title_title_id" FOREIGN KEY (title_id) REFERENCES public.db_title(id) ON DELETE CASCADE;


--
-- TOC entry 4373 (class 2606 OID 82212)
-- Name: su_user_business_role FK_su_user_business_role_su_business_role_business_role_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_business_role
    ADD CONSTRAINT "FK_su_user_business_role_su_business_role_business_role_id" FOREIGN KEY (business_role_id) REFERENCES public.su_business_role(id) ON DELETE CASCADE;


--
-- TOC entry 4374 (class 2606 OID 82217)
-- Name: su_user_business_role FK_su_user_business_role_su_user_business_user_business_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_business_role
    ADD CONSTRAINT "FK_su_user_business_role_su_user_business_user_business_id" FOREIGN KEY (user_business_id) REFERENCES public.su_user_business(id) ON DELETE CASCADE;


--
-- TOC entry 4370 (class 2606 OID 82175)
-- Name: su_user_business FK_su_user_business_su_business_business_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_business
    ADD CONSTRAINT "FK_su_user_business_su_business_business_id" FOREIGN KEY (business_id) REFERENCES public.su_business(id) ON DELETE RESTRICT;


--
-- TOC entry 4355 (class 2606 OID 82060)
-- Name: su_user_task FK_su_user_task_su_task_task_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_user_task
    ADD CONSTRAINT "FK_su_user_task_su_task_task_id" FOREIGN KEY (task_id) REFERENCES public.su_task(id) ON DELETE RESTRICT;


--
-- TOC entry 4426 (class 2606 OID 245856)
-- Name: pm_approval fk_approval_attachment; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval
    ADD CONSTRAINT fk_approval_attachment FOREIGN KEY (attachment_id) REFERENCES public.su_upload(id);


--
-- TOC entry 4427 (class 2606 OID 245851)
-- Name: pm_approval fk_approval_current_step; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval
    ADD CONSTRAINT fk_approval_current_step FOREIGN KEY (current_step_id) REFERENCES public.pm_approval_flow_step(id);


--
-- TOC entry 4428 (class 2606 OID 245846)
-- Name: pm_approval fk_approval_flow; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval
    ADD CONSTRAINT fk_approval_flow FOREIGN KEY (flow_id) REFERENCES public.pm_approval_flow(id);


--
-- TOC entry 4399 (class 2606 OID 221648)
-- Name: pm_task_assignee fk_assignee_task; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task_assignee
    ADD CONSTRAINT fk_assignee_task FOREIGN KEY (task_id) REFERENCES public.pm_task(id);


--
-- TOC entry 4406 (class 2606 OID 221763)
-- Name: pm_bug fk_bug_testcase; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug
    ADD CONSTRAINT fk_bug_testcase FOREIGN KEY (test_case_id) REFERENCES public.pm_test_case(id);


--
-- TOC entry 4408 (class 2606 OID 221794)
-- Name: pm_bug_comment fk_bugcomment_bug; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug_comment
    ADD CONSTRAINT fk_bugcomment_bug FOREIGN KEY (bug_id) REFERENCES public.pm_bug(id);


--
-- TOC entry 4436 (class 2606 OID 294976)
-- Name: pm_diagram_chat fk_chat_diagram; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram_chat
    ADD CONSTRAINT fk_chat_diagram FOREIGN KEY (diagram_id) REFERENCES public.pm_diagram(id) ON DELETE CASCADE;


--
-- TOC entry 4412 (class 2606 OID 221856)
-- Name: pm_delivery_checklist fk_checklist_delivery; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_checklist
    ADD CONSTRAINT fk_checklist_delivery FOREIGN KEY (delivery_id) REFERENCES public.pm_delivery(id);


--
-- TOC entry 4422 (class 2606 OID 221987)
-- Name: pm_comment fk_comment_parent; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_comment
    ADD CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES public.pm_comment(id);


--
-- TOC entry 4420 (class 2606 OID 221952)
-- Name: pm_ma_ticket_comment fk_comment_ticket; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket_comment
    ADD CONSTRAINT fk_comment_ticket FOREIGN KEY (ticket_id) REFERENCES public.pm_ma_ticket(id);


--
-- TOC entry 4383 (class 2606 OID 221212)
-- Name: pm_customer_contract fk_contract_customer; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_contract
    ADD CONSTRAINT fk_contract_customer FOREIGN KEY (customer_id) REFERENCES public.pm_customer(id);


--
-- TOC entry 4409 (class 2606 OID 221810)
-- Name: pm_delivery fk_delivery_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery
    ADD CONSTRAINT fk_delivery_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4397 (class 2606 OID 221635)
-- Name: pm_task_dependency fk_dep_depends_on; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task_dependency
    ADD CONSTRAINT fk_dep_depends_on FOREIGN KEY (depends_on_task_id) REFERENCES public.pm_task(id);


--
-- TOC entry 4398 (class 2606 OID 221630)
-- Name: pm_task_dependency fk_dep_task; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task_dependency
    ADD CONSTRAINT fk_dep_task FOREIGN KEY (task_id) REFERENCES public.pm_task(id);


--
-- TOC entry 4410 (class 2606 OID 221825)
-- Name: pm_delivery_document fk_doc_delivery; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_document
    ADD CONSTRAINT fk_doc_delivery FOREIGN KEY (delivery_id) REFERENCES public.pm_delivery(id);


--
-- TOC entry 4423 (class 2606 OID 245781)
-- Name: su_business_invite fk_invite_business; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_invite
    ADD CONSTRAINT fk_invite_business FOREIGN KEY (business_id) REFERENCES public.su_business(id);


--
-- TOC entry 4424 (class 2606 OID 245786)
-- Name: su_business_invite fk_invite_role; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_invite
    ADD CONSTRAINT fk_invite_role FOREIGN KEY (role_id) REFERENCES public.su_business_role(id);


--
-- TOC entry 4414 (class 2606 OID 221877)
-- Name: pm_invoice fk_invoice_contract; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_invoice
    ADD CONSTRAINT fk_invoice_contract FOREIGN KEY (contract_id) REFERENCES public.pm_customer_contract(id);


--
-- TOC entry 4415 (class 2606 OID 221872)
-- Name: pm_invoice fk_invoice_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_invoice
    ADD CONSTRAINT fk_invoice_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4416 (class 2606 OID 221892)
-- Name: pm_invoice_item fk_invoiceitem_invoice; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_invoice_item
    ADD CONSTRAINT fk_invoiceitem_invoice FOREIGN KEY (invoice_id) REFERENCES public.pm_invoice(id);


--
-- TOC entry 4431 (class 2606 OID 245906)
-- Name: pm_approval_log fk_log_approval; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_log
    ADD CONSTRAINT fk_log_approval FOREIGN KEY (approval_id) REFERENCES public.pm_approval(id);


--
-- TOC entry 4432 (class 2606 OID 245911)
-- Name: pm_approval_log fk_log_step_status; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_log
    ADD CONSTRAINT fk_log_step_status FOREIGN KEY (step_status_id) REFERENCES public.pm_approval_step_status(id);


--
-- TOC entry 4418 (class 2606 OID 221921)
-- Name: pm_ma_contract fk_ma_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_contract
    ADD CONSTRAINT fk_ma_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4445 (class 2606 OID 729200)
-- Name: pm_ma_ticket_assignee fk_ma_ticket_assignee_ticket; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket_assignee
    ADD CONSTRAINT fk_ma_ticket_assignee_ticket FOREIGN KEY (ma_ticket_id) REFERENCES public.pm_ma_ticket(id);


--
-- TOC entry 4411 (class 2606 OID 221840)
-- Name: pm_user_manual fk_manual_delivery; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_user_manual
    ADD CONSTRAINT fk_manual_delivery FOREIGN KEY (delivery_id) REFERENCES public.pm_delivery(id);


--
-- TOC entry 4393 (class 2606 OID 221578)
-- Name: pm_milestone fk_milestone_phase; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_milestone
    ADD CONSTRAINT fk_milestone_phase FOREIGN KEY (phase_id) REFERENCES public.pm_phase(id);


--
-- TOC entry 4394 (class 2606 OID 221594)
-- Name: pm_work_package fk_package_milestone; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_work_package
    ADD CONSTRAINT fk_package_milestone FOREIGN KEY (milestone_id) REFERENCES public.pm_milestone(id);


--
-- TOC entry 4417 (class 2606 OID 221907)
-- Name: pm_payment fk_payment_invoice; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_payment
    ADD CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES public.pm_invoice(id);


--
-- TOC entry 4392 (class 2606 OID 221562)
-- Name: pm_phase fk_phase_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_phase
    ADD CONSTRAINT fk_phase_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4380 (class 2606 OID 155691)
-- Name: pm_customer fk_pm_customer_district; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer
    ADD CONSTRAINT fk_pm_customer_district FOREIGN KEY (district_id) REFERENCES public.db_district(id);


--
-- TOC entry 4381 (class 2606 OID 155686)
-- Name: pm_customer fk_pm_customer_province; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer
    ADD CONSTRAINT fk_pm_customer_province FOREIGN KEY (province_id) REFERENCES public.db_province(id);


--
-- TOC entry 4382 (class 2606 OID 155696)
-- Name: pm_customer fk_pm_customer_sub_district; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer
    ADD CONSTRAINT fk_pm_customer_sub_district FOREIGN KEY (sub_district_id) REFERENCES public.db_sub_district(id);


--
-- TOC entry 4386 (class 2606 OID 221245)
-- Name: pm_customer_project fk_project_contract; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_project
    ADD CONSTRAINT fk_project_contract FOREIGN KEY (contract_id) REFERENCES public.pm_customer_contract(id);


--
-- TOC entry 4387 (class 2606 OID 221240)
-- Name: pm_customer_project fk_project_customer; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_project
    ADD CONSTRAINT fk_project_customer FOREIGN KEY (customer_id) REFERENCES public.pm_customer(id);


--
-- TOC entry 4433 (class 2606 OID 245934)
-- Name: pm_approval_reminder fk_reminder_approval; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_reminder
    ADD CONSTRAINT fk_reminder_approval FOREIGN KEY (approval_id) REFERENCES public.pm_approval(id);


--
-- TOC entry 4434 (class 2606 OID 245939)
-- Name: pm_approval_reminder fk_reminder_step_status; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_reminder
    ADD CONSTRAINT fk_reminder_step_status FOREIGN KEY (step_status_id) REFERENCES public.pm_approval_step_status(id);


--
-- TOC entry 4421 (class 2606 OID 221968)
-- Name: pm_ma_renewal fk_renewal_ma; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_renewal
    ADD CONSTRAINT fk_renewal_ma FOREIGN KEY (contract_id) REFERENCES public.pm_ma_contract(id);


--
-- TOC entry 4388 (class 2606 OID 221343)
-- Name: pm_requirement fk_req_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_requirement
    ADD CONSTRAINT fk_req_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4407 (class 2606 OID 221779)
-- Name: pm_bug_retest_plan fk_retest_bug; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_bug_retest_plan
    ADD CONSTRAINT fk_retest_bug FOREIGN KEY (bug_id) REFERENCES public.pm_bug(id);


--
-- TOC entry 4401 (class 2606 OID 221680)
-- Name: pm_review_comment fk_review_comment_review; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_review_comment
    ADD CONSTRAINT fk_review_comment_review FOREIGN KEY (review_id) REFERENCES public.pm_design_review(id);


--
-- TOC entry 4400 (class 2606 OID 221664)
-- Name: pm_design_review fk_review_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_design_review
    ADD CONSTRAINT fk_review_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4403 (class 2606 OID 221711)
-- Name: pm_test_scenario fk_scenario_plan; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_scenario
    ADD CONSTRAINT fk_scenario_plan FOREIGN KEY (test_plan_id) REFERENCES public.pm_test_plan(id);


--
-- TOC entry 4389 (class 2606 OID 221530)
-- Name: pm_specification fk_spec_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_specification
    ADD CONSTRAINT fk_spec_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4390 (class 2606 OID 335883)
-- Name: pm_specification fk_spec_requirement; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_specification
    ADD CONSTRAINT fk_spec_requirement FOREIGN KEY (requirement_id) REFERENCES public.pm_requirement(id);


--
-- TOC entry 4425 (class 2606 OID 245824)
-- Name: pm_approval_flow_step fk_step_flow; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_flow_step
    ADD CONSTRAINT fk_step_flow FOREIGN KEY (flow_id) REFERENCES public.pm_approval_flow(id);


--
-- TOC entry 4429 (class 2606 OID 245881)
-- Name: pm_approval_step_status fk_step_status_approval; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_step_status
    ADD CONSTRAINT fk_step_status_approval FOREIGN KEY (approval_id) REFERENCES public.pm_approval(id);


--
-- TOC entry 4430 (class 2606 OID 245886)
-- Name: pm_approval_step_status fk_step_status_step; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_approval_step_status
    ADD CONSTRAINT fk_step_status_step FOREIGN KEY (step_id) REFERENCES public.pm_approval_flow_step(id);


--
-- TOC entry 4372 (class 2606 OID 188428)
-- Name: su_business_role_program fk_su_business_role_program_program_id; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.su_business_role_program
    ADD CONSTRAINT fk_su_business_role_program_program_id FOREIGN KEY (program_id) REFERENCES public.su_program(id);


--
-- TOC entry 4395 (class 2606 OID 221612)
-- Name: pm_task fk_task_package; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task
    ADD CONSTRAINT fk_task_package FOREIGN KEY (work_package_id) REFERENCES public.pm_work_package(id);


--
-- TOC entry 4396 (class 2606 OID 221617)
-- Name: pm_task fk_task_spec; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_task
    ADD CONSTRAINT fk_task_spec FOREIGN KEY (spec_id) REFERENCES public.pm_specification(id);


--
-- TOC entry 4404 (class 2606 OID 221727)
-- Name: pm_test_case fk_testcase_scenario; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_case
    ADD CONSTRAINT fk_testcase_scenario FOREIGN KEY (scenario_id) REFERENCES public.pm_test_scenario(id);


--
-- TOC entry 4402 (class 2606 OID 221696)
-- Name: pm_test_plan fk_testplan_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_plan
    ADD CONSTRAINT fk_testplan_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4405 (class 2606 OID 221742)
-- Name: pm_test_result fk_testresult_case; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_test_result
    ADD CONSTRAINT fk_testresult_case FOREIGN KEY (test_case_id) REFERENCES public.pm_test_case(id);


--
-- TOC entry 4419 (class 2606 OID 221937)
-- Name: pm_ma_ticket fk_ticket_ma; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_ma_ticket
    ADD CONSTRAINT fk_ticket_ma FOREIGN KEY (ma_contract_id) REFERENCES public.pm_ma_contract(id);


--
-- TOC entry 4437 (class 2606 OID 319596)
-- Name: pm_trace_link fk_trace_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_trace_link
    ADD CONSTRAINT fk_trace_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4391 (class 2606 OID 221545)
-- Name: pm_usecase fk_usecase_project; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_usecase
    ADD CONSTRAINT fk_usecase_project FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4435 (class 2606 OID 294959)
-- Name: pm_diagram_versions fk_version_diagram; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_diagram_versions
    ADD CONSTRAINT fk_version_diagram FOREIGN KEY (diagram_id) REFERENCES public.pm_diagram(id) ON DELETE CASCADE;


--
-- TOC entry 4442 (class 2606 OID 450588)
-- Name: pm_change_impact_analysis pm_change_impact_analysis_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_impact_analysis
    ADD CONSTRAINT pm_change_impact_analysis_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.pm_change_request(id);


--
-- TOC entry 4441 (class 2606 OID 409752)
-- Name: pm_change_impact pm_change_impact_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_impact
    ADD CONSTRAINT pm_change_impact_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.pm_change_request(id) ON DELETE CASCADE;


--
-- TOC entry 4438 (class 2606 OID 409687)
-- Name: pm_change_request pm_change_request_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_change_request
    ADD CONSTRAINT pm_change_request_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4440 (class 2606 OID 409731)
-- Name: pm_cr_assignee pm_cr_assignee_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_cr_assignee
    ADD CONSTRAINT pm_cr_assignee_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.pm_change_request(id) ON DELETE CASCADE;


--
-- TOC entry 4384 (class 2606 OID 647244)
-- Name: pm_customer_contract pm_customer_contract_parent_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_contract
    ADD CONSTRAINT pm_customer_contract_parent_contract_id_fkey FOREIGN KEY (parent_contract_id) REFERENCES public.pm_customer_contract(id);


--
-- TOC entry 4385 (class 2606 OID 803008)
-- Name: pm_customer_contract pm_customer_contract_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_customer_contract
    ADD CONSTRAINT pm_customer_contract_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.pm_customer_project(id);


--
-- TOC entry 4413 (class 2606 OID 532509)
-- Name: pm_delivery_checklist pm_delivery_checklist_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_checklist
    ADD CONSTRAINT pm_delivery_checklist_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.pm_delivery(id);


--
-- TOC entry 4444 (class 2606 OID 573476)
-- Name: pm_delivery_item pm_delivery_item_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_delivery_item
    ADD CONSTRAINT pm_delivery_item_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.pm_delivery(id) ON DELETE CASCADE;


--
-- TOC entry 4439 (class 2606 OID 409705)
-- Name: pm_edit_session pm_edit_session_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_edit_session
    ADD CONSTRAINT pm_edit_session_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.pm_change_request(id);


--
-- TOC entry 4443 (class 2606 OID 532514)
-- Name: pm_user_manual_section pm_user_manual_section_manual_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sic-app
--

ALTER TABLE ONLY public.pm_user_manual_section
    ADD CONSTRAINT pm_user_manual_section_manual_id_fkey FOREIGN KEY (manual_id) REFERENCES public.pm_user_manual(id);


--
-- TOC entry 4683 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--



--
-- TOC entry 2439 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: administrator
--



--
-- TOC entry 2438 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: administrator
--



-- Completed on 2026-09-10 14:52:00

--
-- PostgreSQL database dump complete
--


