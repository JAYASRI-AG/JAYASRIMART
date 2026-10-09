package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.CategoryDto;
import com.jayasrimart.e_commerce.entity.Category;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toDto(category);
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return toDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? toSlug(dto.getSlug())
                : toSlug(dto.getName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug already exists: " + slug);
        }

        Category category = new Category();
        category.setName(dto.getName().trim());
        category.setSlug(slug);
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setActive(dto.isActive());

        category = categoryRepository.save(category);
        return toDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(dto.getName().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = toSlug(dto.getSlug());
            if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
                throw new BadRequestException("Category slug already exists: " + newSlug);
            }
            category.setSlug(newSlug);
        }
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setActive(dto.isActive());

        category = categoryRepository.save(category);
        return toDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }

    public CategoryDto toDto(Category category) {
        long count = category.getProducts() != null ? category.getProducts().size() : 0;
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.isActive(),
                count
        );
    }

    public static String toSlug(String input) {
        if (input == null) return "";
        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
