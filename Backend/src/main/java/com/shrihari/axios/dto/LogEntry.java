package com.shrihari.axios.dto;

import java.time.LocalDateTime;

public class LogEntry {
    private String error;
    private LocalDateTime time;
    private String endpoint;

    public LogEntry(String error, String endpoint) {
        this.error = error;
        this.time = LocalDateTime.now();
        this.endpoint = endpoint;
    }

    public LogEntry() {
    }

    // Getters and setters
    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }
}
