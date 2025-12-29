package com.shrihari.axios.Pharma.repo;

import com.shrihari.axios.Pharma.model.Medicine;
import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.model.PharmacyInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PharmaInventoryRepo extends JpaRepository<PharmacyInventory,Long> {
    List<PharmacyInventory> findByPharmacy(Pharmacy pharmacy);

    List<PharmacyInventory> findByMedicine(Medicine medicine);

    List<PharmacyInventory> findByMedicine_NameOrMedicine_GenericNameContainingIgnoreCase(String name, String name1);

    List<PharmacyInventory> findByPharmacy_PharmaNameContainingIgnoreCase(String name);
}
