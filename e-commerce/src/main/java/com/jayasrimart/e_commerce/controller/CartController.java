package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.AddToCartRequest;
import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.CartDto;
import com.jayasrimart.e_commerce.dto.UpdateCartItemRequest;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartDto cart = cartService.getCartForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addToCart(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto cart = cartService.updateCartItem(principal.getId(), itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.ok("Cart item updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        CartDto cart = cartService.removeCartItem(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared successfully", null));
    }
}
