package com.impact_service.controller;


import com.impact_service.dto.ImpactRequest;
import com.impact_service.entity.Impact;
import com.impact_service.service.ImpactService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/impacts")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(
            ImpactService impactService) {

        this.impactService = impactService;
    }

    @PostMapping
    public ResponseEntity<Impact> createImpact(
            @Valid @RequestBody ImpactRequest request) {

        return ResponseEntity.ok(
                impactService.createImpact(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Impact>>
    getAllImpacts() {

        return ResponseEntity.ok(
                impactService.getAllImpacts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Impact> getImpact(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                impactService.getImpactById(id)
        );
    }

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<List<Impact>>
    getByDonation(
            @PathVariable Long donationId) {

        return ResponseEntity.ok(
                impactService
                        .getByDonation(donationId)
        );
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Impact>>
    getByNGO(
            @PathVariable Long ngoId) {

        return ResponseEntity.ok(
                impactService.getByNGO(ngoId)
        );
    }

    @GetMapping("/delivery/{deliveryId}")
    public ResponseEntity<List<Impact>>
    getByDelivery(
            @PathVariable Long deliveryId) {

        return ResponseEntity.ok(
                impactService
                        .getByDelivery(deliveryId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteImpact(
            @PathVariable Long id) {

        impactService.deleteImpact(id);

        return ResponseEntity.ok(
                "Impact deleted successfully"
        );
    }
}