package com.ngo_service.service;


import com.ngo_service.dto.NGORequest;
import com.ngo_service.entity.NGO;
import com.ngo_service.repository.NGORepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NGOService {

    private final NGORepository ngoRepository;

    public NGOService(NGORepository ngoRepository) {
        this.ngoRepository = ngoRepository;
    }

    public NGO createNGO(NGORequest request) {

        if (ngoRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "NGO with this email already exists"
            );
        }

        NGO ngo = new NGO();

        ngo.setOrganizationName(
                request.getOrganizationName()
        );

        ngo.setEmail(request.getEmail());
        ngo.setPhone(request.getPhone());
        ngo.setAddress(request.getAddress());
        ngo.setCity(request.getCity());
        ngo.setState(request.getState());
        ngo.setPincode(request.getPincode());

        ngo.setFoodCapacity(
                request.getFoodCapacity()
        );

        ngo.setPeopleServed(
                request.getPeopleServed()
        );

        ngo.setAvailable(true);
        ngo.setActive(true);

        return ngoRepository.save(ngo);
    }

    public List<NGO> getAllNGOs() {
        return ngoRepository.findAll();
    }

    public NGO getNGOById(Long id) {

        return ngoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "NGO not found"
                        )
                );
    }

    public NGO getByEmail(String email) {

        return ngoRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "NGO not found"
                        )
                );
    }

    public List<NGO> getByCity(String city) {

        return ngoRepository.findByCity(city);
    }

    public List<NGO> getAvailableNGOs() {

        return ngoRepository
                .findByAvailableTrueAndActiveTrue();
    }

    public NGO updateAvailability(
            Long id,
            Boolean available) {

        NGO ngo = getNGOById(id);

        ngo.setAvailable(available);

        return ngoRepository.save(ngo);
    }

    public NGO updateActiveStatus(
            Long id,
            Boolean active) {

        NGO ngo = getNGOById(id);

        ngo.setActive(active);

        return ngoRepository.save(ngo);
    }

    public void deleteNGO(Long id) {

        if (!ngoRepository.existsById(id)) {
            throw new RuntimeException(
                    "NGO not found"
            );
        }

        ngoRepository.deleteById(id);
    }
}
