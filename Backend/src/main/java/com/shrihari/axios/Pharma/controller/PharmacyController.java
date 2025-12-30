package com.shrihari.axios.Pharma.controller;

import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.service.PharmacyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/healthdesk/pharmacies")
@CrossOrigin(origins = "*")
public class PharmacyController {

    @Autowired
    private PharmacyService pharmacyService;

    @PostMapping("/add")
    public ResponseEntity<?> addPharmacy(@RequestBody Pharmacy pharmacy) {
        try {
            Pharmacy saved = pharmacyService.addPharmacy(pharmacy);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("getAll")
    public ResponseEntity<List<Pharmacy>> getAllPharmacies() {
        return ResponseEntity.ok(pharmacyService.getAllPharmacies());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Pharmacy> getPharmacyById(@PathVariable Long id) {
        return pharmacyService.getPharmacyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Pharmacy>> searchPharmacies(@RequestParam String name) {
        return ResponseEntity.ok(pharmacyService.searchPharmaciesByName(name));
    }

}
