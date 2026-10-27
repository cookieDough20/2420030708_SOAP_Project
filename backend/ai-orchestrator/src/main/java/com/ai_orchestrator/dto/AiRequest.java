package com.ai_orchestrator.dto;


import jakarta.validation.constraints.NotBlank;

public class AiRequest {

    @NotBlank
    private String input;

    private String taskType;

    private Long donationId;

    public AiRequest() {
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }
}