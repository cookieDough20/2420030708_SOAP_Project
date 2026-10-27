package com.notification_service.controller;


import com.notification_service.dto.NotificationRequest;
import com.notification_service.entity.Notification;
import com.notification_service.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    @PostMapping
    public ResponseEntity<Notification>
    createNotification(
            @Valid @RequestBody
            NotificationRequest request) {

        return ResponseEntity.ok(
                notificationService
                        .createNotification(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Notification>>
    getAllNotifications() {

        return ResponseEntity.ok(
                notificationService
                        .getAllNotifications()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification>
    getNotification(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService
                        .getNotificationById(id)
        );
    }

    @GetMapping("/recipient/{recipient}")
    public ResponseEntity<List<Notification>>
    getByRecipient(
            @PathVariable String recipient) {

        return ResponseEntity.ok(
                notificationService
                        .getByRecipient(recipient)
        );
    }

    @GetMapping("/unread/{recipient}")
    public ResponseEntity<List<Notification>>
    getUnreadNotifications(
            @PathVariable String recipient) {

        return ResponseEntity.ok(
                notificationService
                        .getUnreadNotifications(recipient)
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification>
    markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(id)
        );
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<Notification>
    markAsUnread(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService
                        .markAsUnread(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteNotification(
            @PathVariable Long id) {

        notificationService
                .deleteNotification(id);

        return ResponseEntity.ok(
                "Notification deleted successfully"
        );
    }
}