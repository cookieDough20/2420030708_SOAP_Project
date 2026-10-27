package com.logistics_service.service;


import com.logistics_service.dto.DeliveryRequest;
import com.logistics_service.dto.DriverAssignmentRequest;
import com.logistics_service.entity.Delivery;
import com.logistics_service.repository.DeliveryRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.logistics_service.dto.ImpactRequest;
import com.logistics_service.dto.DonationDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LogisticsService {

    private final DeliveryRepository deliveryRepository;
    private final RestClient gatewayClient;

    public LogisticsService(
            DeliveryRepository deliveryRepository) {

        this.deliveryRepository = deliveryRepository;
        this.gatewayClient = RestClient.builder()
                .baseUrl("http://localhost:8080")
                .build();
    }

    public Delivery createDelivery(
            DeliveryRequest request) {

        Delivery delivery = new Delivery();

        delivery.setDonationId(request.getDonationId());
        delivery.setNgoId(request.getNgoId());
        delivery.setDonorEmail(request.getDonorEmail());

        delivery.setPickupAddress(
                request.getPickupAddress()
        );

        delivery.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        delivery.setScheduledPickup(
                request.getScheduledPickup()
        );

        // Auto-assign logistics partner
        delivery.setAssignedDriver("Auto-Assigned Logistics Partner");
        delivery.setDriverPhone("+1-555-0199");
        delivery.setStatus("ASSIGNED");
        
        // Generate secure 8-character verification token for the QR code
        delivery.setVerificationCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return deliveryRepository.save(delivery);
    }

    private List<Delivery> ensureVerificationCodes(List<Delivery> deliveries) {
        boolean updated = false;
        for (Delivery d : deliveries) {
            if (d.getVerificationCode() == null || d.getVerificationCode().isEmpty()) {
                d.setVerificationCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                updated = true;
            }
        }
        if (updated) {
            deliveryRepository.saveAll(deliveries);
        }
        return deliveries;
    }

    public List<Delivery> getAllDeliveries() {
        return ensureVerificationCodes(deliveryRepository.findAll());
    }

    public Delivery getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        if (delivery.getVerificationCode() == null || delivery.getVerificationCode().isEmpty()) {
            delivery.setVerificationCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            deliveryRepository.save(delivery);
        }
        return delivery;
    }

    public List<Delivery> getByDonation(Long donationId) {
        return ensureVerificationCodes(deliveryRepository.findByDonationId(donationId));
    }

    public List<Delivery> getByNGO(Long ngoId) {
        return ensureVerificationCodes(deliveryRepository.findByNgoId(ngoId));
    }

    public List<Delivery> getByStatus(String status) {
        return ensureVerificationCodes(deliveryRepository.findByStatus(status));
    }

    public List<Delivery> getByDonor(String email) {
        return ensureVerificationCodes(deliveryRepository.findByDonorEmail(email));
    }

    public Delivery assignDriver(
            Long id,
            DriverAssignmentRequest request) {

        Delivery delivery = getDeliveryById(id);

        delivery.setAssignedDriver(
                request.getDriverName()
        );

        delivery.setDriverPhone(
                request.getDriverPhone()
        );

        delivery.setStatus("ASSIGNED");

        return deliveryRepository.save(delivery);
    }

    public Delivery updateStatus(
            Long id,
            String status) {

        Delivery delivery = getDeliveryById(id);

        delivery.setStatus(status);

        if ("PICKED_UP".equalsIgnoreCase(status)) {

            delivery.setActualPickup(
                    LocalDateTime.now()
            );
        }

        if ("DELIVERED".equalsIgnoreCase(status)) {

            delivery.setDeliveredAt(
                    LocalDateTime.now()
            );
        }

        return deliveryRepository.save(delivery);
    }

    public Delivery verifyDelivery(Long id, String code) {
        Delivery delivery = getDeliveryById(id);
        
        if (!"IN_TRANSIT".equalsIgnoreCase(delivery.getStatus()) && !"PICKED_UP".equalsIgnoreCase(delivery.getStatus())) {
            throw new RuntimeException("Delivery must be in transit to be verified.");
        }
        
        if (delivery.getVerificationCode() == null || !delivery.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid verification code.");
        }
        
        delivery.setStatus("DELIVERED");
        delivery.setDeliveredAt(LocalDateTime.now());
        
        Delivery savedDelivery = deliveryRepository.save(delivery);
        triggerCompletionActions(savedDelivery);
        return savedDelivery;
    }

    private void triggerCompletionActions(Delivery delivery) {
        new Thread(() -> {
            try {
                // 1. Sync Donation Status
                gatewayClient.patch()
                    .uri("/donations/{donationId}/status?status=COMPLETED", delivery.getDonationId())
                    .retrieve()
                    .toBodilessEntity();
                    
                // 2. Fetch Donation Details
                DonationDto donation = gatewayClient.get()
                    .uri("/donations/{donationId}", delivery.getDonationId())
                    .retrieve()
                    .body(DonationDto.class);
                    
                // 3. Trigger Impact Metrics
                if (donation != null) {
                    ImpactRequest ir = new ImpactRequest();
                    ir.setDonationId(delivery.getDonationId());
                    ir.setNgoId(delivery.getNgoId());
                    ir.setDeliveryId(delivery.getId());
                    
                    Double quantity = donation.getQuantity() != null ? donation.getQuantity() : 10.0;
                    
                    ir.setFoodQuantityKg(quantity);
                    ir.setMealsProvided((int)(quantity * 3));
                    ir.setCo2SavedKg(quantity * 2.5);
                    ir.setPeopleServed((int)(quantity * 3));
                    ir.setImpactType("DELIVERED");
                    
                    gatewayClient.post()
                        .uri("/impacts")
                        .body(ir)
                        .retrieve()
                        .toBodilessEntity();
                }
            } catch (Exception e) {
                System.err.println("Failed to trigger completion actions: " + e.getMessage());
            }
        }).start();
    }

    public void deleteDelivery(Long id) {

        if (!deliveryRepository.existsById(id)) {

            throw new RuntimeException(
                    "Delivery not found"
            );
        }

        deliveryRepository.deleteById(id);
    }
}
