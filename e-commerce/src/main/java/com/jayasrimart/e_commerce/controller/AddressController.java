package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.AddressDto;
import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.security.UserPrincipal;
import com.jayasrimart.e_commerce.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        List<AddressDto> addresses = addressService.getUserAddresses(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressDto dto) {
        AddressDto address = addressService.addAddress(principal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Address added successfully", address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto) {
        AddressDto address = addressService.updateAddress(principal.getId(), id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully", address));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AddressDto address = addressService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Default address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        addressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully", null));
    }
}
