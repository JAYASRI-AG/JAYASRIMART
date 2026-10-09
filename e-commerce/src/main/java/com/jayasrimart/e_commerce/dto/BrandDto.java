package com.jayasrimart.e_commerce.dto;

public class BrandDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private boolean active;

    public BrandDto() {}

    public BrandDto(Long id, String name, String slug, String description, String logoUrl, boolean active) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.logoUrl = logoUrl;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
