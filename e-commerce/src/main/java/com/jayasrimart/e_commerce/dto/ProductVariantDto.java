package com.jayasrimart.e_commerce.dto;

import java.math.BigDecimal;

public class ProductVariantDto {
    private Long id;
    private String variantName;
    private String variantValue;
    private BigDecimal additionalPrice;
    private Integer stockQuantity;
    private String sku;

    public ProductVariantDto() {}

    public ProductVariantDto(Long id, String variantName, String variantValue, BigDecimal additionalPrice, Integer stockQuantity, String sku) {
        this.id = id;
        this.variantName = variantName;
        this.variantValue = variantValue;
        this.additionalPrice = additionalPrice;
        this.stockQuantity = stockQuantity;
        this.sku = sku;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    public String getVariantValue() {
        return variantValue;
    }

    public void setVariantValue(String variantValue) {
        this.variantValue = variantValue;
    }

    public BigDecimal getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(BigDecimal additionalPrice) {
        this.additionalPrice = additionalPrice;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}
