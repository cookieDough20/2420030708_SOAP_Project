package com.donor_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "AI-ORCHESTRATOR")
public interface AiOrchestratorClient {

    @PostMapping("/ai/predict")
    Object triggerAiProcessing(@RequestBody AiRequest request);
}
