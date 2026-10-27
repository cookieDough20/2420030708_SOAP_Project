package com.donor_service.controller;

import com.donor_service.dto.DonorProfileRequest;
import com.donor_service.entity.DonorProfile;
import com.donor_service.service.DonorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/donor-profiles")
public class DonorProfileController {

    private final DonorProfileService profileService;

    public DonorProfileController(DonorProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<DonorProfile> createProfile(@Valid @RequestBody DonorProfileRequest request) {
        DonorProfile createdProfile = profileService.createProfile(request);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<DonorProfile> getProfileByEmail(@PathVariable String email) {
        try {
            DonorProfile profile = profileService.getProfileByEmail(email);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
