package com.ai_orchestrator.dto;

import java.time.LocalDateTime;

public class DeliveryRequest {
    private Long donationId;
    private Long ngoId;
    private String donorEmail;
    private String pickupAddress;
    private String deliveryAddress;

    public DeliveryRequest() {}

    public DeliveryRequest(Long donationId, Long ngoId, String donorEmail, String pickupAddress) {
        this.donationId = donationId;
        this.ngoId = ngoId;
        this.donorEmail = donorEmail;
        this.pickupAddress = pickupAddress;
    }

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
}
