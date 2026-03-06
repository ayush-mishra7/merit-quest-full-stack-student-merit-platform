package com.meritquest.notification;

import com.meritquest.user.entity.User;

/**
 * Notification service stub — will be implemented with email/push in a later phase.
 */
public interface NotificationService {
    void notifyVerificationStatusChange(User recipient, String recordType, Long recordId, String newStatus, String comment);
    void notifyBulkUploadComplete(User recipient, Long uploadId, int successRows, int failedRows);
}
