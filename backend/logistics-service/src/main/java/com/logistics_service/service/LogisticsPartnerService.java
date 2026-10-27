package com.logistics_service.service;

import com.logistics_service.dto.LogisticsPartnerRequest;
import com.logistics_service.entity.LogisticsPartner;
import com.logistics_service.repository.LogisticsPartnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogisticsPartnerService {

    private final LogisticsPartnerRepository repository;

    public LogisticsPartnerService(LogisticsPartnerRepository repository) {
        this.repository = repository;
    }

    public LogisticsPartner createPartner(LogisticsPartnerRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Logistics Partner with this email already exists");
        }

        LogisticsPartner partner = new LogisticsPartner();
        partner.setCompanyName(request.getCompanyName());
        partner.setEmail(request.getEmail());
        partner.setPhone(request.getPhone());
        partner.setCity(request.getCity());
        partner.setFleetSize(request.getFleetSize());
        partner.setActive(true);

        return repository.save(partner);
    }

    public List<LogisticsPartner> getAllPartners() {
        return repository.findAll();
    }

    public LogisticsPartner getByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logistics Partner not found"));
    }
}
