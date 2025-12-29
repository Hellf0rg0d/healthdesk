package com.shrihari.axios.Notification;


import com.shrihari.axios.Pharma.model.Medicine;
import com.shrihari.axios.Pharma.model.Pharmacy;
import com.shrihari.axios.Pharma.repo.MedicineRepo;
import com.shrihari.axios.Pharma.repo.PharmaRepo;
import com.shrihari.axios.Pharma.service.PharmaInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;
    @Autowired
    private MedicineRepo medicineRepo;
    @Autowired
    private PharmaRepo pharmacyRepo;
    @Autowired
    private PharmaInventoryService pharmaInventoryService;

    public void createNotification(Pharmacy pharmacy, Medicine medicine, String message) {
        Notification notification = new Notification();
        notification.setPharmacy(pharmacy);
        notification.setMedicine(medicine);
        notification.setMessage(message);
        notification.setReadStatus(false);
        notification.setCreatedAt(LocalDateTime.now());

        System.out.println("done");
        notificationRepo.save(notification);
    }

    public String notifyPharmaciesAboutMedicine(String medicineName, double lat, double lon) {
        Medicine medicine = medicineRepo.findByNameEqualsIgnoreCaseOrGenericNameEqualsIgnoreCase(medicineName, medicineName)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        List<Pharmacy> nearbyPharmacies = pharmacyRepo.findAll().stream()
                .peek(p -> p.setDistanceKm(pharmaInventoryService.haversine(lat, lon, p.getLatitude(), p.getLongitude())))
                .filter(p -> p.getDistanceKm() <= 20.0)
                .toList();

        for (Pharmacy p : nearbyPharmacies) {
            createNotification(
                    p,
                    medicine,
                    "Patient requested " + medicine.getName() + " in your area, please update stock if available."
            );
        }

        return "Nearby pharmacies have been notified about this request.";
    }

    public List<Notification> getAllNotifications(Long pharmacyId) {
        return notificationRepo.findByPharmacy_IdEquals(pharmacyId);
    }
}

