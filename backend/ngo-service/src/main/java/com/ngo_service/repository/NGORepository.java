package com.ngo_service.repository;

import com.ngo_service.entity.NGO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NGORepository extends JpaRepository<NGO, Long> {

    Optional<NGO> findByEmail(String email);

    boolean existsByEmail(String email);

    List<NGO> findByCity(String city);

    List<NGO> findByAvailableTrueAndActiveTrue();
}
