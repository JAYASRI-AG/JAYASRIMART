package com.jayasrimart.e_commerce.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AdminDashboardDto {
    private BigDecimal totalSales = BigDecimal.ZERO;
    private long totalOrders = 0L;
    private long totalCustomers = 0L;
    private long totalProducts = 0L;
    private long pendingOrders = 0L;
    private long lowStockProducts = 0L;
    private List<OrderDto> recentOrders = new ArrayList<>();
    private List<ProductDto> lowStockItems = new ArrayList<>();

    public AdminDashboardDto() {}

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<OrderDto> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderDto> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public List<ProductDto> getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(List<ProductDto> lowStockItems) {
        this.lowStockItems = lowStockItems;
    }
}
