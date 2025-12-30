package com.shrihari.axios.Pharma.repo;


import com.shrihari.axios.Pharma.model.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmaRepo extends JpaRepository<Pharmacy,Long> {

    boolean existsByEmailIgnoreCase(String email);
    List<Pharmacy> findByPharmaNameContainingIgnoreCase(String name);
    Optional<Pharmacy> findByEmailIgnoreCase(String email);
}
