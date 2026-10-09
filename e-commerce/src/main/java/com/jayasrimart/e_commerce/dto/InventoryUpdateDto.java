package com.jayasrimart.e_commerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InventoryUpdateDto {

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    public InventoryUpdateDto() {}

    public InventoryUpdateDto(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}
