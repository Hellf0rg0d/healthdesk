package com.shrihari.axios.Pharma.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "medicines")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "genericname")
    private String genericName;

    private String strength;
    private String form;         /*tablet or syrup*/

    @Builder.Default
    @Column(name = "createdat")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expirydate")
    private Date expiryDate;

    @Column(name = "manufaturedate")
    private Date manufactureDate;
    private double price;

}

