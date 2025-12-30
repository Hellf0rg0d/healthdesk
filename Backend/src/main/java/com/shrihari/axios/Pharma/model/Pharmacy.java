package com.shrihari.axios.Pharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pharmacies")
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "pharmaname")
    private String pharmaName;

    @Column(nullable = false)
    private String address;

    private double latitude;

    private double longitude;

    private String phone;

    @Column(name = "createdat")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private Double distanceKm;

    @Column(unique = true, length = 15)
    private String gstin;

    @Column(name = "email", nullable = false, unique = true)
    private String email;
}
