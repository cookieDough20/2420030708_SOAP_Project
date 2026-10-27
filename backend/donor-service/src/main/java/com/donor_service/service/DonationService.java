package com.donor_service.service;

import com.donor_service.dto.DonationRequest;
import com.donor_service.entity.Donation;
import com.donor_service.repository.DonationRepository;
import com.donor_service.client.AiOrchestratorClient;
import com.donor_service.client.AiRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonationService {

    private static final Logger log = LoggerFactory.getLogger(DonationService.class);

    private final DonationRepository donationRepository;
    private final AiOrchestratorClient aiClient;

    public DonationService(DonationRepository donationRepository, AiOrchestratorClient aiClient) {
        this.donationRepository = donationRepository;
        this.aiClient = aiClient;
    }

    public Donation createDonation(DonationRequest request) {

        Donation donation = new Donation();

        donation.setDonorEmail(request.getDonorEmail());
        donation.setFoodName(request.getFoodName());
        donation.setFoodType(request.getFoodType());
        donation.setQuantity(request.getQuantity());
        donation.setQuantityUnit(request.getQuantityUnit());
        donation.setPickupAddress(request.getPickupAddress());
        donation.setPreparedAt(request.getPreparedAt());
        donation.setExpiryTime(request.getExpiryTime());

        donation.setStatus("AI_PROCESSING");

        Donation savedDonation = donationRepository.save(donation);
        log.info("Donation #{} created with status AI_PROCESSING", savedDonation.getId());

        // Trigger AI Orchestrator asynchronously to avoid blocking the donor
        final Long donationId = savedDonation.getId();
        new Thread(() -> {
            try {
                // Compute freshness_hours from preparedAt (hours since preparation)
                double freshnessHours = 2.0; // default if preparedAt is null
                if (savedDonation.getPreparedAt() != null) {
                    Duration sincePrepared = Duration.between(savedDonation.getPreparedAt(), LocalDateTime.now());
                    freshnessHours = Math.max(0, sincePrepared.toMinutes() / 60.0);
                }

                // Compute expiry_hours from expiryTime (hours until expiry from now)
                double expiryHours = 24.0; // default if expiryTime is null
                if (savedDonation.getExpiryTime() != null) {
                    Duration untilExpiry = Duration.between(LocalDateTime.now(), savedDonation.getExpiryTime());
                    expiryHours = Math.max(0.1, untilExpiry.toMinutes() / 60.0);
                }

                int peopleToServe = (int)(savedDonation.getQuantity() * 3);

                // Construct the JSON string for the AI model
                String inputJson = String.format(
                    "{\"food_quantity\":%s,\"food_type\":\"%s\",\"freshness_hours\":%.1f,"
                    + "\"expiry_hours\":%.1f,\"distance_km\":5.0,\"ngo_demand\":100,"
                    + "\"people_to_serve\":%d,\"pickup_address\":\"%s\",\"donor_email\":\"%s\"}",
                    savedDonation.getQuantity(),
                    savedDonation.getFoodType(),
                    freshnessHours,
                    expiryHours,
                    peopleToServe,
                    savedDonation.getPickupAddress() != null ? savedDonation.getPickupAddress() : "Unknown",
                    savedDonation.getDonorEmail()
                );

                log.info("Donation #{} — sending to AI Orchestrator: {}", donationId, inputJson);

                AiRequest aiReq = new AiRequest(inputJson, "donation_allocation", donationId);
                aiClient.triggerAiProcessing(aiReq);

                log.info("Donation #{} — AI processing completed successfully", donationId);
            } catch (Exception e) {
                log.error("Donation #{} — AI processing FAILED: {}", donationId, e.getMessage(), e);
                // Failure recovery: roll back status so donation is not stuck at AI_PROCESSING
                try {
                    Donation failedDonation = donationRepository.findById(donationId).orElse(null);
                    if (failedDonation != null && "AI_PROCESSING".equals(failedDonation.getStatus())) {
                        failedDonation.setStatus("AVAILABLE");
                        donationRepository.save(failedDonation);
                        log.info("Donation #{} — status rolled back to AVAILABLE", donationId);
                    }
                } catch (Exception rollbackEx) {
                    log.error("Donation #{} — failed to rollback status: {}", donationId, rollbackEx.getMessage());
                }
            }
        }).start();

        return savedDonation;
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Donation getDonationById(Long id) {

        return donationRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Donation not found")
                );
    }

    public List<Donation> getDonationsByDonor(
            String donorEmail) {

        return donationRepository
                .findByDonorEmail(donorEmail);
    }

    public Donation updateStatus(
            Long id,
            String status) {

        Donation donation = getDonationById(id);

        donation.setStatus(status);

        return donationRepository.save(donation);
    }

    public Donation allocateNgo(Long id, Long ngoId) {
        Donation donation = getDonationById(id);
        donation.setAllocatedNgoId(ngoId);
        donation.setStatus("ALLOCATED");
        return donationRepository.save(donation);
    }

    public void deleteDonation(Long id) {

        if (!donationRepository.existsById(id)) {
            throw new RuntimeException("Donation not found");
        }

        donationRepository.deleteById(id);
    }
}