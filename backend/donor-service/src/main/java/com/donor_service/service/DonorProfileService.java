package com.donor_service.service;

import com.donor_service.dto.DonorProfileRequest;
import com.donor_service.entity.DonorProfile;
import com.donor_service.repository.DonorProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class DonorProfileService {

    private final DonorProfileRepository profileRepository;

    public DonorProfileService(DonorProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public DonorProfile createProfile(DonorProfileRequest request) {
        if (profileRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Profile already exists for email: " + request.getEmail());
        }

        DonorProfile profile = new DonorProfile();
        profile.setEmail(request.getEmail());
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());
        profile.setDonorType(request.getDonorType());

        return profileRepository.save(profile);
    }

    public DonorProfile getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Donor profile not found for email: " + email));
    }
}
