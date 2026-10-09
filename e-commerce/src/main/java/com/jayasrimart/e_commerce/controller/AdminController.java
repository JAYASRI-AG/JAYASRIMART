package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.*;
import com.jayasrimart.e_commerce.entity.UserStatus;
import com.jayasrimart.e_commerce.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final BrandService brandService;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final CouponService couponService;

    public AdminController(AdminService adminService,
                           ProductService productService,
                           CategoryService categoryService,
                           BrandService brandService,
                           OrderService orderService,
                           ReviewService reviewService,
                           CouponService couponService) {
        this.adminService = adminService;
        this.productService = productService;
        this.categoryService = categoryService;
        this.brandService = brandService;
        this.orderService = orderService;
        this.reviewService = reviewService;
        this.couponService = couponService;
    }

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    // Products
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<ProductPageResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ProductPageResponse response = productService.getProducts(search, categoryId, null, null, null, null, null, null, false, page, size, "newest");
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductCreateUpdateDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductCreateUpdateDto dto) {
        ProductDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully", null));
    }

    @PutMapping("/products/{id}/stock")
    public ResponseEntity<ApiResponse<Void>> updateStock(@PathVariable Long id, @Valid @RequestBody InventoryUpdateDto dto) {
        productService.updateStock(id, dto.getStockQuantity());
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully", null));
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully", created));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto dto) {
        CategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully", null));
    }

    // Brands
    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<BrandDto>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.ok(brandService.getAllBrands()));
    }

    @PostMapping("/brands")
    public ResponseEntity<ApiResponse<BrandDto>> createBrand(@Valid @RequestBody BrandDto dto) {
        BrandDto created = brandService.createBrand(dto);
        return ResponseEntity.ok(ApiResponse.ok("Brand created successfully", created));
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<ApiResponse<BrandDto>> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandDto dto) {
        BrandDto updated = brandService.updateBrand(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Brand updated successfully", updated));
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.ok("Brand deleted successfully", null));
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDto> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        OrderDto order = orderService.getOrderById(null, id, true);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateDto dto) {
        OrderDto order = orderService.updateOrderStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully", order));
    }

    // Users
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        UserDto user = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", user));
    }

    // Reviews
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getAllReviews(pageable)));
    }

    @PutMapping("/reviews/{id}/approval")
    public ResponseEntity<ApiResponse<ReviewDto>> updateReviewApproval(
            @PathVariable Long id,
            @RequestParam boolean approved) {
        ReviewDto review = reviewService.updateReviewApproval(id, approved);
        return ResponseEntity.ok(ApiResponse.ok("Review approval updated", review));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully", null));
    }

    // Coupons
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto dto) {
        CouponDto created = couponService.createCoupon(dto);
        return ResponseEntity.ok(ApiResponse.ok("Coupon created successfully", created));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponDto dto) {
        CouponDto updated = couponService.updateCoupon(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Coupon updated successfully", updated));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.ok("Coupon deleted successfully", null));
    }
}
