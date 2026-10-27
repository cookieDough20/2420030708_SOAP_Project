package com.ai_orchestrator.service;


import com.ai_orchestrator.dto.AiRequest;
import com.ai_orchestrator.dto.AiResponse;
import com.ai_orchestrator.entity.AiPrediction;
import com.ai_orchestrator.repository.AiPredictionRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ai_orchestrator.dto.FastApiPrediction;
import com.ai_orchestrator.dto.DeliveryRequest;
import java.util.List;
import java.util.Map;

@Service
public class AiOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(AiOrchestratorService.class);

    private final AiPredictionRepository repository;

    private final RestClient restClient;
    private final RestClient gatewayClient;
    private final ObjectMapper objectMapper;

    public AiOrchestratorService(
            AiPredictionRepository repository,
            @Value("${ai.service.url}") String aiServiceUrl) {

        this.repository = repository;

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
        
        this.gatewayClient = RestClient.builder()
                .baseUrl("http://localhost:8080")
                .build();
                
        this.objectMapper = new ObjectMapper();
    }

    public AiResponse processRequest(
            AiRequest request) {

        log.info("Donation #{} — AI Orchestrator received request (taskType={})",
                request.getDonationId(), request.getTaskType());

        /*
         * Send request to FastAPI
         */
        AiResponse response = restClient.post()
                .uri("/predict")
                .body(request)
                .retrieve()
                .body(AiResponse.class);

        if (response == null) {

            throw new RuntimeException(
                    "AI service returned empty response"
            );
        }

        log.info("Donation #{} — FastAPI returned prediction result", request.getDonationId());

        /*
         * Store AI result in PostgreSQL
         */
        AiPrediction prediction =
                new AiPrediction();

        prediction.setDonationId(
                request.getDonationId()
        );

        prediction.setTaskType(
                request.getTaskType()
        );

        prediction.setInput(
                request.getInput()
        );

        prediction.setResult(
                response.getResult()
        );

        repository.save(prediction);
        log.info("Donation #{} — AI prediction saved to database", request.getDonationId());

        try {
            // Parse result to get NGO ID
            FastApiPrediction fastApiPrediction = objectMapper.readValue(response.getResult(), FastApiPrediction.class);
            Long ngoId = fastApiPrediction.getRecommended_ngo_id();
            
            log.info("Donation #{} — AI recommended NGO ID: {}, priority: {}, urgency: {}",
                    request.getDonationId(), ngoId,
                    fastApiPrediction.getPriority(),
                    fastApiPrediction.getUrgency_score());

            if (ngoId != null) {
                // 1. Allocate NGO in donor-service
                gatewayClient.patch()
                        .uri("/donations/{id}/allocate?ngoId={ngoId}", request.getDonationId(), ngoId)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Donation #{} — NGO #{} allocated successfully", request.getDonationId(), ngoId);
                        
                // 2. Create Delivery in logistics-service
                Map<String, Object> inputMap = objectMapper.readValue(request.getInput(), Map.class);
                String donorEmail = (String) inputMap.getOrDefault("donor_email", "unknown@donor.com");
                String pickupAddress = (String) inputMap.getOrDefault("pickup_address", "Unknown Location");
                
                DeliveryRequest deliveryRequest = new DeliveryRequest(
                        request.getDonationId(),
                        ngoId,
                        donorEmail,
                        pickupAddress
                );
                
                gatewayClient.post()
                        .uri("/deliveries")
                        .body(deliveryRequest)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Donation #{} — Delivery order created automatically", request.getDonationId());
            } else {
                log.warn("Donation #{} — AI returned NULL ngoId, skipping allocation", request.getDonationId());
            }
        } catch (Exception e) {
            log.error("Donation #{} — Failed to orchestrate downstream actions: {}",
                    request.getDonationId(), e.getMessage(), e);
        }

        return response;
    }

    public List<AiPrediction> getAllPredictions() {

        return repository.findAll();
    }

    public AiPrediction getPredictionById(
            Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "AI prediction not found"
                        )
                );
    }

    public List<AiPrediction> getByDonation(
            Long donationId) {

        return repository.findByDonationId(
                donationId
        );
    }
}