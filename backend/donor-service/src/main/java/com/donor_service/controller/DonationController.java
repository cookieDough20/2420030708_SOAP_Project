package com.donor_service.controller;

import com.donor_service.dto.DonationRequest;
import com.donor_service.entity.Donation;
import com.donor_service.service.DonationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    public ResponseEntity<Donation> createDonation(
            @Valid @RequestBody DonationRequest request) {

        return ResponseEntity.ok(
                donationService.createDonation(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {

        return ResponseEntity.ok(
                donationService.getAllDonations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonation(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                donationService.getDonationById(id)
        );
    }

    @GetMapping("/donor/{email}")
    public ResponseEntity<List<Donation>> getByDonor(
            @PathVariable String email) {

        return ResponseEntity.ok(
                donationService.getDonationsByDonor(email)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Donation> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                donationService.updateStatus(id, status)
        );
    }

    @PatchMapping("/{id}/allocate")
    public ResponseEntity<Donation> allocateNgo(
            @PathVariable Long id,
            @RequestParam Long ngoId) {

        return ResponseEntity.ok(
                donationService.allocateNgo(id, ngoId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDonation(
            @PathVariable Long id) {

        donationService.deleteDonation(id);

        return ResponseEntity.ok(
                "Donation deleted successfully"
        );
    }
}