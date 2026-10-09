package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.ApplyCouponRequest;
import com.jayasrimart.e_commerce.dto.ApplyCouponResponse;
import com.jayasrimart.e_commerce.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplyCouponResponse>> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        ApplyCouponResponse response = couponService.applyCoupon(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @org.springframework.web.bind.annotation.GetMapping("/validate")
    public ResponseEntity<ApiResponse<ApplyCouponResponse>> validateCoupon(
            @org.springframework.web.bind.annotation.RequestParam String code,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "0") java.math.BigDecimal orderAmount) {
        ApplyCouponRequest request = new ApplyCouponRequest();
        request.setCode(code);
        request.setSubtotal(orderAmount);
        ApplyCouponResponse response = couponService.applyCoupon(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
