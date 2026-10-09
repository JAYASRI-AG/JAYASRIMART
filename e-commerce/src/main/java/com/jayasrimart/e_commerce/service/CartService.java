package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.AddToCartRequest;
import com.jayasrimart.e_commerce.dto.CartDto;
import com.jayasrimart.e_commerce.dto.CartItemDto;
import com.jayasrimart.e_commerce.entity.Cart;
import com.jayasrimart.e_commerce.entity.CartItem;
import com.jayasrimart.e_commerce.entity.Product;
import com.jayasrimart.e_commerce.entity.User;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.CartItemRepository;
import com.jayasrimart.e_commerce.repository.CartRepository;
import com.jayasrimart.e_commerce.repository.ProductRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Cart cart = new Cart(user);
                    return cartRepository.save(cart);
                });
    }

    @Transactional(readOnly = true)
    public CartDto getCartForUser(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is currently out of stock");
        }

        BigDecimal activePrice = (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0)
                ? product.getDiscountPrice()
                : product.getPrice();

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        int newQty = request.getQuantity();
        if (item != null) {
            newQty += item.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add more items than available stock. Available: " + product.getStockQuantity());
            }
            item.setQuantity(newQty);
            item.setPrice(activePrice);
            cartItemRepository.save(item);
        } else {
            if (newQty > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add more items than available stock. Available: " + product.getStockQuantity());
            }
            item = new CartItem(cart, product, newQty, activePrice);
            cartItemRepository.save(item);
        }

        return toCartDto(cart);
    }

    @Transactional
    public CartDto updateCartItem(Long userId, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to user cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (quantity > product.getStockQuantity()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
            }
            BigDecimal activePrice = (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? product.getDiscountPrice()
                    : product.getPrice();
            item.setQuantity(quantity);
            item.setPrice(activePrice);
            cartItemRepository.save(item);
        }

        return toCartDto(cart);
    }

    @Transactional
    public CartDto removeCartItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to user cart");
        }

        cartItemRepository.delete(item);
        return toCartDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    public CartDto toCartDto(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalCount = 0;

        for (CartItem item : items) {
            Product product = item.getProduct();
            BigDecimal activePrice = (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? product.getDiscountPrice()
                    : product.getPrice();

            BigDecimal itemTotal = activePrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            totalCount += item.getQuantity();

            CartItemDto dto = new CartItemDto();
            dto.setId(item.getId());
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSlug(product.getSlug());
            dto.setProductImageUrl(product.getImageUrl());
            dto.setUnitPrice(activePrice);
            dto.setQuantity(item.getQuantity());
            dto.setItemTotal(itemTotal);
            dto.setInStock(product.getStockQuantity() >= item.getQuantity() && product.isActive());
            dto.setAvailableStock(product.getStockQuantity());

            itemDtos.add(dto);
        }

        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId());
        cartDto.setItems(itemDtos);
        cartDto.setSubtotal(subtotal);
        cartDto.setItemCount(totalCount);
        return cartDto;
    }
}
