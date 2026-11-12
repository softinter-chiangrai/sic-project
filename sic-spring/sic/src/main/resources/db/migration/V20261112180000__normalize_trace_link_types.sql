-- Migration to standardize trace link types and diagram types to canonical SCREAMING_SNAKE_CASE
UPDATE pm_trace_link SET source_type = 'USE_CASE' WHERE source_type IN ('USE CASE', 'UseCase', 'Use Case', 'use_case');
UPDATE pm_trace_link SET target_type = 'USE_CASE' WHERE target_type IN ('USE CASE', 'UseCase', 'Use Case', 'use_case');

UPDATE pm_trace_link SET source_type = 'GIT_GRAPH' WHERE source_type IN ('GIT GRAPH', 'Git Graph', 'GitGraph', 'git_graph');
UPDATE pm_trace_link SET target_type = 'GIT_GRAPH' WHERE target_type IN ('GIT GRAPH', 'Git Graph', 'GitGraph', 'git_graph');

UPDATE pm_trace_link SET source_type = 'REQUIREMENT' WHERE source_type IN ('REQ', 'req');
UPDATE pm_trace_link SET target_type = 'REQUIREMENT' WHERE target_type IN ('REQ', 'req');

UPDATE pm_trace_link SET source_type = 'SPECIFICATION' WHERE source_type IN ('SPEC', 'spec');
UPDATE pm_trace_link SET target_type = 'SPECIFICATION' WHERE target_type IN ('SPEC', 'spec');

UPDATE pm_trace_link SET source_type = 'TEST_CASE' WHERE source_type IN ('TC', 'tc', 'TESTCASE', 'testcase');
UPDATE pm_trace_link SET target_type = 'TEST_CASE' WHERE target_type IN ('TC', 'tc', 'TESTCASE', 'testcase');

UPDATE pm_trace_link SET source_type = 'CHANGE_REQUEST' WHERE source_type IN ('CR', 'cr');
UPDATE pm_trace_link SET target_type = 'CHANGE_REQUEST' WHERE target_type IN ('CR', 'cr');

UPDATE pm_trace_link SET source_type = 'DESIGN_REVIEW' WHERE source_type IN ('DR', 'dr', 'DESIGNREVIEW', 'designreview');
UPDATE pm_trace_link SET target_type = 'DESIGN_REVIEW' WHERE target_type IN ('DR', 'dr', 'DESIGNREVIEW', 'designreview');

UPDATE pm_trace_link SET source_type = 'TEST_SCENARIO' WHERE source_type IN ('SCENARIO', 'scenario');
UPDATE pm_trace_link SET target_type = 'TEST_SCENARIO' WHERE target_type IN ('SCENARIO', 'scenario');

UPDATE pm_trace_link SET source_type = 'USER_MANUAL' WHERE source_type IN ('MANUAL', 'manual');
UPDATE pm_trace_link SET target_type = 'USER_MANUAL' WHERE target_type IN ('MANUAL', 'manual');

UPDATE pm_trace_link SET source_type = 'MA_TICKET' WHERE source_type IN ('TICKET', 'ticket');
UPDATE pm_trace_link SET target_type = 'MA_TICKET' WHERE target_type IN ('TICKET', 'ticket');

