package com.shrihari.axios.services;

import com.google.gson.Gson;

import com.shrihari.axios.dto.LogEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

@Service
public class LoggingService {

    private static final String LOG_FILE = "src/main/java/com/healthdesk/healthdesk/logs.txt";
    private final Gson gson;

    @Autowired
    public LoggingService(Gson gson) {
        this.gson = gson;
    }

    public void log(LogEntry logEntry) {
        try {
            File file = new File(LOG_FILE);
            if (!file.exists()) {
                file.createNewFile();
            }
            try (FileWriter writer = new FileWriter(file, true)) {
                writer.write(gson.toJson(logEntry) + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
