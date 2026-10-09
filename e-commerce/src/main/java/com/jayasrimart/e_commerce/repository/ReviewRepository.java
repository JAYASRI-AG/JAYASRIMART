package com.jayasrimart.e_commerce.repository;

import com.jayasrimart.e_commerce.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(Long productId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Long countApprovedByProductId(@Param("productId") Long productId);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
