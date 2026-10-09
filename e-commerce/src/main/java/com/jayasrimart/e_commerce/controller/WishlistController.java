package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.WishlistDto;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistDto>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        WishlistDto wishlist = wishlistService.getWishlistForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(wishlist));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> addToWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.addToWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Product added to wishlist", wishlist));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.removeFromWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Product removed from wishlist", wishlist));
    }
}
