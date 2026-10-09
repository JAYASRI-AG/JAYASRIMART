package com.jayasrimart.e_commerce.dto;

import java.math.BigDecimal;

public class ApplyCouponResponse {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private BigDecimal totalAfterDiscount;
    private String message;

    public ApplyCouponResponse() {}

    public ApplyCouponResponse(String code, BigDecimal discountAmount, BigDecimal subtotal, BigDecimal totalAfterDiscount, String message) {
        this.code = code;
        this.discountAmount = discountAmount;
        this.subtotal = subtotal;
        this.totalAfterDiscount = totalAfterDiscount;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTotalAfterDiscount() {
        return totalAfterDiscount;
    }

    public void setTotalAfterDiscount(BigDecimal totalAfterDiscount) {
        this.totalAfterDiscount = totalAfterDiscount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
