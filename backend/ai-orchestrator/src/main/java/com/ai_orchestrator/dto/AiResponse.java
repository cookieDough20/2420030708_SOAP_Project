package com.ai_orchestrator.dto;


public class AiResponse {

    private String result;

    private String taskType;

    private Long donationId;

    public AiResponse() {
    }

    public AiResponse(
            String result,
            String taskType,
            Long donationId) {

        this.result = result;
        this.taskType = taskType;
        this.donationId = donationId;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
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