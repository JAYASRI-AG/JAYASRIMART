package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.BrandDto;
import com.jayasrimart.e_commerce.entity.Brand;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Transactional(readOnly = true)
    public List<BrandDto> getAllActiveBrands() {
        return brandRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BrandDto getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return toDto(brand);
    }

    @Transactional
    public BrandDto createBrand(BrandDto dto) {
        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? CategoryService.toSlug(dto.getSlug())
                : CategoryService.toSlug(dto.getName());

        if (brandRepository.existsBySlug(slug)) {
            throw new BadRequestException("Brand slug already exists: " + slug);
        }

        Brand brand = new Brand();
        brand.setName(dto.getName().trim());
        brand.setSlug(slug);
        brand.setDescription(dto.getDescription());
        brand.setLogoUrl(dto.getLogoUrl());
        brand.setActive(dto.isActive());

        brand = brandRepository.save(brand);
        return toDto(brand);
    }

    @Transactional
    public BrandDto updateBrand(Long id, BrandDto dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        brand.setName(dto.getName().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = CategoryService.toSlug(dto.getSlug());
            if (!newSlug.equals(brand.getSlug()) && brandRepository.existsBySlug(newSlug)) {
                throw new BadRequestException("Brand slug already exists: " + newSlug);
            }
            brand.setSlug(newSlug);
        }
        brand.setDescription(dto.getDescription());
        brand.setLogoUrl(dto.getLogoUrl());
        brand.setActive(dto.isActive());

        brand = brandRepository.save(brand);
        return toDto(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        brandRepository.delete(brand);
    }

    public BrandDto toDto(Brand brand) {
        return new BrandDto(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getDescription(),
                brand.getLogoUrl(),
                brand.isActive()
        );
    }
}
