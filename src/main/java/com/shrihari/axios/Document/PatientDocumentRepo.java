package com.shrihari.axios.Document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientDocumentRepo extends JpaRepository<PatientDocument, Long> {

    List<PatientDocument> findAllByPatientPhoneNumber(String phoneNumber);
}