package com.logistics_service.dto;

public class ImpactRequest {
    private Long donationId;
    private Long ngoId;
    private Long deliveryId;
    private Double foodQuantityKg;
    private Integer mealsProvided;
    private Double co2SavedKg;
    private Integer peopleServed;
    private String impactType;

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public Double getFoodQuantityKg() { return foodQuantityKg; }
    public void setFoodQuantityKg(Double foodQuantityKg) { this.foodQuantityKg = foodQuantityKg; }

    public Integer getMealsProvided() { return mealsProvided; }
    public void setMealsProvided(Integer mealsProvided) { this.mealsProvided = mealsProvided; }

    public Double getCo2SavedKg() { return co2SavedKg; }
    public void setCo2SavedKg(Double co2SavedKg) { this.co2SavedKg = co2SavedKg; }

    public Integer getPeopleServed() { return peopleServed; }
    public void setPeopleServed(Integer peopleServed) { this.peopleServed = peopleServed; }

    public String getImpactType() { return impactType; }
    public void setImpactType(String impactType) { this.impactType = impactType; }
}
