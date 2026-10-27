package com.logistics_service.controller;

import com.logistics_service.dto.LogisticsPartnerRequest;
import com.logistics_service.entity.LogisticsPartner;
import com.logistics_service.service.LogisticsPartnerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logistics-partners")
public class LogisticsPartnerController {

    private final LogisticsPartnerService service;

    public LogisticsPartnerController(LogisticsPartnerService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createPartner(@Valid @RequestBody LogisticsPartnerRequest request) {
        try {
            return ResponseEntity.ok(service.createPartner(request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating partner: " + e.getMessage() + " - " + e.getClass().getName());
        }
    }

    @GetMapping
    public ResponseEntity<List<LogisticsPartner>> getAllPartners() {
        return ResponseEntity.ok(service.getAllPartners());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getByEmail(@PathVariable String email) {
        try {
            return ResponseEntity.ok(service.getByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Error finding partner: " + e.getMessage());
        }
    }
}
