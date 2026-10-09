package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.ApplyCouponRequest;
import com.jayasrimart.e_commerce.dto.ApplyCouponResponse;
import com.jayasrimart.e_commerce.dto.CouponDto;
import com.jayasrimart.e_commerce.entity.Coupon;
import com.jayasrimart.e_commerce.entity.DiscountType;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional(readOnly = true)
    public ApplyCouponResponse applyCoupon(ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(request.getCode().trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid or inactive coupon code: " + request.getCode()));

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Coupon is not yet active");
        }
        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        BigDecimal subtotal = request.getSubtotal();
        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinimumOrderAmount() + " required to use this coupon");
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaximumDiscount() != null && discountAmount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discountAmount = coupon.getMaximumDiscount();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }
        }

        BigDecimal finalTotal = subtotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        return new ApplyCouponResponse(
                coupon.getCode(),
                discountAmount,
                subtotal,
                finalTotal,
                "Coupon " + coupon.getCode() + " applied successfully! Saved ₹" + discountAmount
        );
    }

    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (couponRepository.existsByCode(code)) {
            throw new BadRequestException("Coupon code already exists: " + code);
        }

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinimumOrderAmount(dto.getMinimumOrderAmount() != null ? dto.getMinimumOrderAmount() : BigDecimal.ZERO);
        coupon.setMaximumDiscount(dto.getMaximumDiscount());
        coupon.setStartDate(dto.getStartDate());
        coupon.setExpiryDate(dto.getExpiryDate());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setUsedCount(0);
        coupon.setActive(dto.isActive());

        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CouponDto dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        String code = dto.getCode().trim().toUpperCase();
        if (!code.equals(coupon.getCode()) && couponRepository.existsByCode(code)) {
            throw new BadRequestException("Coupon code already exists: " + code);
        }

        coupon.setCode(code);
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinimumOrderAmount(dto.getMinimumOrderAmount() != null ? dto.getMinimumOrderAmount() : BigDecimal.ZERO);
        coupon.setMaximumDiscount(dto.getMaximumDiscount());
        coupon.setStartDate(dto.getStartDate());
        coupon.setExpiryDate(dto.getExpiryDate());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setActive(dto.isActive());

        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        couponRepository.delete(coupon);
    }

    public CouponDto toDto(Coupon coupon) {
        CouponDto dto = new CouponDto();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinimumOrderAmount(coupon.getMinimumOrderAmount());
        dto.setMaximumDiscount(coupon.getMaximumDiscount());
        dto.setStartDate(coupon.getStartDate());
        dto.setExpiryDate(coupon.getExpiryDate());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setUsedCount(coupon.getUsedCount());
        dto.setActive(coupon.isActive());
        return dto;
    }
}
