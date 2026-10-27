package com.ai_orchestrator.repository;



import com.ai_orchestrator.entity.AiPrediction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiPredictionRepository
        extends JpaRepository<AiPrediction, Long> {

    List<AiPrediction> findByDonationId(
            Long donationId
    );

    List<AiPrediction> findByTaskType(
            String taskType
    );
}