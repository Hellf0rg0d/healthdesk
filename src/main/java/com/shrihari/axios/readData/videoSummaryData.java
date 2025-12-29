package com.shrihari.axios.readData;

import java.util.List;

public record videoSummaryData(List<String> patientVideoSummary,List<String> doctorSummary,List<String> severity,List<String> doctorAssigned,List<String> uuid,List<String> hasVideo,String doctorSpeciality) {
}
