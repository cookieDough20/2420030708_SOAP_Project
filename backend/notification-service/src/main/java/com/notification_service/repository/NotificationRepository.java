package com.notification_service.repository;


import com.notification_service.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient(
            String recipient
    );

    List<Notification> findByRecipientAndReadStatus(
            String recipient,
            Boolean readStatus
    );

    List<Notification> findByNotificationType(
            String notificationType
    );
}