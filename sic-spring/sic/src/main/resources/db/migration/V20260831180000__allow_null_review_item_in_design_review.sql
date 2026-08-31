-- V20260831180000__allow_null_review_item_in_design_review.sql

ALTER TABLE pm_design_review
    ALTER COLUMN review_item_type DROP NOT NULL,
    ALTER COLUMN review_item_id DROP NOT NULL;
