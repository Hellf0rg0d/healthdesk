package com.shrihari.axios.dto;

public class videoCallRequest {
    private String patientEmail;
    private String doctorEmail;
    private String meetingUuid;

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
    public String getDoctorEmail() { return doctorEmail; }
    public void setDoctorEmail(String doctorEmail) { this.doctorEmail = doctorEmail; }
    public String getMeetingUuid() { return meetingUuid; }
    public void setMeetingUuid(String meetingUuid) { this.meetingUuid = meetingUuid; }
}