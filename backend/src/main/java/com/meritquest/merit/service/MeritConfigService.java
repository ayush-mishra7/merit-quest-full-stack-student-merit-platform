package com.meritquest.merit.service;

import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.merit.dto.MeritConfigResponse;
import com.meritquest.merit.dto.MeritConfigUpdateRequest;
import com.meritquest.merit.entity.MeritConfig;
import com.meritquest.merit.repository.MeritConfigRepository;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeritConfigService {

    private final MeritConfigRepository configRepository;

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getWeights() {
        return configRepository.findByConfigKeyStartingWith("weight.")
                .stream()
                .collect(Collectors.toMap(MeritConfig::getConfigKey, MeritConfig::getConfigValue));
    }

    @Transactional(readOnly = true)
    public List<MeritConfigResponse> getAllConfigs() {
        return configRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeritConfigResponse updateConfig(MeritConfigUpdateRequest request, User currentUser) {
        MeritConfig config = configRepository.findByConfigKey(request.getConfigKey())
                .orElseThrow(() -> new ResourceNotFoundException("Config not found: " + request.getConfigKey()));

        config.setConfigValue(request.getConfigValue());
        config.setUpdatedBy(currentUser);
        return toResponse(configRepository.save(config));
    }

    private MeritConfigResponse toResponse(MeritConfig c) {
        return MeritConfigResponse.builder()
                .id(c.getId())
                .configKey(c.getConfigKey())
                .configValue(c.getConfigValue())
                .description(c.getDescription())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
