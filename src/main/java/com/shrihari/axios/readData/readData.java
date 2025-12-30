package com.shrihari.axios.readData;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.shrihari.axios.getData.summaryStructure;
import com.shrihari.axios.security.JwtGenerator;
import com.shrihari.axios.utils.roles;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/healthdesk/read/data")
@Transactional
@CrossOrigin(origins = "*")
public class readData {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;
    @Autowired
    Gson gson;
    String doctor_name;
    String patientName;
    String meetUuid;
    String patientPhone, doctorSpeciality;
    List<String> patientVideoSummary, doctorSummary, severity, doctorAssigned, uuid, hasVideo;
    boolean validClaim = false;
    JwtGenerator JwtGenerator;

    @Autowired
    public void setJwtGenerator(JwtGenerator JwtGenerator) {
        this.JwtGenerator = JwtGenerator;
    }

    int length;
    int temp = 0;
    List<List<String>> symptomps, diagnosis, prescription, vitals, lifestyle_advice, tests_recommended, follow_up_plan, patient_name, patient_phone, datetime;
    String patientname, patientage, patientgender, patientbloodtype, pateintallergy;

    void get_doctor_name(String emailid) {
        jdbcTemplate.query("select name from doctor_master where email = ? ", rs -> {
            doctor_name = rs.getString(1);
        }, emailid);

    }

    void getPatientPhone(String email) {
        jdbcTemplate.query("select phone from user where email = ?", rs -> {
            patientPhone = rs.getString(1);
        }, email);


    }

    Boolean getKeyValue(String key) {
        String value = redisTemplate.opsForValue().get(key);
        return !(value == null);
    }

    void get_patient_name(String phone) {
        jdbcTemplate.query("select name from user where phone = ? ", rs -> {
            patientName = rs.getString(1);
        }, phone);

    }

    void get_meeting_id(String patientPhone, String doctorPhone, boolean isPatient) {
        jdbcTemplate.query("select meet_uuid from videocall_log where patient_phone = ? and doctor_phone = ?", rs -> {
            meetUuid = rs.getString(1);
        }, patientPhone, doctorPhone);
    }

    void get_conversation(String patient_phnumber) {
        symptomps = new ArrayList<>();
        diagnosis = new ArrayList<>();
        prescription = new ArrayList<>();
        vitals = new ArrayList<>();
        lifestyle_advice = new ArrayList<>();
        tests_recommended = new ArrayList<>();
        follow_up_plan = new ArrayList<>();
        patient_name = new ArrayList<>();
        patient_phone = new ArrayList<>();
        datetime = new ArrayList<>();
        Type summaryType = new TypeToken<summaryStructure>() {
        }.getType();

        jdbcTemplate.query("select summary_data,datetime from conversation_summary where patient_phonenumber = ?", rs -> {
            summaryStructure summary = gson.fromJson(rs.getString(1), summaryType);
            symptomps.add(summary.symptoms);
            diagnosis.add(summary.diagnosis);
            prescription.add(summary.prescription);
            vitals.add(summary.vitals);
            lifestyle_advice.add(summary.lifestyle_advice);
            tests_recommended.add(summary.tests_recommended);
            follow_up_plan.add(summary.follow_up_plan);
            System.out.println(rs.getString(2));
            datetime.add(Collections.singletonList(rs.getString(2)));

        }, patient_phnumber);

    }

