
package com.foodconnect.backend.controller;

import com.foodconnect.backend.entity.FoodDonation;
import com.foodconnect.backend.repository.FoodDonationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class FoodDonationController {

    private final FoodDonationRepository donationRepository;

    public FoodDonationController(
            FoodDonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    @PostMapping
    public ResponseEntity<?> createDonation(
            @RequestBody FoodDonation donation) {

        if (donation.getFoodName() == null
                || donation.getFoodName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Food name is required."
                    ));
        }

        if (donation.getCategory() == null
                || donation.getCategory().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please select a food category."
                    ));
        }

        if (donation.getQuantity() == null
                || donation.getQuantity() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Quantity must be greater than zero."
                    ));
        }

        if (donation.getQuantityUnit() == null
                || donation.getQuantityUnit().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please select a quantity unit."
                    ));
        }

        if (donation.getPickupLocation() == null
                || donation.getPickupLocation().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Pickup location is required."
                    ));
        }

        if (donation.getDonorEmail() == null
                || donation.getDonorEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Donor email is required."
                    ));
        }

        donation.setFoodName(donation.getFoodName().trim());
        donation.setPickupLocation(
                donation.getPickupLocation().trim()
        );
        donation.setDonorEmail(
                donation.getDonorEmail().trim().toLowerCase()
        );
        donation.setStatus("AVAILABLE");

        FoodDonation savedDonation =
                donationRepository.save(donation);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message",
                        "Food donation submitted successfully!",
                        "id",
                        savedDonation.getId(),
                        "status",
                        savedDonation.getStatus()
                ));
    }

    @GetMapping
    public ResponseEntity<List<FoodDonation>> getAllDonations() {
        return ResponseEntity.ok(
                donationRepository.findAll()
        );
    }

    @GetMapping("/donor/{email}")
    public ResponseEntity<List<FoodDonation>> getDonationsByDonor(
            @PathVariable String email) {

        return ResponseEntity.ok(
                donationRepository
                        .findByDonorEmailOrderByCreatedAtDesc(
                                email.trim().toLowerCase()
                        )
        );
    }
}