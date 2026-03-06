package com.meritquest.audit;

import com.meritquest.audit.service.AuditLogService;
import com.meritquest.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    @Around("@annotation(auditLogged)")
    public Object audit(ProceedingJoinPoint joinPoint, AuditLogged auditLogged) throws Throwable {
        Object result = joinPoint.proceed();

        try {
            User user = getCurrentUser();
            String ip = getClientIp();

            // Try to extract entity ID from method arguments or result
            Long entityId = extractEntityId(joinPoint.getArgs(), result);

            auditLogService.log(
                    auditLogged.action(),
                    auditLogged.entityType(),
                    entityId,
                    user,
                    ip,
                    Map.of("method", joinPoint.getSignature().toShortString())
            );
        } catch (Exception e) {
            log.warn("Failed to create audit log: {}", e.getMessage());
        }

        return result;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xff = request.getHeader("X-Forwarded-For");
                if (xff != null && !xff.isEmpty()) {
                    return xff.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Long extractEntityId(Object[] args, Object result) {
        // Check path variable args (Long type)
        for (Object arg : args) {
            if (arg instanceof Long) return (Long) arg;
        }
        return null;
    }
}
