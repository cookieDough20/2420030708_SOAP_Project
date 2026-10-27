package com.impact_service.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "impacts")
public class Impact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long donationId;

    private Long ngoId;

    private Long deliveryId;

    private Double foodQuantityKg;

    private Integer mealsProvided;

    private Double co2SavedKg;

    private Integer peopleServed;

    private String impactType;

    private LocalDateTime createdAt;

    public Impact() {
    }

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();

        if (mealsProvided == null) {
            mealsProvided = 0;
        }

        if (peopleServed == null) {
            peopleServed = 0;
        }

        if (foodQuantityKg == null) {
            foodQuantityKg = 0.0;
        }

        if (co2SavedKg == null) {
            co2SavedKg = 0.0;
        }
    }

    public Long getId() {
        return id;
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

    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Double getFoodQuantityKg() {
        return foodQuantityKg;
    }

    public void setFoodQuantityKg(Double foodQuantityKg) {
        this.foodQuantityKg = foodQuantityKg;
    }

    public Integer getMealsProvided() {
        return mealsProvided;
    }

    public void setMealsProvided(Integer mealsProvided) {
        this.mealsProvided = mealsProvided;
    }

    public Double getCo2SavedKg() {
        return co2SavedKg;
    }

    public void setCo2SavedKg(Double co2SavedKg) {
        this.co2SavedKg = co2SavedKg;
    }

    public Integer getPeopleServed() {
        return peopleServed;
    }

    public void setPeopleServed(Integer peopleServed) {
        this.peopleServed = peopleServed;
    }

    public String getImpactType() {
        return impactType;
    }

    public void setImpactType(String impactType) {
        this.impactType = impactType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}