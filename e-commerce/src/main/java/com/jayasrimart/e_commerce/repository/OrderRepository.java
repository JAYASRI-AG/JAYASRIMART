package com.jayasrimart.e_commerce.repository;

import com.jayasrimart.e_commerce.entity.Order;
import com.jayasrimart.e_commerce.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal sumTotalSales();

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
