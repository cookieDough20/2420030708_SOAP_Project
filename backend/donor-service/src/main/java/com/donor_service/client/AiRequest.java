package com.donor_service.client;

public class AiRequest {
    private String input;
    private String taskType;
    private Long donationId;

    public AiRequest() {}

    public AiRequest(String input, String taskType, Long donationId) {
        this.input = input;
        this.taskType = taskType;
        this.donationId = donationId;
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
