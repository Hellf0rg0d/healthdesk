package com.shrihari.axios.Pharma.service;


import com.shrihari.axios.Pharma.model.Medicine;
import com.shrihari.axios.Pharma.repo.MedicineRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {
    @Autowired
    private MedicineRepo medicineRepo;

    public Medicine addMedicine(Medicine medicine) {
        return medicineRepo.save(medicine);
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepo.findAll();
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepo.findById(id);
    }

    public Medicine updateMedicine(Long id, Medicine updatedMedicine) {
        return medicineRepo.findById(id).map(medicine -> {
            medicine.setName(updatedMedicine.getName());
            medicine.setGenericName(updatedMedicine.getGenericName());
            medicine.setStrength(updatedMedicine.getStrength());
            medicine.setForm(updatedMedicine.getForm());
            medicine.setPrice(updatedMedicine.getPrice());
            medicine.setExpiryDate(updatedMedicine.getExpiryDate());
            medicine.setManufactureDate(updatedMedicine.getManufactureDate());
            return medicineRepo.save(medicine);
        }).orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    public void deleteMedicine(Long id) {
        medicineRepo.deleteById(id);
    }

    public List<Medicine> searchByName(String name) {
        return medicineRepo.findByNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(name,name);
    }
}
