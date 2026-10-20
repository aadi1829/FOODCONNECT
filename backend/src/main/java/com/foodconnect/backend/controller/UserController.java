
package com.foodconnect.backend.controller;

import com.foodconnect.backend.entity.User;
import com.foodconnect.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER USER

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(
            @RequestBody User user) {

        if (user.getFullName() == null
                || user.getFullName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Full name is required.");
        }

        if (user.getEmail() == null
                || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email is required.");
        }

        if (user.getPassword() == null
                || user.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body("Password must contain at least 8 characters.");
        }

        if (user.getRole() == null
                || !(user.getRole().equalsIgnoreCase("donor")
                || user.getRole().equalsIgnoreCase("ngo")
                || user.getRole().equalsIgnoreCase("volunteer"))) {
            return ResponseEntity.badRequest()
                    .body("Please select a valid role.");
        }

        String normalizedEmail =
                user.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This email is already registered.");
        }

        user.setEmail(normalizedEmail);
        user.setRole(user.getRole().toLowerCase());
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Registration successful!");
    }

    // LOGIN USER

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(
            @RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Email and password are required."
                    )
            );
        }

        User user = userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElse(null);

        if (user == null
                || !passwordEncoder.matches(
                        password, user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password."
                            )
                    );
        }

        Map<String, String> response = new HashMap<>();

        response.put("message", "Login successful!");
        response.put("role", user.getRole().toLowerCase());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}