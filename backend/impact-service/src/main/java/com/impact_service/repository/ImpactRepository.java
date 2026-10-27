package com.impact_service.repository;


import com.impact_service.entity.Impact;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImpactRepository
        extends JpaRepository<Impact, Long> {

    List<Impact> findByDonationId(Long donationId);

    List<Impact> findByNgoId(Long ngoId);

    List<Impact> findByDeliveryId(Long deliveryId);

    List<Impact> findByImpactType(String impactType);
}