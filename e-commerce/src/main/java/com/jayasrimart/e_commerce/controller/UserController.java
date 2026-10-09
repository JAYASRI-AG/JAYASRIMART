package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.AddressDto;
import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.UserDto;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.AddressService;
import com.jayasrimart.e_commerce.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final AddressService addressService;

    public UserController(AuthService authService, AddressService addressService) {
        this.authService = authService;
        this.addressService = addressService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = authService.getCurrentUser(principal.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserDto dto) {
        UserDto updated = authService.updateProfile(principal.getEmail(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        List<AddressDto> addresses = addressService.getUserAddresses(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(addresses));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressDto dto) {
        AddressDto address = addressService.addAddress(principal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Address added successfully", address));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto) {
        AddressDto address = addressService.updateAddress(principal.getId(), id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully", address));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        addressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully", null));
    }
}
