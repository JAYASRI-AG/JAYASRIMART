package com.jayasrimart.e_commerce.dto;

import com.jayasrimart.e_commerce.entity.OrderStatus;
import com.jayasrimart.e_commerce.entity.PaymentStatus;

public class OrderStatusUpdateDto {
    private OrderStatus status;
    private PaymentStatus paymentStatus;

    public OrderStatusUpdateDto() {}

    public OrderStatusUpdateDto(OrderStatus status, PaymentStatus paymentStatus) {
        this.status = status;
        this.paymentStatus = paymentStatus;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
