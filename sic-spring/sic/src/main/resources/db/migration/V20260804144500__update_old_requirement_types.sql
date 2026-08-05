-- Migration to clean up and update old requirement type values to new standardized uppercase codes
UPDATE pm_requirement 
SET requirement_type = 'FUNCTIONAL' 
WHERE LOWER(requirement_type) IN ('functional requirement', 'functional', 'functional_requirement');

UPDATE pm_requirement 
SET requirement_type = 'NON_FUNCTIONAL' 
WHERE LOWER(requirement_type) IN ('non-functional requirement', 'non-functional', 'non_functional', 'non_functional_requirement');

UPDATE pm_requirement 
SET requirement_type = 'BUSINESS_RULE' 
WHERE LOWER(requirement_type) IN ('business rule', 'business_rule');

UPDATE pm_requirement 
SET requirement_type = 'REPORT' 
WHERE LOWER(requirement_type) = 'report';

UPDATE pm_requirement 
SET requirement_type = 'INTEGRATION' 
WHERE LOWER(requirement_type) = 'integration';

UPDATE pm_requirement 
SET requirement_type = 'SECURITY' 
WHERE LOWER(requirement_type) = 'security';

UPDATE pm_requirement 
SET requirement_type = 'DATA' 
WHERE LOWER(requirement_type) = 'data';

UPDATE pm_requirement 
SET requirement_type = 'UI' 
WHERE LOWER(requirement_type) = 'ui';


ALTER TABLE pm_change_impact ADD COLUMN delete_by VARCHAR(100);
ALTER TABLE pm_change_impact ADD COLUMN delete_date TIMESTAMP;