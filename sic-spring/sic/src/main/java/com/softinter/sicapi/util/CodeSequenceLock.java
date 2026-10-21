package com.softinter.sicapi.util;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Document codes are generated as "count + 1, skip taken ones". Two saves at the same moment (AI batch create sends
 * them in parallel, or two users) both see the same free number and get the same code (e.g. two PH-005).
 * This lock makes them take turns per (kind, project) until the transaction commits, so the second one sees the first.
 */
@Component
@RequiredArgsConstructor
public class CodeSequenceLock {

    private final JdbcTemplate jdbc;

    /** Call inside the saving transaction, right before counting / checking the next free code. */
    public void lock(String kind, Object scope) {
        jdbc.queryForList("SELECT pg_advisory_xact_lock(hashtext(?))", kind + ":" + scope);
    }
}
