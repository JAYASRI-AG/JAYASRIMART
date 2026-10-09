package com.jayasrimart.e_commerce.repository;

import com.jayasrimart.e_commerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlistIdAndProductId(Long wishlistId, Long productId);
    boolean existsByWishlistIdAndProductId(Long wishlistId, Long productId);
    void deleteByWishlistIdAndProductId(Long wishlistId, Long productId);
    List<WishlistItem> findByWishlistIdOrderByCreatedAtDesc(Long wishlistId);
}
