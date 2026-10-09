package com.jayasrimart.e_commerce.dto;

import java.util.ArrayList;
import java.util.List;

public class WishlistDto {
    private Long id;
    private List<WishlistItemDto> items = new ArrayList<>();
    private int itemCount = 0;

    public WishlistDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<WishlistItemDto> getItems() {
        return items;
    }

    public void setItems(List<WishlistItemDto> items) {
        this.items = items;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }
}
