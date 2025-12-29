package com.shrihari.axios.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByPharmacy_IdEquals(Long pharmacyId);
}
