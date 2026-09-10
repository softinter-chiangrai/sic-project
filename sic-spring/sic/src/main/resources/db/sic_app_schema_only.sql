--
-- PostgreSQL database dump
--


-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-09-10 16:51:19

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

DROP TABLE IF EXISTS public.su_verify CASCADE;
DROP TABLE IF EXISTS public.su_user_task CASCADE;
DROP TABLE IF EXISTS public.su_user_business_role CASCADE;
DROP TABLE IF EXISTS public.su_user_business CASCADE;
DROP TABLE IF EXISTS public.su_upload CASCADE;
DROP TABLE IF EXISTS public.su_task CASCADE;
DROP TABLE IF EXISTS public.su_program CASCADE;
DROP TABLE IF EXISTS public.su_profile CASCADE;
DROP TABLE IF EXISTS public.su_notification CASCADE;
DROP TABLE IF EXISTS public.su_message CASCADE;
DROP TABLE IF EXISTS public.su_chat_log CASCADE;
DROP TABLE IF EXISTS public.su_chat_group_member CASCADE;
DROP TABLE IF EXISTS public.su_chat_group_log CASCADE;
DROP TABLE IF EXISTS public.su_chat_group_call_participant CASCADE;
DROP TABLE IF EXISTS public.su_chat_group CASCADE;
DROP TABLE IF EXISTS public.su_business_role_program CASCADE;
DROP TABLE IF EXISTS public.su_business_role CASCADE;
DROP TABLE IF EXISTS public.su_business_invite CASCADE;
DROP TABLE IF EXISTS public.su_business_audit CASCADE;
DROP TABLE IF EXISTS public.su_business CASCADE;
DROP TABLE IF EXISTS public.su_audit_log CASCADE;
DROP TABLE IF EXISTS public.pm_work_package CASCADE;
DROP TABLE IF EXISTS public.pm_user_manual_section CASCADE;
DROP TABLE IF EXISTS public.pm_user_manual CASCADE;
DROP TABLE IF EXISTS public.pm_usecase CASCADE;
DROP TABLE IF EXISTS public.pm_trace_link CASCADE;
DROP TABLE IF EXISTS public.pm_test_scenario CASCADE;
DROP TABLE IF EXISTS public.pm_test_result CASCADE;
DROP TABLE IF EXISTS public.pm_test_plan CASCADE;
DROP TABLE IF EXISTS public.pm_test_case CASCADE;
DROP TABLE IF EXISTS public.pm_task_dependency CASCADE;
DROP TABLE IF EXISTS public.pm_task_assignee CASCADE;
DROP TABLE IF EXISTS public.pm_task CASCADE;
DROP TABLE IF EXISTS public.pm_specification CASCADE;
DROP TABLE IF EXISTS public.pm_review_comment CASCADE;
DROP TABLE IF EXISTS public.pm_requirement CASCADE;
DROP TABLE IF EXISTS public.pm_phase CASCADE;
DROP TABLE IF EXISTS public.pm_payment CASCADE;
DROP TABLE IF EXISTS public.pm_notification CASCADE;
DROP TABLE IF EXISTS public.pm_milestone CASCADE;
DROP TABLE IF EXISTS public.pm_ma_ticket_comment CASCADE;
DROP TABLE IF EXISTS public.pm_ma_ticket_assignee CASCADE;
DROP TABLE IF EXISTS public.pm_ma_ticket CASCADE;
DROP TABLE IF EXISTS public.pm_ma_renewal CASCADE;
DROP TABLE IF EXISTS public.pm_ma_contract CASCADE;
DROP TABLE IF EXISTS public.pm_invoice_item CASCADE;
DROP TABLE IF EXISTS public.pm_invoice CASCADE;
DROP TABLE IF EXISTS public.pm_edit_session CASCADE;
DROP TABLE IF EXISTS public.pm_document_version CASCADE;
DROP TABLE IF EXISTS public.pm_diagram_versions CASCADE;
DROP TABLE IF EXISTS public.pm_diagram_sql_history CASCADE;
DROP TABLE IF EXISTS public.pm_diagram_chat CASCADE;
DROP TABLE IF EXISTS public.pm_diagram CASCADE;
DROP TABLE IF EXISTS public.pm_design_review CASCADE;
DROP TABLE IF EXISTS public.pm_delivery_item CASCADE;
DROP TABLE IF EXISTS public.pm_delivery_document CASCADE;
DROP TABLE IF EXISTS public.pm_delivery_checklist CASCADE;
DROP TABLE IF EXISTS public.pm_delivery CASCADE;
DROP TABLE IF EXISTS public.pm_customer_project CASCADE;
DROP TABLE IF EXISTS public.pm_customer_contract CASCADE;
DROP TABLE IF EXISTS public.pm_customer CASCADE;
DROP TABLE IF EXISTS public.pm_cr_assignee CASCADE;
DROP TABLE IF EXISTS public.pm_comment CASCADE;
DROP TABLE IF EXISTS public.pm_change_request CASCADE;
DROP TABLE IF EXISTS public.pm_change_impact_analysis CASCADE;
DROP TABLE IF EXISTS public.pm_change_impact CASCADE;
DROP TABLE IF EXISTS public.pm_bug_retest_plan CASCADE;
DROP TABLE IF EXISTS public.pm_bug_comment CASCADE;
DROP TABLE IF EXISTS public.pm_bug CASCADE;
DROP TABLE IF EXISTS public.pm_approval_step_status CASCADE;
DROP TABLE IF EXISTS public.pm_approval_reminder CASCADE;
DROP TABLE IF EXISTS public.pm_approval_log CASCADE;
DROP TABLE IF EXISTS public.pm_approval_flow_step CASCADE;
DROP TABLE IF EXISTS public.pm_approval_flow CASCADE;
DROP TABLE IF EXISTS public.pm_approval CASCADE;
DROP TABLE IF EXISTS public.flyway_schema_history CASCADE;
DROP TABLE IF EXISTS public.ex_example CASCADE;
DROP TABLE IF EXISTS public.db_title CASCADE;
DROP TABLE IF EXISTS public.db_sub_district CASCADE;
DROP TABLE IF EXISTS public.db_province CASCADE;
DROP TABLE IF EXISTS public.db_parameter CASCADE;
DROP TABLE IF EXISTS public.db_mail_template CASCADE;
DROP TABLE IF EXISTS public.db_mail_queue CASCADE;
DROP TABLE IF EXISTS public.db_mail_config CASCADE;
DROP TABLE IF EXISTS public.db_district CASCADE;
DROP TABLE IF EXISTS public.db_country CASCADE;
DROP TYPE IF EXISTS public.trace_relationship CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
--
-- TOC entry 2 (class 3079 OID 846741)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3 (class 3079 OID 846778)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 979 (class 1247 OID 846790)
-- Name: trace_relationship; Type: TYPE; Schema: public; Owner: -
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
-- TOC entry 219 (class 1259 OID 846808)
-- Name: db_country; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 220 (class 1259 OID 846814)
-- Name: db_district; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 221 (class 1259 OID 846820)
-- Name: db_mail_config; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 222 (class 1259 OID 846826)
-- Name: db_mail_queue; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 223 (class 1259 OID 846831)
-- Name: db_mail_template; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 224 (class 1259 OID 846837)
-- Name: db_parameter; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 225 (class 1259 OID 846843)
-- Name: db_province; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 226 (class 1259 OID 846849)
-- Name: db_sub_district; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 227 (class 1259 OID 846855)
-- Name: db_title; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 228 (class 1259 OID 846861)
-- Name: ex_example; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 229 (class 1259 OID 846866)
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 230 (class 1259 OID 846872)
-- Name: pm_approval; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 231 (class 1259 OID 846885)
-- Name: pm_approval_flow; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 232 (class 1259 OID 846897)
-- Name: pm_approval_flow_step; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 233 (class 1259 OID 846910)
-- Name: pm_approval_log; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 234 (class 1259 OID 846920)
-- Name: pm_approval_reminder; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 235 (class 1259 OID 846933)
-- Name: pm_approval_step_status; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 236 (class 1259 OID 846945)
-- Name: pm_bug; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 237 (class 1259 OID 846955)
-- Name: pm_bug_comment; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 238 (class 1259 OID 846963)
-- Name: pm_bug_retest_plan; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 239 (class 1259 OID 846972)
-- Name: pm_change_impact; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 240 (class 1259 OID 846984)
-- Name: pm_change_impact_analysis; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 241 (class 1259 OID 846993)
-- Name: pm_change_request; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 242 (class 1259 OID 847006)
-- Name: pm_comment; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 243 (class 1259 OID 847018)
-- Name: pm_cr_assignee; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 244 (class 1259 OID 847028)
-- Name: pm_customer; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 245 (class 1259 OID 847040)
-- Name: pm_customer_contract; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 246 (class 1259 OID 847053)
-- Name: pm_customer_project; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 247 (class 1259 OID 847069)
-- Name: pm_delivery; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 248 (class 1259 OID 847082)
-- Name: pm_delivery_checklist; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 249 (class 1259 OID 847092)
-- Name: pm_delivery_document; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 250 (class 1259 OID 847100)
-- Name: pm_delivery_item; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 251 (class 1259 OID 847112)
-- Name: pm_design_review; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 252 (class 1259 OID 847124)
-- Name: pm_diagram; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 253 (class 1259 OID 847138)
-- Name: pm_diagram_chat; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 254 (class 1259 OID 847148)
-- Name: pm_diagram_sql_history; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 255 (class 1259 OID 847158)
-- Name: pm_diagram_versions; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 256 (class 1259 OID 847168)
-- Name: pm_document_version; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 257 (class 1259 OID 847178)
-- Name: pm_edit_session; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 258 (class 1259 OID 847192)
-- Name: pm_invoice; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 259 (class 1259 OID 847206)
-- Name: pm_invoice_item; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 260 (class 1259 OID 847217)
-- Name: pm_ma_contract; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 261 (class 1259 OID 847224)
-- Name: pm_ma_renewal; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 262 (class 1259 OID 847235)
-- Name: pm_ma_ticket; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 263 (class 1259 OID 847246)
-- Name: pm_ma_ticket_assignee; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 264 (class 1259 OID 847255)
-- Name: pm_ma_ticket_comment; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 265 (class 1259 OID 847263)
-- Name: pm_milestone; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 266 (class 1259 OID 847272)
-- Name: pm_notification; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 267 (class 1259 OID 847281)
-- Name: pm_payment; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 268 (class 1259 OID 847291)
-- Name: pm_phase; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 269 (class 1259 OID 847301)
-- Name: pm_requirement; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 270 (class 1259 OID 847313)
-- Name: pm_review_comment; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 271 (class 1259 OID 847322)
-- Name: pm_specification; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 272 (class 1259 OID 847334)
-- Name: pm_task; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 273 (class 1259 OID 847345)
-- Name: pm_task_assignee; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 274 (class 1259 OID 847351)
-- Name: pm_task_dependency; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 275 (class 1259 OID 847357)
-- Name: pm_test_case; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 276 (class 1259 OID 847367)
-- Name: pm_test_plan; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 277 (class 1259 OID 847376)
-- Name: pm_test_result; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 278 (class 1259 OID 847384)
-- Name: pm_test_scenario; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 279 (class 1259 OID 847393)
-- Name: pm_trace_link; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 280 (class 1259 OID 847402)
-- Name: pm_usecase; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 281 (class 1259 OID 847410)
-- Name: pm_user_manual; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 282 (class 1259 OID 847419)
-- Name: pm_user_manual_section; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 283 (class 1259 OID 847431)
-- Name: pm_work_package; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 284 (class 1259 OID 847440)
-- Name: su_audit_log; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 285 (class 1259 OID 847450)
-- Name: su_business; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 286 (class 1259 OID 847458)
-- Name: su_business_audit; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 287 (class 1259 OID 847464)
-- Name: su_business_invite; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 288 (class 1259 OID 847474)
-- Name: su_business_role; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 289 (class 1259 OID 847480)
-- Name: su_business_role_program; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 290 (class 1259 OID 847490)
-- Name: su_chat_group; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 291 (class 1259 OID 847495)
-- Name: su_chat_group_call_participant; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 292 (class 1259 OID 847498)
-- Name: su_chat_group_log; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 293 (class 1259 OID 847503)
-- Name: su_chat_group_member; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 294 (class 1259 OID 847506)
-- Name: su_chat_log; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 295 (class 1259 OID 847512)
-- Name: su_message; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 296 (class 1259 OID 847517)
-- Name: su_notification; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 297 (class 1259 OID 847527)
-- Name: su_profile; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 298 (class 1259 OID 847532)
-- Name: su_program; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 299 (class 1259 OID 847538)
-- Name: su_task; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 300 (class 1259 OID 847543)
-- Name: su_upload; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 301 (class 1259 OID 847549)
-- Name: su_user_business; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 302 (class 1259 OID 847553)
-- Name: su_user_business_role; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 303 (class 1259 OID 847557)
-- Name: su_user_task; Type: TABLE; Schema: public; Owner: -
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
-- TOC entry 304 (class 1259 OID 847562)
-- Name: su_verify; Type: TABLE; Schema: public; Owner: -
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


-- Completed on 2026-09-10 16:51:20

--
-- PostgreSQL database dump complete
--


