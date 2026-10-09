package com.jayasrimart.e_commerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ApplyCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.0", message = "Subtotal cannot be negative")
    private BigDecimal subtotal;

    public ApplyCouponRequest() {}

    public ApplyCouponRequest(String code, BigDecimal subtotal) {
        this.code = code;
        this.subtotal = subtotal;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
