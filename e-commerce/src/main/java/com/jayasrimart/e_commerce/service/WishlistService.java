package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.WishlistDto;
import com.jayasrimart.e_commerce.dto.WishlistItemDto;
import com.jayasrimart.e_commerce.entity.Product;
import com.jayasrimart.e_commerce.entity.User;
import com.jayasrimart.e_commerce.entity.Wishlist;
import com.jayasrimart.e_commerce.entity.WishlistItem;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.ProductRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import com.jayasrimart.e_commerce.repository.WishlistItemRepository;
import com.jayasrimart.e_commerce.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Wishlist wl = new Wishlist(user);
                    return wishlistRepository.save(wl);
                });
    }

    @Transactional(readOnly = true)
    public WishlistDto getWishlistForUser(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return toWishlistDto(wishlist);
    }

    @Transactional
    public WishlistDto addToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), productId)) {
            WishlistItem item = new WishlistItem(wishlist, product);
            wishlistItemRepository.save(item);
        }

        return toWishlistDto(wishlist);
    }

    @Transactional
    public WishlistDto removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlistItemRepository.deleteByWishlistIdAndProductId(wishlist.getId(), productId);
        return toWishlistDto(wishlist);
    }

    public WishlistDto toWishlistDto(Wishlist wishlist) {
        List<WishlistItem> items = wishlistItemRepository.findByWishlistIdOrderByCreatedAtDesc(wishlist.getId());
        List<WishlistItemDto> itemDtos = new ArrayList<>();

        for (WishlistItem item : items) {
            Product product = item.getProduct();
            WishlistItemDto dto = new WishlistItemDto();
            dto.setId(item.getId());
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSlug(product.getSlug());
            dto.setProductImageUrl(product.getImageUrl());
            dto.setPrice(product.getPrice());
            dto.setDiscountPrice(product.getDiscountPrice());
            dto.setInStock(product.getStockQuantity() > 0 && product.isActive());
            dto.setCreatedAt(item.getCreatedAt());
            itemDtos.add(dto);
        }

        WishlistDto dto = new WishlistDto();
        dto.setId(wishlist.getId());
        dto.setItems(itemDtos);
        dto.setItemCount(itemDtos.size());
        return dto;
    }
}
