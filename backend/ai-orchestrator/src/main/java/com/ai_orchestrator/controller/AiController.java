package com.ai_orchestrator.controller;


import com.ai_orchestrator.dto.AiRequest;
import com.ai_orchestrator.dto.AiResponse;
import com.ai_orchestrator.entity.AiPrediction;
import com.ai_orchestrator.service.AiOrchestratorService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiOrchestratorService aiService;

    public AiController(
            AiOrchestratorService aiService) {

        this.aiService = aiService;
    }

    @PostMapping("/predict")
    public ResponseEntity<AiResponse> predict(
            @Valid @RequestBody AiRequest request) {

        return ResponseEntity.ok(
                aiService.processRequest(request)
        );
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<AiPrediction>>
    getAllPredictions() {

        return ResponseEntity.ok(
                aiService.getAllPredictions()
        );
    }

    @GetMapping("/predictions/{id}")
    public ResponseEntity<AiPrediction>
    getPrediction(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                aiService.getPredictionById(id)
        );
    }

    @GetMapping("/predictions/donation/{donationId}")
    public ResponseEntity<List<AiPrediction>>
    getByDonation(
            @PathVariable Long donationId) {

        return ResponseEntity.ok(
                aiService.getByDonation(
                        donationId
                )
        );
    }
}