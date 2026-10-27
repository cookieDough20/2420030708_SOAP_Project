package com.logistics_service.controller;


import com.logistics_service.dto.DeliveryRequest;
import com.logistics_service.dto.DriverAssignmentRequest;
import com.logistics_service.entity.Delivery;
import com.logistics_service.service.LogisticsService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class LogisticsController {

    private final LogisticsService logisticsService;

    public LogisticsController(
            LogisticsService logisticsService) {

        this.logisticsService = logisticsService;
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(
            @Valid @RequestBody DeliveryRequest request) {

        return ResponseEntity.ok(
                logisticsService.createDelivery(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {

        return ResponseEntity.ok(
                logisticsService.getAllDeliveries()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDelivery(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                logisticsService.getDeliveryById(id)
        );
    }

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<List<Delivery>> getByDonation(
            @PathVariable Long donationId) {

        return ResponseEntity.ok(
                logisticsService.getByDonation(
                        donationId
                )
        );
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Delivery>> getByNGO(
            @PathVariable Long ngoId) {

        return ResponseEntity.ok(
                logisticsService.getByNGO(ngoId)
        );
    }

    @GetMapping("/donor/{email}")
    public ResponseEntity<List<Delivery>> getByDonor(
            @PathVariable String email) {

        return ResponseEntity.ok(
                logisticsService.getByDonor(email)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Delivery>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                logisticsService.getByStatus(status)
        );
    }

    @PatchMapping("/{id}/assign-driver")
    public ResponseEntity<Delivery> assignDriver(
            @PathVariable Long id,
            @Valid @RequestBody
            DriverAssignmentRequest request) {

        return ResponseEntity.ok(
                logisticsService.assignDriver(
                        id,
                        request
                )
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                logisticsService.updateStatus(
                        id,
                        status
                )
        );
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Delivery> verifyDelivery(
            @PathVariable Long id,
            @RequestParam String code) {

        return ResponseEntity.ok(
                logisticsService.verifyDelivery(id, code)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDelivery(
            @PathVariable Long id) {

        logisticsService.deleteDelivery(id);

        return ResponseEntity.ok(
                "Delivery deleted successfully"
        );
    }
}