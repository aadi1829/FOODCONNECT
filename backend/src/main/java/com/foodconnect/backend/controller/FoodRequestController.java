
package com.foodconnect.backend.controller;

import com.foodconnect.backend.entity.FoodDonation;
import com.foodconnect.backend.entity.FoodRequest;
import com.foodconnect.backend.repository.FoodDonationRepository;
import com.foodconnect.backend.repository.FoodRequestRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class FoodRequestController {

    private final FoodRequestRepository requestRepository;
    private final FoodDonationRepository donationRepository;

    public FoodRequestController(
            FoodRequestRepository requestRepository,
            FoodDonationRepository donationRepository) {
        this.requestRepository = requestRepository;
        this.donationRepository = donationRepository;
    }

    // NGO submits a request for a food donation
    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody Map<String, Object> body) {

        Object donationIdValue = body.get("donationId");
        Object ngoEmailValue = body.get("ngoEmail");

        if (donationIdValue == null || ngoEmailValue == null
                || ngoEmailValue.toString().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Donation ID and NGO email are required.")
            );
        }

        Long donationId;

        try {
            donationId = Long.valueOf(donationIdValue.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid donation ID.")
            );
        }

        String ngoEmail =
                ngoEmailValue.toString().trim().toLowerCase();

        FoodDonation donation =
                donationRepository.findById(donationId).orElse(null);

        if (donation == null
                || !"AVAILABLE".equalsIgnoreCase(donation.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message",
                    "This food donation is not available.")
            );
        }

        if (requestRepository.existsByDonationIdAndNgoEmail(
                donationId, ngoEmail)) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "You have already requested this donation.")
            );
        }

        FoodRequest request = new FoodRequest();
        request.setDonationId(donationId);
        request.setNgoEmail(ngoEmail);
        request.setStatus("PENDING");

        FoodRequest savedRequest = requestRepository.save(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "message", "Food request submitted successfully!",
                "requestId", savedRequest.getId(),
                "donationId", savedRequest.getDonationId(),
                "status", savedRequest.getStatus()
            )
        );
    }

    // NGO views its own requests
    @GetMapping("/ngo/{email}")
    public ResponseEntity<List<Map<String, Object>>> getNgoRequests(
            @PathVariable String email) {

        List<FoodRequest> requests =
                requestRepository.findByNgoEmailOrderByCreatedAtDesc(
                    email.trim().toLowerCase()
                );

        List<Map<String, Object>> result = requests.stream()
            .map(request -> {
                FoodDonation donation = donationRepository
                    .findById(request.getDonationId())
                    .orElse(null);

                Map<String, Object> item = new LinkedHashMap<>();

                item.put("id", request.getId());
                item.put("donationId", request.getDonationId());
                item.put("status", request.getStatus());
                item.put("createdAt", request.getCreatedAt());

                if (donation != null) {
                    item.put("foodName", donation.getFoodName());
                    item.put("category", donation.getCategory());
                    item.put("quantity", donation.getQuantity());
                    item.put("quantityUnit", donation.getQuantityUnit());
                    item.put("pickupLocation", donation.getPickupLocation());
                    item.put("description", donation.getDescription());
                }

                return item;
            })
            .toList();

        return ResponseEntity.ok(result);
    }

    // Donor views requests received for their own donations
    @GetMapping("/donor/{email}")
    public ResponseEntity<List<Map<String, Object>>> getDonorRequests(
            @PathVariable String email) {

        String donorEmail = email.trim().toLowerCase();

        List<Map<String, Object>> result = requestRepository.findAll()
            .stream()
            .map(request -> {
                FoodDonation donation = donationRepository
                    .findById(request.getDonationId())
                    .orElse(null);

                if (donation == null
                        || donation.getDonorEmail() == null
                        || !donorEmail.equalsIgnoreCase(
                                donation.getDonorEmail())) {
                    return null;
                }

                Map<String, Object> item = new LinkedHashMap<>();

                item.put("id", request.getId());
                item.put("donationId", request.getDonationId());
                item.put("ngoEmail", request.getNgoEmail());
                item.put("status", request.getStatus());
                item.put("createdAt", request.getCreatedAt());
                item.put("foodName", donation.getFoodName());
                item.put("category", donation.getCategory());
                item.put("quantity", donation.getQuantity());
                item.put("quantityUnit", donation.getQuantityUnit());
                item.put("pickupLocation", donation.getPickupLocation());

                return item;
            })
            .filter(item -> item != null)
            .toList();

        return ResponseEntity.ok(result);
    }

    // Donor accepts or rejects an NGO request
    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {

        Object donorEmailValue = body.get("donorEmail");
        Object statusValue = body.get("status");

        if (donorEmailValue == null || statusValue == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Donor email and status are required.")
            );
        }

        String donorEmail =
                donorEmailValue.toString().trim().toLowerCase();

        String newStatus =
                statusValue.toString().trim().toUpperCase();

        if (!newStatus.equals("ACCEPTED")
                && !newStatus.equals("REJECTED")) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Status must be ACCEPTED or REJECTED.")
            );
        }

        FoodRequest request =
                requestRepository.findById(requestId).orElse(null);

        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Request not found.")
            );
        }

        FoodDonation donation = donationRepository
                .findById(request.getDonationId())
                .orElse(null);

        if (donation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Food donation not found.")
            );
        }

        if (donation.getDonorEmail() == null
                || !donorEmail.equalsIgnoreCase(
                        donation.getDonorEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message",
                    "You cannot update another donor's request.")
            );
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "This request has already been processed.")
            );
        }

        if ("ACCEPTED".equals(newStatus)
                && !"AVAILABLE".equalsIgnoreCase(donation.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "This donation is no longer available.")
            );
        }

        request.setStatus(newStatus);

        if ("ACCEPTED".equals(newStatus)) {
            donation.setStatus("ACCEPTED");
        }

        requestRepository.save(request);
        donationRepository.save(donation);

        return ResponseEntity.ok(
            Map.of(
                "message", "Request "
                    + newStatus.toLowerCase() + " successfully.",
                "requestId", request.getId(),
                "status", request.getStatus()
            )
        );
    }

    // NGO marks an accepted request as picked up or completed
    @PutMapping("/{requestId}/ngo-status")
    public ResponseEntity<?> updateNgoRequestStatus(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {

        Object ngoEmailValue = body.get("ngoEmail");
        Object statusValue = body.get("status");

        if (ngoEmailValue == null || statusValue == null
                || ngoEmailValue.toString().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "NGO email and status are required.")
            );
        }

        String ngoEmail =
                ngoEmailValue.toString().trim().toLowerCase();

        String newStatus =
                statusValue.toString().trim().toUpperCase();

        if (!newStatus.equals("PICKED_UP")
                && !newStatus.equals("COMPLETED")) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Status must be PICKED_UP or COMPLETED.")
            );
        }

        FoodRequest request =
                requestRepository.findById(requestId).orElse(null);

        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Request not found.")
            );
        }

        if (request.getNgoEmail() == null
                || !ngoEmail.equalsIgnoreCase(request.getNgoEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message",
                    "You cannot update another NGO's request.")
            );
        }

        String currentStatus = request.getStatus();

        boolean validTransition =
                ("PICKED_UP".equals(newStatus)
                        && "ACCEPTED".equalsIgnoreCase(currentStatus))
                || ("COMPLETED".equals(newStatus)
                        && "PICKED_UP".equalsIgnoreCase(currentStatus));

        if (!validTransition) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Invalid status change. Accepted requests can be "
                    + "marked picked up, and picked-up requests can be "
                    + "marked completed.")
            );
        }

        FoodDonation donation = donationRepository
                .findById(request.getDonationId())
                .orElse(null);

        if (donation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Food donation not found.")
            );
        }

        // Keep the request and its linked donation in sync.
        request.setStatus(newStatus);
        donation.setStatus(newStatus);

        requestRepository.save(request);
        donationRepository.save(donation);

        return ResponseEntity.ok(
            Map.of(
                "message", "Request and donation marked "
                    + newStatus.toLowerCase() + " successfully.",
                "requestId", request.getId(),
                "status", request.getStatus()
            )
        );
    }
}