package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.AdminDashboardDto;
import com.jayasrimart.e_commerce.dto.OrderDto;
import com.jayasrimart.e_commerce.dto.ProductDto;
import com.jayasrimart.e_commerce.dto.UserDto;
import com.jayasrimart.e_commerce.entity.OrderStatus;
import com.jayasrimart.e_commerce.entity.Role;
import com.jayasrimart.e_commerce.entity.User;
import com.jayasrimart.e_commerce.entity.UserStatus;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.OrderRepository;
import com.jayasrimart.e_commerce.repository.ProductRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final OrderService orderService;
    private final AuthService authService;

    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ProductService productService,
                        OrderService orderService,
                        AuthService authService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.orderService = orderService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        AdminDashboardDto dto = new AdminDashboardDto();

        BigDecimal totalSales = orderRepository.sumTotalSales();
        dto.setTotalSales(totalSales != null ? totalSales : BigDecimal.ZERO);

        dto.setTotalOrders(orderRepository.count());
        dto.setTotalCustomers(userRepository.countByRole(Role.CUSTOMER));
        dto.setTotalProducts(productRepository.count());
        dto.setPendingOrders(orderRepository.countByStatus(OrderStatus.PENDING));

        int lowStockThreshold = 10;
        dto.setLowStockProducts(productRepository.countByStockQuantityLessThan(lowStockThreshold));

        List<OrderDto> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 6))
                .stream()
                .map(orderService::toOrderDto)
                .collect(Collectors.toList());
        dto.setRecentOrders(recentOrders);

        List<ProductDto> lowStockList = productRepository.findByStockQuantityLessThan(lowStockThreshold)
                .stream()
                .limit(10)
                .map(productService::toProductDto)
                .collect(Collectors.toList());
        dto.setLowStockItems(lowStockList);

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(authService::toUserDto);
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(status);
        user = userRepository.save(user);
        return authService.toUserDto(user);
    }
}
