package com.logistics_service.repository;


import com.logistics_service.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository
        extends JpaRepository<Delivery, Long> {

    List<Delivery> findByDonationId(Long donationId);

    List<Delivery> findByNgoId(Long ngoId);

    List<Delivery> findByStatus(String status);

    List<Delivery> findByDonorEmail(String donorEmail);
}