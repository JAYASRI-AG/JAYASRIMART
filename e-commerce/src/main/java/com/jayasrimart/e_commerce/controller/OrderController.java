package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.CreateOrderRequest;
import com.jayasrimart.e_commerce.dto.OrderDto;
import com.jayasrimart.e_commerce.entity.Role;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully! Order Number: " + order.getOrderNumber(), order));
    }

    @GetMapping({"", "/my-orders"})
    public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = orderService.getUserOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        OrderDto order = orderService.getOrderById(principal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByOrderNumber(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String orderNumber) {
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        OrderDto order = orderService.getOrderByOrderNumber(principal.getId(), orderNumber, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @RequestMapping(value = "/{id}/cancel", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        OrderDto order = orderService.cancelOrder(principal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", order));
    }
}