    void get_patient_list(String doctor_email) {
        patient_name = new ArrayList<>();
        patient_phone = new ArrayList<>();
        diagnosis = new ArrayList<>();
        datetime = new ArrayList<>();
        Type summaryType = new TypeToken<summaryStructure>() {
        }.getType();

        jdbcTemplate.query("WITH RankedConversations AS ( SELECT cs.patient_phonenumber, p.name,  cs.summary_data, cs.datetime, ROW_NUMBER() OVER(PARTITION BY cs.patient_phonenumber ORDER BY cs.datetime DESC) as rn FROM conversation_summary AS cs LEFT JOIN patients AS p ON cs.patient_phonenumber = p.phone WHERE cs.doctor_email_id = ? )SELECT patient_phonenumber,name,summary_data,datetime FROM RankedConversations WHERE rn = 1 ORDER BY datetime DESC;", rs -> {
            patient_phone.add(Collections.singletonList(rs.getString(1)));
            patient_name.add(Collections.singletonList(rs.getString(2)));
            summaryStructure summary = gson.fromJson(rs.getString(3), summaryType);
            diagnosis.add(summary.diagnosis);
            datetime.add(Collections.singletonList(rs.getString(4)));
        }, doctor_email);
    }

    void get_patient_details(String phonenumber) {
        patientname = null;
        patientage = null;
        patientgender = null;
        patientbloodtype = null;
        pateintallergy = null;
        jdbcTemplate.query("select name,age,gender,bloodType,allergies from patients where phone = ?", rs -> {
            patientname = rs.getString(1);
            patientage = rs.getString(2);
            patientgender = rs.getString(3);
            patientbloodtype = rs.getString(4);
            pateintallergy = rs.getString(5);
        }, phonenumber);
    }

    void getPatientVideoData(String phonenumber) {
        patientVideoSummary = new ArrayList<>();
        uuid = new ArrayList<>();
        doctorSummary = new ArrayList<>();
        severity = new ArrayList<>();
        doctorAssigned = new ArrayList<>();
        hasVideo = new ArrayList<>();
        doctorSpeciality = null;
        jdbcTemplate.query("select transcribed_text_summary,severity,doctor_assigned,doctor_remarks,uuid,has_video from patient_videos where patient_phone = ?", rs -> {
            patientVideoSummary.add(rs.getString(1));
            severity.add(rs.getString(2));
            doctorSummary.add(rs.getString(4));
            doctorAssigned.add(rs.getString(3));
            uuid.add(rs.getString(5));
            hasVideo.add((rs.getString(6) != null ? "true" : "false"));
        }, phonenumber);
    }

    void getPatientVideoDetail(String video_uuid) {
        patientVideoSummary = new ArrayList<>();
        uuid = new ArrayList<>();
        doctorSummary = new ArrayList<>();
        severity = new ArrayList<>();
        doctorAssigned = new ArrayList<>();
        hasVideo = new ArrayList<>();
        doctorSpeciality = null;
        jdbcTemplate.query("select transcribed_text_summary,severity,doctor_speciality,has_video,doctor_assigned,doctor_remarks from patient_videos where uuid = ?", rs -> {
            patientVideoSummary.add(rs.getString(1));
            severity.add(rs.getString(2));
            doctorSpeciality = rs.getString(3);
            hasVideo.add((rs.getString(4) == null ? "true" : "false"));
            doctorAssigned.add((rs.getString(5) == null) ? "" : rs.getString(5));
            doctorSummary.add((rs.getString(6) == null) ? "" : rs.getString(6));
        }, video_uuid);
    }

    void getPatientVideoSummaryListView(String doctor_speciality) {
        patientVideoSummary = new ArrayList<>();
        uuid = new ArrayList<>();
        doctorSummary = new ArrayList<>();
        severity = new ArrayList<>();
        doctorAssigned = new ArrayList<>();
        hasVideo = new ArrayList<>();
        doctorSpeciality = null;
        jdbcTemplate.query("select transcribed_text_summary,severity,uuid,has_video from patient_videos where doctor_speciality = ? and doctor_assigned is null and doctor_remarks is null", rs -> {
            patientVideoSummary.add(rs.getString(1));
            severity.add(rs.getString(2));
            uuid.add(rs.getString(3));
            hasVideo.add((rs.getString(4) != null ? "true" : "false"));
        }, doctor_speciality);
    }

