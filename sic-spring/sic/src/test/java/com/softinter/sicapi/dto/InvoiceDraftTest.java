package com.softinter.sicapi.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.response.InvoiceDraft;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The AI answer for an invoice carries item code and discount next to quantity / unit price / amount; the draft must keep them. */
class InvoiceDraftTest {
    @Test
    void itemCodeAndDiscountSurviveParsing() throws Exception {
        String json = """
                {"invoiceTitle":"t","billingType":"MILESTONE","vatRate":7,
                 "items":[{"itemCode":"SVC-001","itemDescription":"d","quantity":2,"unitPrice":1000.0,"discount":100,"amount":1900.0}]}
                """;
        InvoiceDraft.InvoiceItemDraftItem item = new ObjectMapper().readValue(json, InvoiceDraft.class).getItems().get(0);
        assertEquals("SVC-001", item.getItemCode());
        assertEquals(2, item.getQuantity());
        assertEquals(0, new BigDecimal("1000").compareTo(item.getUnitPrice()));
        assertEquals(0, new BigDecimal("100").compareTo(item.getDiscount()));
        assertEquals(0, new BigDecimal("1900").compareTo(item.getAmount()));
    }
}
