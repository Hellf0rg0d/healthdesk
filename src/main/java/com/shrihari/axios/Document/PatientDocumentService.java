package com.shrihari.axios.Document;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientDocumentService {

    @Autowired
    private PatientDocumentRepo repo;

    private static final String BASE_DIR =
            System.getProperty("user.home") + File.separator + "healthdesk" + File.separator + "assets" + File.separator + "documents" + File.separator;

    public PatientDocument saveDocument(String phoneNumber, MultipartFile file) throws IOException {
        Files.createDirectories(Paths.get(BASE_DIR));

        // Generate UUID for this file
        String uuid = UUID.randomUUID().toString();
        String filePath = BASE_DIR + File.separator + uuid + ".pdf";

        Files.write(Paths.get(filePath), file.getBytes());

        PatientDocument doc = new PatientDocument();
        doc.setPatientPhoneNumber(phoneNumber);
        doc.setUuid(uuid);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileUrl("https://cdn.codequantum.in/healthdesk/read/document/" + uuid);

        return repo.save(doc);
    }

    public List<PatientDocument> getDocumentsByPhoneNumber(String phoneNumber) {
        return repo.findAllByPatientPhoneNumber(phoneNumber);
    }
}