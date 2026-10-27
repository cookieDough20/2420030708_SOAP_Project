package com.donor_service.repository;

import com.donor_service.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRepository
        extends JpaRepository<Donation, Long> {

    List<Donation> findByDonorEmail(String donorEmail);

    List<Donation> findByStatus(String status);
}