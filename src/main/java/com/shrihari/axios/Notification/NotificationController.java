package com.shrihari.axios.Notification;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/healthdesk/notification")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/request")
    public ResponseEntity<String> requestMedicine(
            @RequestParam String medicineName,
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return ResponseEntity.ok(notificationService.notifyPharmaciesAboutMedicine(medicineName, latitude, longitude));
    }

    @GetMapping("/{pharmacyId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(notificationService.getAllNotifications(pharmacyId));
    }
}
