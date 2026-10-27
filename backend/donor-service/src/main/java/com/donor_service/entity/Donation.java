package com.donor_service.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String donorEmail;

    @Column(nullable = false)
    private String foodName;

    @Column(nullable = false)
    private String foodType;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String quantityUnit;

    private String pickupAddress;

    private LocalDateTime preparedAt;

    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private String status;

    private Double trustScore;

    private String freshnessStatus;

    private Long allocatedNgoId;

    private LocalDateTime createdAt;

    public Donation() {
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = "AI_PROCESSING";
        }
    }

    public Long getId() {
        return id;
    }

    public String getDonorEmail() {
        return donorEmail;
    }

    public void setDonorEmail(String donorEmail) {
        this.donorEmail = donorEmail;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public String getFoodType() {
        return foodType;
    }

    public void setFoodType(String foodType) {
        this.foodType = foodType;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getQuantityUnit() {
        return quantityUnit;
    }

    public void setQuantityUnit(String quantityUnit) {
        this.quantityUnit = quantityUnit;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public LocalDateTime getPreparedAt() {
        return preparedAt;
    }

    public void setPreparedAt(LocalDateTime preparedAt) {
        this.preparedAt = preparedAt;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }

    public String getFreshnessStatus() {
        return freshnessStatus;
    }

    public void setFreshnessStatus(String freshnessStatus) {
        this.freshnessStatus = freshnessStatus;
    }

    public Long getAllocatedNgoId() {
        return allocatedNgoId;
    }

    public void setAllocatedNgoId(Long allocatedNgoId) {
        this.allocatedNgoId = allocatedNgoId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}