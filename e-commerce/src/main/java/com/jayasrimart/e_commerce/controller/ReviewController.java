package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.CreateReviewRequest;
import com.jayasrimart.e_commerce.dto.ReviewDto;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDto> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto review = reviewService.createReview(principal.getId(), productId, request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", review));
    }
}
