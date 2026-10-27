package com.ngo_service.controller;


import com.ngo_service.dto.NGORequest;
import com.ngo_service.entity.NGO;
import com.ngo_service.service.NGOService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ngos")
public class NGOController {

    private final NGOService ngoService;

    public NGOController(NGOService ngoService) {
        this.ngoService = ngoService;
    }

    @PostMapping
    public ResponseEntity<NGO> createNGO(
            @Valid @RequestBody NGORequest request) {

        return ResponseEntity.ok(
                ngoService.createNGO(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<NGO>> getAllNGOs() {

        return ResponseEntity.ok(
                ngoService.getAllNGOs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<NGO> getNGO(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ngoService.getNGOById(id)
        );
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<NGO> getByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                ngoService.getByEmail(email)
        );
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<NGO>> getByCity(
            @PathVariable String city) {

        return ResponseEntity.ok(
                ngoService.getByCity(city)
        );
    }

    @GetMapping("/available")
    public ResponseEntity<List<NGO>> getAvailableNGOs() {

        return ResponseEntity.ok(
                ngoService.getAvailableNGOs()
        );
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<NGO> updateAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) {

        return ResponseEntity.ok(
                ngoService.updateAvailability(
                        id,
                        available
                )
        );
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<NGO> updateActiveStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        return ResponseEntity.ok(
                ngoService.updateActiveStatus(
                        id,
                        active
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNGO(
            @PathVariable Long id) {

        ngoService.deleteNGO(id);

        return ResponseEntity.ok(
                "NGO deleted successfully"
        );
    }
}