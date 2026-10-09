package com.jayasrimart.e_commerce;

import com.jayasrimart.e_commerce.dto.ApplyCouponRequest;
import com.jayasrimart.e_commerce.dto.ApplyCouponResponse;
import com.jayasrimart.e_commerce.dto.RegisterRequest;
import com.jayasrimart.e_commerce.entity.*;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.repository.*;
import com.jayasrimart.e_commerce.security.JwtTokenProvider;
import com.jayasrimart.e_commerce.service.AuthService;
import com.jayasrimart.e_commerce.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JayasriMartTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private CouponService couponService;

    @Test
    void testRegistrationSuccess_AssignsCustomerRole() {
        RegisterRequest request = new RegisterRequest("Test", "User", "test@example.com", "password123", "9876543210");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(101L);
            return u;
        });
        when(jwtTokenProvider.generateTokenFromUser(anyLong(), anyString(), anyString())).thenReturn("mock.jwt.token");

        var response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals(Role.CUSTOMER, response.getUser().getRole());
        verify(cartRepository, times(1)).save(any(Cart.class));
        verify(wishlistRepository, times(1)).save(any(Wishlist.class));
    }

    @Test
    void testRegistration_DuplicateEmail_ThrowsBadRequestException() {
        RegisterRequest request = new RegisterRequest("Test", "User", "existing@example.com", "password123", "9876543210");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testCouponApply_PercentageDiscount() {
        Coupon coupon = new Coupon("SAVE10", "10% off", DiscountType.PERCENTAGE, new BigDecimal("10.00"),
                new BigDecimal("100.00"), new BigDecimal("500.00"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10), 100);

        when(couponRepository.findByCodeAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        ApplyCouponRequest request = new ApplyCouponRequest("SAVE10", new BigDecimal("1000.00"));
        ApplyCouponResponse response = couponService.applyCoupon(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("100.00"), response.getDiscountAmount());
        assertEquals(new BigDecimal("900.00"), response.getTotalAfterDiscount());
    }

    @Test
    void testCouponApply_MinOrderNotMet_ThrowsBadRequest() {
        Coupon coupon = new Coupon("BIG50", "Flat 50", DiscountType.FIXED, new BigDecimal("50.00"),
                new BigDecimal("500.00"), null,
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10), 100);

        when(couponRepository.findByCodeAndActiveTrue("BIG50")).thenReturn(Optional.of(coupon));

        ApplyCouponRequest request = new ApplyCouponRequest("BIG50", new BigDecimal("300.00"));
        assertThrows(BadRequestException.class, () -> couponService.applyCoupon(request));
    }
}
