package com.jayasrimart.e_commerce.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateOrderRequest {

    private Long addressId;

    // Optional inline address if user didn't pick an existing one
    private AddressDto newAddress;

    @NotBlank(message = "Payment method is required (COD, MOCK_CARD, MOCK_UPI)")
    private String paymentMethod; // COD, MOCK_CARD, MOCK_UPI

    private String couponCode;

    public CreateOrderRequest() {}

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public AddressDto getNewAddress() {
        return newAddress;
    }

    public void setNewAddress(AddressDto newAddress) {
        this.newAddress = newAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
