package com.shrihari.axios.Pharma.service;

import com.shrihari.axios.Pharma.model.Medicine;
import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.model.PharmacyInventory;
import com.shrihari.axios.Pharma.repo.MedicineRepo;
import com.shrihari.axios.Pharma.repo.PharmaInventoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class PharmaInventoryService {

    @Autowired
    private PharmaInventoryRepo inventoryRepo;

    @Autowired
    private MedicineRepo medicineRepo;

    public PharmacyInventory addOrUpdateInventory(PharmacyInventory inventory) {
        inventory.setUpdatedAt(java.time.LocalDateTime.now());
        return inventoryRepo.save(inventory);
    }

    public List<PharmacyInventory> getInventoryByPharmacy(Pharmacy pharmacy) {
        return inventoryRepo.findByPharmacy(pharmacy);
    }

    public List<PharmacyInventory> getInventoryByMedicine(Medicine medicine) {
        return inventoryRepo.findByMedicine(medicine);
    }

    public List<PharmacyInventory> findNearestPharmaciesWithMedicine(String medicineName, double lat, double lon) {
        Medicine medicine = (Medicine) medicineRepo.findByNameContainingIgnoreCaseOrGenericNameIgnoreCase(medicineName, medicineName)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        // check stock
        List<PharmacyInventory> inventories = inventoryRepo.findByMedicine(medicine)
                .stream()
                .filter(inv -> inv.getStock() > 0)
                .toList();

        inventories.forEach(inv -> {
            double dist = haversine(lat, lon, inv.getPharmacy().getLatitude(), inv.getPharmacy().getLongitude());
            inv.getPharmacy().setDistanceKm(dist);
        });

        //filter range and sort
        return inventories.stream()
                .filter(inv -> inv.getPharmacy().getDistanceKm() <= 20.0)
                .sorted(Comparator.comparingDouble(inv -> inv.getPharmacy().getDistanceKm()))
                .toList();
    }


    // (Haversine Formula)
    public double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    public List<PharmacyInventory> getInventoryByMedicineName(String name) {
        return inventoryRepo.findByMedicine_NameOrMedicine_GenericNameContainingIgnoreCase(name,name);
    }

    public List<PharmacyInventory> getInventoryByPharmacyName(String name) {
        return inventoryRepo.findByPharmacy_PharmaNameContainingIgnoreCase(name);
    }
}
