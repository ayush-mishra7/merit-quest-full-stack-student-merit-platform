package com.meritquest.merit.repository;

import com.meritquest.merit.entity.MeritConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeritConfigRepository extends JpaRepository<MeritConfig, Long> {

    Optional<MeritConfig> findByConfigKey(String configKey);

    List<MeritConfig> findByConfigKeyStartingWith(String prefix);
}
