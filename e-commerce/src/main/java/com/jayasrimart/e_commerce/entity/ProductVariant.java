package com.jayasrimart.e_commerce.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_product_variants_product_id", columnList = "product_id")
})
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "variant_name", nullable = false, length = 50)
    private String variantName;

    @Column(name = "variant_value", nullable = false, length = 100)
    private String variantValue;

    @Column(name = "additional_price", precision = 10, scale = 2)
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(length = 100)
    private String sku;

    public ProductVariant() {}

    public ProductVariant(Product product, String variantName, String variantValue, BigDecimal additionalPrice, Integer stockQuantity, String sku) {
        this.product = product;
        this.variantName = variantName;
        this.variantValue = variantValue;
        this.additionalPrice = additionalPrice != null ? additionalPrice : BigDecimal.ZERO;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 0;
        this.sku = sku;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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