    @GetMapping("/get-patient-video-summary-list-view")
    Object getpatientvideosummarylistview(@RequestParam String doctorSepciality) {
        try {
            getPatientVideoSummaryListView(doctorSepciality);
            return new videoSummaryData(patientVideoSummary, doctorSummary, severity, doctorAssigned, uuid, hasVideo, doctorSpeciality);

        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/get-patient-video-detail")
    Object getpatientvideodetail(@RequestParam String videoUuid) {
        try {
            getPatientVideoDetail(videoUuid);
            return new videoSummaryData(patientVideoSummary, doctorSummary, severity, doctorAssigned, uuid, hasVideo, doctorSpeciality);

        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/get-patient-video-data")
    Object getpatientvideodata(@RequestParam String phonenumber) {
        try {
            getPatientVideoData(phonenumber);
            return new videoSummaryData(patientVideoSummary, doctorSummary, severity, doctorAssigned, uuid, hasVideo, doctorSpeciality);

        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/get-doctor-availability")
    Object getkeyvalue(@RequestParam String key) {
        try {
            if (getKeyValue(key)) {
                return HttpServletResponse.SC_FOUND;
            } else {
                return HttpServletResponse.SC_NOT_FOUND;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/doctor-name")
    Object name_doctor(@RequestParam String email, @RequestHeader String token) {
        try {
            doctor_name = null;
            get_doctor_name(email);
            if (doctor_name.isEmpty()) {
                return null;
            }
            return new detail(doctor_name);
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/patient-phone")
    Object phone_patient(@RequestParam String email, @RequestHeader String token) {


        try {
            patientPhone = null;
            getPatientPhone(email);
            if (patientPhone.isEmpty()) {
                return null;
            }
            return new detail(patientPhone);
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

        }
    }

    @GetMapping("/patient-name")
    Object name_patient(@RequestParam String email, @RequestHeader String token) {
        try {
            //  System.out.println("token = "+token);

            patientName = null;
            get_patient_name(email);
            if (patientName.isEmpty()) {
                return null;
            }
            return new detail(patientName);

        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @GetMapping("/patient/conversation")
    Object conversation(@RequestParam String patient_phnumber, @RequestHeader String token) {
        try {
            if ((JwtGenerator.getRole(token).equals(roles.ROLES.Patient.toString()) && patient_phnumber.equals(JwtGenerator.getJwtUsername(token))) || (JwtGenerator.getRole(token).equals(roles.ROLES.Doctor.toString()))) {
                get_conversation(patient_phnumber);
                return new conversation_record(symptomps, diagnosis, prescription, vitals, lifestyle_advice, tests_recommended, follow_up_plan, datetime);
            } else return HttpServletResponse.SC_UNAUTHORIZED;
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
    }

    @GetMapping("/patient-list")
    Object patientList(@RequestParam String doctor_emailid, @RequestHeader String token) {

        try {
            System.out.println(JwtGenerator.getJwtUsername(token));
            if (JwtGenerator.getRole(token).equals(roles.ROLES.Doctor.getRoleValue()) && doctor_emailid.equals(JwtGenerator.getJwtUsername(token))) {
                get_patient_list(doctor_emailid);
                return new patient_list(patient_name, patient_phone, diagnosis, datetime);
            } else return HttpServletResponse.SC_UNAUTHORIZED;
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
    }

    @GetMapping("/patient-details")
    Object pateintdetails(@RequestParam String phonenumber, @RequestHeader String token) {
        try {
            if ((JwtGenerator.getRole(token).equals(roles.ROLES.Patient.getRoleValue()) && phonenumber.equals(JwtGenerator.getJwtUsername(token))) || (JwtGenerator.getRole(token).equals(roles.ROLES.Doctor.getRoleValue()))) {
                System.out.println("hello = " + JwtGenerator.getRole(token).equals(roles.ROLES.Patient.getRoleValue()));
                get_patient_details(phonenumber);
                return new patient_details_record(patientname, patientage, patientgender, patientbloodtype, pateintallergy);
            } else return HttpServletResponse.SC_UNAUTHORIZED;
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
    }
}