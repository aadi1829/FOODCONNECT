
package com.foodconnect.backend.repository;

import com.foodconnect.backend.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodDonationRepository
        extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByDonorEmailOrderByCreatedAtDesc(
            String donorEmail
    );
}