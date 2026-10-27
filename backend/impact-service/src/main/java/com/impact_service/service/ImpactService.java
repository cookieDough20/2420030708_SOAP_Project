package com.impact_service.service;


import com.impact_service.dto.ImpactRequest;
import com.impact_service.entity.Impact;
import com.impact_service.repository.ImpactRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImpactService {

    private final ImpactRepository impactRepository;

    public ImpactService(
            ImpactRepository impactRepository) {

        this.impactRepository = impactRepository;
    }

    public Impact createImpact(
            ImpactRequest request) {

        Impact impact = new Impact();

        impact.setDonationId(
                request.getDonationId()
        );

        impact.setNgoId(
                request.getNgoId()
        );

        impact.setDeliveryId(
                request.getDeliveryId()
        );

        impact.setFoodQuantityKg(
                request.getFoodQuantityKg()
        );

        impact.setMealsProvided(
                request.getMealsProvided()
        );

        impact.setCo2SavedKg(
                request.getCo2SavedKg()
        );

        impact.setPeopleServed(
                request.getPeopleServed()
        );

        impact.setImpactType(
                request.getImpactType()
        );

        return impactRepository.save(impact);
    }

    public List<Impact> getAllImpacts() {

        return impactRepository.findAll();
    }

    public Impact getImpactById(Long id) {

        return impactRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Impact record not found"
                        )
                );
    }

    public List<Impact> getByDonation(
            Long donationId) {

        return impactRepository
                .findByDonationId(donationId);
    }

    public List<Impact> getByNGO(Long ngoId) {

        return impactRepository
                .findByNgoId(ngoId);
    }

    public List<Impact> getByDelivery(
            Long deliveryId) {

        return impactRepository
                .findByDeliveryId(deliveryId);
    }

    public void deleteImpact(Long id) {

        if (!impactRepository.existsById(id)) {

            throw new RuntimeException(
                    "Impact record not found"
            );
        }

        impactRepository.deleteById(id);
    }
}