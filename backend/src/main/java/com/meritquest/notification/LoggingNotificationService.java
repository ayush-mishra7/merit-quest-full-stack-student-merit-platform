package com.meritquest.notification;

import com.meritquest.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingNotificationService implements NotificationService {

    @Override
    public void notifyVerificationStatusChange(User recipient, String recordType, Long recordId, String newStatus, String comment) {
        log.info("NOTIFICATION: Verification {} for {} #{} → {} (to: {})",
                newStatus, recordType, recordId, comment != null ? comment : "", recipient.getEmail());
    }

    @Override
    public void notifyBulkUploadComplete(User recipient, Long uploadId, int successRows, int failedRows) {
        log.info("NOTIFICATION: Bulk upload #{} complete — {} success, {} failed (to: {})",
                uploadId, successRows, failedRows, recipient.getEmail());
    }
}
