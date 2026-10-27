package com.logistics_service.dto;

import jakarta.validation.constraints.NotBlank;

public class DriverAssignmentRequest {

    @NotBlank
    private String driverName;

    @NotBlank
    private String driverPhone;

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }
}