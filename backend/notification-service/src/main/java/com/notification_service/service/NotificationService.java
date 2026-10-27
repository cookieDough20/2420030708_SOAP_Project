package com.notification_service.service;


import com.notification_service.dto.NotificationRequest;
import com.notification_service.entity.Notification;
import com.notification_service.repository.NotificationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }

    public Notification createNotification(
            NotificationRequest request) {

        Notification notification = new Notification();

        notification.setRecipient(
                request.getRecipient()
        );

        notification.setRecipientType(
                request.getRecipientType()
        );

        notification.setTitle(
                request.getTitle()
        );

        notification.setMessage(
                request.getMessage()
        );

        notification.setNotificationType(
                request.getNotificationType()
        );

        notification.setReferenceId(
                request.getReferenceId()
        );

        notification.setReadStatus(false);

        return notificationRepository.save(
                notification
        );
    }

    public List<Notification> getAllNotifications() {

        return notificationRepository.findAll();
    }

    public Notification getNotificationById(
            Long id) {

        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"
                        )
                );
    }

    public List<Notification> getByRecipient(
            String recipient) {

        return notificationRepository
                .findByRecipient(recipient);
    }

    public List<Notification> getUnreadNotifications(
            String recipient) {

        return notificationRepository
                .findByRecipientAndReadStatus(
                        recipient,
                        false
                );
    }

    public Notification markAsRead(Long id) {

        Notification notification =
                getNotificationById(id);

        notification.setReadStatus(true);

        return notificationRepository.save(
                notification
        );
    }

    public Notification markAsUnread(Long id) {

        Notification notification =
                getNotificationById(id);

        notification.setReadStatus(false);

        return notificationRepository.save(
                notification
        );
    }

    public void deleteNotification(Long id) {

        if (!notificationRepository.existsById(id)) {

            throw new RuntimeException(
                    "Notification not found"
            );
        }

        notificationRepository.deleteById(id);
    }
}
