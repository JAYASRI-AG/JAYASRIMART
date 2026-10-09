package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.ProductDto;
import com.jayasrimart.e_commerce.dto.ProductPageResponse;
import com.jayasrimart.e_commerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProductPageResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        ProductPageResponse response = productService.getProducts(
                search, categoryId, categorySlug, brandId, brandSlug, minPrice, maxPrice, featured, true, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeaturedProducts()));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getNewArrivals() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getNewArrivals()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductBySlug(slug)));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getRelatedProducts(categoryId, id)));
    }
}
