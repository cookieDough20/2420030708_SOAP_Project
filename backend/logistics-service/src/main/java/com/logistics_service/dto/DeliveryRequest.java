package com.logistics_service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class DeliveryRequest {

    @NotNull
    private Long donationId;

    @NotNull
    private Long ngoId;

    private String donorEmail;

    private String pickupAddress;

    private String deliveryAddress;

    private LocalDateTime scheduledPickup;

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public Long getNgoId() {
        return ngoId;
    }

    public void setNgoId(Long ngoId) {
        this.ngoId = ngoId;
    }

    public String getDonorEmail() {
        return donorEmail;
    }

    public void setDonorEmail(String donorEmail) {
        this.donorEmail = donorEmail;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public LocalDateTime getScheduledPickup() {
        return scheduledPickup;
    }

    public void setScheduledPickup(LocalDateTime scheduledPickup) {
        this.scheduledPickup = scheduledPickup;
    }
}