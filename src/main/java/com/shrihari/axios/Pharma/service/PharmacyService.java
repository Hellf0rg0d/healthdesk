package com.shrihari.axios.Pharma.service;

import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.repo.PharmaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PharmacyService {

    @Autowired
    private PharmaRepo pharmacyRepo;

    public Pharmacy addPharmacy(Pharmacy pharmacy) {
        if (pharmacy == null || pharmacy.getEmail() == null) {
            throw new IllegalArgumentException("Pharmacy or email cannot be null");
        }
        if (pharmacyRepo.existsByEmailIgnoreCase(pharmacy.getEmail())) {
            throw new IllegalArgumentException("Pharmacy already exists with email: " + pharmacy.getEmail());
        }
        return pharmacyRepo.save(pharmacy);
    }

    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepo.findAll();
    }

    public Optional<Pharmacy> getPharmacyById(Long id) {
        return pharmacyRepo.findById(id);
    }

    public List<Pharmacy> searchPharmaciesByName(String name) {
        return pharmacyRepo.findByPharmaNameContainingIgnoreCase(name);
    }

    public Optional<Pharmacy> getPharmacyByEmail(String email){
        return pharmacyRepo.findByEmailIgnoreCase(email);
    }

}
