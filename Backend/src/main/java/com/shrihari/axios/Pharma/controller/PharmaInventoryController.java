package com.shrihari.axios.Pharma.controller;


import com.shrihari.axios.Pharma.model.Medicine;
import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.model.PharmacyInventory;
import com.shrihari.axios.Pharma.service.MedicineService;
import com.shrihari.axios.Pharma.service.PharmaInventoryService;
import com.shrihari.axios.Pharma.service.PharmacyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("healthdesk/inventory")
@CrossOrigin(origins = "*")
public class PharmaInventoryController {

    @Autowired
    private PharmaInventoryService inventoryService;

    @Autowired
    private PharmacyService pharmacyService;

    @Autowired
    private MedicineService medicineService;

    @PostMapping("/alterStock")
    public ResponseEntity<PharmacyInventory> addOrUpdateInventory(
            @RequestParam String email,
            @RequestParam Long medicineId,
            @RequestParam int stock) {

        Pharmacy pharmacy = pharmacyService.getPharmacyByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        Medicine medicine = medicineService.getMedicineById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        PharmacyInventory inventory = PharmacyInventory.builder()
                .pharmacy(pharmacy)
                .medicine(medicine)
                .stock(stock)
                .build();

        return ResponseEntity.ok(inventoryService.addOrUpdateInventory(inventory));
    }


    @GetMapping("/pharmacy/{email}")
    public ResponseEntity<List<PharmacyInventory>> getInventoryByPharmacy(@PathVariable String email) {
        Pharmacy pharmacy = pharmacyService.getPharmacyByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        return ResponseEntity.ok(inventoryService.getInventoryByPharmacy(pharmacy));
    }


    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<PharmacyInventory>> getInventoryByMedicine(@PathVariable Long medicineId) {
        Medicine medicine = medicineService.getMedicineById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        return ResponseEntity.ok(inventoryService.getInventoryByMedicine(medicine));
    }

    @GetMapping("/medicine")
    public ResponseEntity<List<PharmacyInventory>> getInventoryByMedicineName(@RequestParam String name){
        return ResponseEntity.ok(inventoryService.getInventoryByMedicineName(name));
    }

    @GetMapping("/pharmacy")
    public ResponseEntity<List<PharmacyInventory>> getInventoryByPharmacyName(@RequestParam String name){
        return ResponseEntity.ok(inventoryService.getInventoryByPharmacyName(name));
    }

    @GetMapping("/nearest")
    public ResponseEntity<List<PharmacyInventory>> getNearestPharmacies(
            @RequestParam String medicineName,
            @RequestParam double lat,
            @RequestParam double lon) {

        return ResponseEntity.ok(
                inventoryService.findNearestPharmaciesWithMedicine(medicineName, lat, lon)
        );
    }
}
