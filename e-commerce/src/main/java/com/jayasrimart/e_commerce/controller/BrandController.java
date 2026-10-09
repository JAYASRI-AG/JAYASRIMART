package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.BrandDto;
import com.jayasrimart.e_commerce.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandDto>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.ok(brandService.getAllActiveBrands()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDto>> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(brandService.getBrandById(id)));
    }
}
