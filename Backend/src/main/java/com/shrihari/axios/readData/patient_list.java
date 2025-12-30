package com.shrihari.axios.readData;

import java.util.List;

public record patient_list(List<List<String>> patient_name, List<List<String>> patient_phnumber,List<List<String>> diagnosis,List<List<String>> last_visit) {

}