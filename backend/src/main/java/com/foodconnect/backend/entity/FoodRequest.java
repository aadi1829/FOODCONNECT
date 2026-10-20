
package com.foodconnect.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_requests")
public class FoodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donationId;

    @Column(nullable = false)
    private String ngoEmail;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FoodRequest() {
    }

    public Long getId() {
        return id;
    }

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public String getNgoEmail() {
        return ngoEmail;
    }

    public void setNgoEmail(String ngoEmail) {
        this.ngoEmail = ngoEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}