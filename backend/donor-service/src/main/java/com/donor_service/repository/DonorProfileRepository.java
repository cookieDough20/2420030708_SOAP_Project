package com.donor_service.repository;

import com.donor_service.entity.DonorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {
    Optional<DonorProfile> findByEmail(String email);
    boolean existsByEmail(String email);
}
