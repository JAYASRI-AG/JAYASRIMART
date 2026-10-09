package com.jayasrimart.e_commerce.repository;

import com.jayasrimart.e_commerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
    List<Product> findByFeaturedTrueAndActiveTrue();
    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    long countByStockQuantityLessThan(Integer threshold);
    List<Product> findByStockQuantityLessThan(Integer threshold);
}
