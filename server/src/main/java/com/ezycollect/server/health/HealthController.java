package com.ezycollect.server.health;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return Map.of("status", "ok", "db", result);
    }
}
