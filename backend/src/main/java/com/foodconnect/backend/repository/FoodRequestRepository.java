
package com.foodconnect.backend.repository;

import com.foodconnect.backend.entity.FoodRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRequestRepository
        extends JpaRepository<FoodRequest, Long> {

    List<FoodRequest> findByNgoEmailOrderByCreatedAtDesc(
            String ngoEmail
    );

    boolean existsByDonationIdAndNgoEmail(
            Long donationId,
            String ngoEmail
    );
}