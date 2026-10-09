package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.*;
import com.jayasrimart.e_commerce.entity.*;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.CartRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import com.jayasrimart.e_commerce.repository.WishlistRepository;
import com.jayasrimart.e_commerce.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       CartRepository cartRepository,
                       WishlistRepository wishlistRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        // Always assign CUSTOMER role for public registration
        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Initialize user cart and wishlist
        Cart cart = new Cart(user);
        cartRepository.save(cart);

        Wishlist wishlist = new Wishlist(user);
        wishlistRepository.save(wishlist);

        String token = jwtTokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, toUserDto(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is inactive or suspended");
        }

        String token = jwtTokenProvider.generateToken(authentication);
        return new AuthResponse(token, toUserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UserDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }

        user = userRepository.save(user);
        return toUserDto(user);
    }

    public UserDto toUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
