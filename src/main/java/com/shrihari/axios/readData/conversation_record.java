package com.shrihari.axios.readData;

import java.util.List;

public record conversation_record(List<List<String>> symptomps, List<List<String>> diagnosis, List<List<String>> prescription, List<List<String>> vitals, List<List<String>> lifestyle_advice, List<List<String>> tests_recommended, List<List<String>> follow_up_plan, List<List<String>> date) {

}