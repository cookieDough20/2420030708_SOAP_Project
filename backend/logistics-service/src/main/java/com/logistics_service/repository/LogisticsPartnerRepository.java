package com.logistics_service.repository;

import com.logistics_service.entity.LogisticsPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogisticsPartnerRepository extends JpaRepository<LogisticsPartner, Long> {
    Optional<LogisticsPartner> findByEmail(String email);
    boolean existsByEmail(String email);
}
