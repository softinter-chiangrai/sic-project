-- V20260922180000__add_profile_business_address_placeholders.sql
-- Add placeholder messages for province, district, sub-district, and zip code in Profile, Business Create, and Business Management pages

DELETE FROM su_message WHERE message_code IN (
    'PROFILE_PROVINCE_PLACEHOLDER',
    'PROFILE_DISTRICT_PLACEHOLDER',
    'PROFILE_SUBDISTRICT_PLACEHOLDER',
    'PROFILE_ZIPCODE_PLACEHOLDER',
    'BUSINESS_CREATE_PROVINCE_PLACEHOLDER',
    'BUSINESS_CREATE_DISTRICT_PLACEHOLDER',
    'BUSINESS_CREATE_SUBDISTRICT_PLACEHOLDER',
    'BUSINESS_CREATE_ZIPCODE_PLACEHOLDER',
    'BURT01_PROVINCE_PLACEHOLDER',
    'BURT01_DISTRICT_PLACEHOLDER',
    'BURT01_SUBDISTRICT_PLACEHOLDER',
    'BURT01_ZIPCODE_PLACEHOLDER'
);

INSERT INTO su_message (
    id,
    module_code,
    program_code,
    message_code,
    message_en,
    message_local,
    created_by,
    created_date,
    updated_by,
    updated_date,
    is_delete
) VALUES
  (gen_random_uuid(), 'COMMON', 'ALL', 'PROFILE_PROVINCE_PLACEHOLDER', 'Select province', 'เลือกจังหวัด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PROFILE_DISTRICT_PLACEHOLDER', 'Select district', 'เลือกอำเภอ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PROFILE_SUBDISTRICT_PLACEHOLDER', 'Select sub-district', 'เลือกตำบล', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PROFILE_ZIPCODE_PLACEHOLDER', 'Zip Code', 'รหัสไปรษณีย์', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BUSINESS_CREATE_PROVINCE_PLACEHOLDER', 'Select province', 'เลือกจังหวัด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BUSINESS_CREATE_DISTRICT_PLACEHOLDER', 'Select district', 'เลือกอำเภอ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BUSINESS_CREATE_SUBDISTRICT_PLACEHOLDER', 'Select sub-district', 'เลือกตำบล', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BUSINESS_CREATE_ZIPCODE_PLACEHOLDER', 'Zip Code', 'รหัสไปรษณีย์', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BURT01_PROVINCE_PLACEHOLDER', 'Select province', 'เลือกจังหวัด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BURT01_DISTRICT_PLACEHOLDER', 'Select district', 'เลือกอำเภอ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BURT01_SUBDISTRICT_PLACEHOLDER', 'Select sub-district', 'เลือกตำบล', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'BURT01_ZIPCODE_PLACEHOLDER', 'Zip Code', 'รหัสไปรษณีย์', 'system', NOW(), 'system', NOW(), false);
