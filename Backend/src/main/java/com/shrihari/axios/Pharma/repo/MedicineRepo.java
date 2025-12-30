package com.shrihari.axios.Pharma.repo;


import com.shrihari.axios.Pharma.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MedicineRepo extends JpaRepository<Medicine, Long> {

    List<Medicine> findByNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(String name, String name1);
    Collection<Object> findByNameContainingIgnoreCaseOrGenericNameIgnoreCase(String medicineName, String medicineName1);
    Collection<Medicine> findByNameEqualsIgnoreCaseOrGenericNameEqualsIgnoreCase(String medicineName, String medicineName1);
}
