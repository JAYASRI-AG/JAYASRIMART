package com.jayasrimart.e_commerce.controller;

import com.jayasrimart.e_commerce.dto.ApiResponse;
import com.jayasrimart.e_commerce.dto.CategoryDto;
import com.jayasrimart.e_commerce.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllActiveCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryBySlug(slug)));
    }
}
