package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.*;
import com.jayasrimart.e_commerce.entity.*;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ReviewRepository reviewRepository;
    private final CategoryService categoryService;
    private final BrandService brandService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          ProductImageRepository productImageRepository,
                          ProductVariantRepository productVariantRepository,
                          ReviewRepository reviewRepository,
                          CategoryService categoryService,
                          BrandService brandService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.reviewRepository = reviewRepository;
        this.categoryService = categoryService;
        this.brandService = brandService;
    }

    @Transactional(readOnly = true)
    public ProductPageResponse getProducts(String search, Long categoryId, String categorySlug,
                                           Long brandId, String brandSlug, BigDecimal minPrice,
                                           BigDecimal maxPrice, Boolean featured, Boolean activeOnly,
                                           int page, int size, String sort) {
        Sort sortObj;
        if ("priceAsc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "price");
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "price");
        } else if ("nameAsc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "name");
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Boolean.TRUE.equals(activeOnly != null ? activeOnly : true)) {
                predicates.add(cb.isTrue(root.get("active")));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate skuMatch = cb.like(cb.lower(root.get("sku")), pattern);
                predicates.add(cb.or(nameMatch, descMatch, skuMatch));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            } else if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("slug"), categorySlug.trim()));
            }

            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            } else if (brandSlug != null && !brandSlug.isBlank()) {
                predicates.add(cb.equal(root.get("brand").get("slug"), brandSlug.trim()));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        List<ProductDto> content = productPage.getContent().stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());

        return new ProductPageResponse(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toProductDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return toProductDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
                .stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewArrivals() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Long categoryId, Long excludeProductId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .filter(p -> !p.getId().equals(excludeProductId))
                .limit(6)
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductCreateUpdateDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + dto.getBrandId()));
        }

        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? CategoryService.toSlug(dto.getSlug())
                : CategoryService.toSlug(dto.getName());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        String sku = dto.getSku() != null && !dto.getSku().isBlank()
                ? dto.getSku().trim().toUpperCase()
                : "JM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (productRepository.existsBySku(sku)) {
            sku = sku + "-" + (System.currentTimeMillis() % 1000);
        }

        Product product = new Product();
        product.setName(dto.getName().trim());
        product.setSlug(slug);
        product.setSku(sku);
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCategory(category);
        product.setBrand(brand);
        product.setImageUrl(dto.getImageUrl());
        product.setActive(dto.getActive() != null ? dto.getActive() : true);
        product.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : false);

        product = productRepository.save(product);

        // Save gallery images
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            int order = 0;
            for (String imgUrl : dto.getImages()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    ProductImage img = new ProductImage(product, imgUrl.trim(), order++);
                    productImageRepository.save(img);
                }
            }
        }

        // Save variants
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            for (ProductVariantDto vDto : dto.getVariants()) {
                ProductVariant variant = new ProductVariant(
                        product,
                        vDto.getVariantName(),
                        vDto.getVariantValue(),
                        vDto.getAdditionalPrice(),
                        vDto.getStockQuantity(),
                        vDto.getSku() != null ? vDto.getSku() : (product.getSku() + "-" + vDto.getVariantValue().toUpperCase())
                );
                productVariantRepository.save(variant);
            }
        }

        return toProductDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductCreateUpdateDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + dto.getBrandId()));
        }

        product.setName(dto.getName().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = CategoryService.toSlug(dto.getSlug());
            if (!newSlug.equals(product.getSlug()) && productRepository.existsBySlug(newSlug)) {
                throw new BadRequestException("Slug already in use: " + newSlug);
            }
            product.setSlug(newSlug);
        }

        if (dto.getSku() != null && !dto.getSku().isBlank()) {
            String newSku = dto.getSku().trim().toUpperCase();
            if (!newSku.equals(product.getSku()) && productRepository.existsBySku(newSku)) {
                throw new BadRequestException("SKU already in use: " + newSku);
            }
            product.setSku(newSku);
        }

        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCategory(category);
        product.setBrand(brand);
        product.setImageUrl(dto.getImageUrl());
        if (dto.getActive() != null) product.setActive(dto.getActive());
        if (dto.getFeatured() != null) product.setFeatured(dto.getFeatured());

        product = productRepository.save(product);

        // Update images if provided
        if (dto.getImages() != null) {
            productImageRepository.deleteByProductId(product.getId());
            int order = 0;
            for (String imgUrl : dto.getImages()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    ProductImage img = new ProductImage(product, imgUrl.trim(), order++);
                    productImageRepository.save(img);
                }
            }
        }

        // Update variants if provided
        if (dto.getVariants() != null) {
            productVariantRepository.deleteByProductId(product.getId());
            for (ProductVariantDto vDto : dto.getVariants()) {
                ProductVariant variant = new ProductVariant(
                        product,
                        vDto.getVariantName(),
                        vDto.getVariantValue(),
                        vDto.getAdditionalPrice(),
                        vDto.getStockQuantity(),
                        vDto.getSku()
                );
                productVariantRepository.save(variant);
            }
        }

        return toProductDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Transactional
    public void updateStock(Long id, Integer stockQuantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        if (stockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }
        product.setStockQuantity(stockQuantity);
        productRepository.save(product);
    }

    public ProductDto toProductDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setSku(product.getSku());
        dto.setDescription(product.getDescription());
        dto.setShortDescription(product.getShortDescription());
        dto.setPrice(product.getPrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setActive(product.isActive());
        dto.setFeatured(product.isFeatured());
        dto.setCreatedAt(product.getCreatedAt());

        // Discount percentage calculation
        if (product.getPrice() != null && product.getDiscountPrice() != null
                && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                && product.getPrice().compareTo(product.getDiscountPrice()) > 0) {
            BigDecimal diff = product.getPrice().subtract(product.getDiscountPrice());
            BigDecimal pct = diff.divide(product.getPrice(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            dto.setDiscountPercentage(pct.intValue());
        } else {
            dto.setDiscountPercentage(0);
        }

        if (product.getCategory() != null) {
            dto.setCategory(categoryService.toDto(product.getCategory()));
        }

        if (product.getBrand() != null) {
            dto.setBrand(brandService.toDto(product.getBrand()));
        }

        // Gallery images
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
        List<String> imgUrls = new ArrayList<>();
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            imgUrls.add(product.getImageUrl());
        }
        for (ProductImage pi : images) {
            if (!imgUrls.contains(pi.getImageUrl())) {
                imgUrls.add(pi.getImageUrl());
            }
        }
        dto.setImages(imgUrls);

        // Variants
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        dto.setVariants(variants.stream()
                .map(v -> new ProductVariantDto(v.getId(), v.getVariantName(), v.getVariantValue(), v.getAdditionalPrice(), v.getStockQuantity(), v.getSku()))
                .collect(Collectors.toList()));

        // Reviews & ratings
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());
        Long reviewCount = reviewRepository.countApprovedByProductId(product.getId());
        dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        dto.setReviewCount(reviewCount != null ? reviewCount : 0L);

        return dto;
    }
}
