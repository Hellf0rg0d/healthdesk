package com.shrihari.axios.Document;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/healthdesk/documents")
@RequiredArgsConstructor
public class PatientDocumentController {

    @Autowired
    private PatientDocumentService service;

    @PostMapping("/upload")
    public ResponseEntity<PatientDocument> uploadDocument(
            @RequestParam("phone") String phoneNumber,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.saveDocument(phoneNumber, file));
    }

    @GetMapping("/{phone}")
    public ResponseEntity<List<PatientDocument>> getDocuments(@PathVariable String phone) {
        return ResponseEntity.ok(service.getDocumentsByPhoneNumber(phone));
    }

}
