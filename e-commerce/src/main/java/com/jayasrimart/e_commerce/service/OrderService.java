package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.*;
import com.jayasrimart.e_commerce.entity.*;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        PaymentRepository paymentRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        AddressRepository addressRepository,
                        CouponRepository couponRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.couponRepository = couponRepository;
    }

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("User has no active cart"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty. Please add items to cart before placing an order.");
        }

        // 1. Resolve shipping address
        String formattedShippingAddress;
        if (request.getAddressId() != null) {
            Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                    .orElseThrow(() -> new BadRequestException("Address not found or does not belong to user"));
            formattedShippingAddress = formatAddress(address);
        } else if (request.getNewAddress() != null) {
            AddressDto a = request.getNewAddress();
            formattedShippingAddress = String.format("%s | Phone: %s | %s, %s, %s, %s - %s, %s",
                    a.getFullName(), a.getPhone(),
                    a.getAddressLine1(),
                    a.getAddressLine2() != null ? a.getAddressLine2() : "",
                    a.getCity(), a.getState(), a.getPostalCode(),
                    a.getCountry() != null ? a.getCountry() : "India");
        } else {
            // Check default address
            Address defaultAddr = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .orElse(null);
            if (defaultAddr == null) {
                List<Address> all = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
                if (!all.isEmpty()) defaultAddr = all.get(0);
            }
            if (defaultAddr == null) {
                throw new BadRequestException("Delivery address is required to place an order");
            }
            formattedShippingAddress = formatAddress(defaultAddr);
        }

        // 2. Validate product availability, stock, and calculate subtotal strictly from DB prices
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItemData> itemsToProcess = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = productRepository.findById(ci.getProduct().getId())
                    .orElseThrow(() -> new BadRequestException("Product no longer exists: ID " + ci.getProduct().getId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is currently inactive/unavailable.");
            }

            if (product.getStockQuantity() < ci.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() +
                        "'. Requested: " + ci.getQuantity() + ", Available: " + product.getStockQuantity());
            }

            BigDecimal unitPrice = (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? product.getDiscountPrice()
                    : product.getPrice();

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            itemsToProcess.add(new OrderItemData(product, ci.getQuantity(), unitPrice, lineTotal));
        }

        // 3. Coupon discount calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon usedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            usedCoupon = couponRepository.findByCodeAndActiveTrue(request.getCouponCode().trim().toUpperCase())
                    .orElse(null);

            if (usedCoupon != null) {
                LocalDateTime now = LocalDateTime.now();
                boolean validDates = (usedCoupon.getStartDate() == null || !now.isBefore(usedCoupon.getStartDate()))
                        && (usedCoupon.getExpiryDate() == null || !now.isAfter(usedCoupon.getExpiryDate()));
                boolean validLimit = (usedCoupon.getUsageLimit() == null || usedCoupon.getUsedCount() < usedCoupon.getUsageLimit());
                boolean validMinOrder = (usedCoupon.getMinimumOrderAmount() == null || subtotal.compareTo(usedCoupon.getMinimumOrderAmount()) >= 0);

                if (validDates && validLimit && validMinOrder) {
                    if (usedCoupon.getDiscountType() == DiscountType.PERCENTAGE) {
                        discountAmount = subtotal.multiply(usedCoupon.getDiscountValue())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        if (usedCoupon.getMaximumDiscount() != null && discountAmount.compareTo(usedCoupon.getMaximumDiscount()) > 0) {
                            discountAmount = usedCoupon.getMaximumDiscount();
                        }
                    } else {
                        discountAmount = usedCoupon.getDiscountValue();
                    }
                    if (discountAmount.compareTo(subtotal) > 0) {
                        discountAmount = subtotal;
                    }
                    usedCoupon.setUsedCount(usedCoupon.getUsedCount() + 1);
                    couponRepository.save(usedCoupon);
                }
            }
        }

        // 4. Shipping amount calculation (Free shipping over ₹500, else ₹40)
        BigDecimal shippingAmount = (subtotal.compareTo(BigDecimal.valueOf(500)) >= 0)
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(40.00);

        // 5. Tax amount calculation (5% standard GST)
        BigDecimal taxAmount = subtotal.subtract(discountAmount)
                .multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP);
        if (taxAmount.compareTo(BigDecimal.ZERO) < 0) taxAmount = BigDecimal.ZERO;

        // 6. Total amount
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingAmount).add(taxAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // 7. Generate order number
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String orderNumber = "JM-" + timestamp + "-" + randomSuffix;

        // 8. Create and save order
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(orderNumber);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingAmount(shippingAmount);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? PaymentStatus.PENDING : PaymentStatus.PAID);
        order.setShippingAddress(formattedShippingAddress);
        order.setBillingAddress(formattedShippingAddress);

        order = orderRepository.save(order);

        // 9. Process order items & decrement inventory
        List<OrderItem> savedItems = new ArrayList<>();
        for (OrderItemData itemData : itemsToProcess) {
            Product product = itemData.product;
            // Decrement inventory
            product.setStockQuantity(product.getStockQuantity() - itemData.quantity);
            productRepository.save(product);

            // Create historical snapshot item
            OrderItem orderItem = new OrderItem(
                    order,
                    product.getId(),
                    product.getName(),
                    itemData.quantity,
                    itemData.unitPrice,
                    itemData.lineTotal
            );
            savedItems.add(orderItemRepository.save(orderItem));
        }
        order.setItems(savedItems);

        // 10. Record payment
        String method = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "COD";
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        PaymentStatus paymentStatus = "COD".equalsIgnoreCase(method) ? PaymentStatus.PENDING : PaymentStatus.PAID;
        Payment payment = new Payment(order, method, txnId, totalAmount, paymentStatus);
        paymentRepository.save(payment);
        order.setPayment(payment);

        // 11. Clear user cart
        cartItemRepository.deleteByCartId(cart.getId());

        return toOrderDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long userId, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this order");
        }

        return toOrderDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(Long userId, String orderNumber, boolean isAdmin) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this order");
        }

        return toOrderDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this order");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivered orders cannot be cancelled");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        // Restore inventory
        for (OrderItem item : order.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            });
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PAID) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(order.getPayment());
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        order = orderRepository.save(order);
        return toOrderDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toOrderDto);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatusUpdateDto dto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (dto.getStatus() != null) {
            // If cancelling from admin and not already cancelled, restore inventory
            if (dto.getStatus() == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    productRepository.findById(item.getProductId()).ifPresent(product -> {
                        product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                        productRepository.save(product);
                    });
                }
            }
            order.setStatus(dto.getStatus());
        }

        if (dto.getPaymentStatus() != null) {
            order.setPaymentStatus(dto.getPaymentStatus());
            if (order.getPayment() != null) {
                order.getPayment().setStatus(dto.getPaymentStatus());
                paymentRepository.save(order.getPayment());
            }
        }

        order = orderRepository.save(order);
        return toOrderDto(order);
    }

    private String formatAddress(Address a) {
        return String.format("%s | Phone: %s | %s, %s, %s, %s - %s, %s",
                a.getFullName(), a.getPhone(),
                a.getAddressLine1(),
                a.getAddressLine2() != null ? a.getAddressLine2() : "",
                a.getCity(), a.getState(), a.getPostalCode(),
                a.getCountry());
    }

    public OrderDto toOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUser() != null ? order.getUser().getId() : null);
        dto.setUserEmail(order.getUser() != null ? order.getUser().getEmail() : "");
        dto.setUserName(order.getUser() != null ? (order.getUser().getFirstName() + " " + (order.getUser().getLastName() != null ? order.getUser().getLastName() : "")).trim() : "");
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setShippingAmount(order.getShippingAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getPayment() != null) {
            dto.setPaymentMethod(order.getPayment().getPaymentMethod());
            dto.setTransactionId(order.getPayment().getTransactionId());
        }

        List<OrderItemDto> itemDtos = (order.getItems() != null ? order.getItems() : new ArrayList<OrderItem>()).stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()))
                .collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }

    private static class OrderItemData {
        Product product;
        int quantity;
        BigDecimal unitPrice;
        BigDecimal lineTotal;

        OrderItemData(Product product, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
            this.product = product;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.lineTotal = lineTotal;
        }
    }
}
