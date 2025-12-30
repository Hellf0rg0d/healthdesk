package com.shrihari.axios.getData;

import com.google.common.reflect.TypeToken;
import com.google.genai.Client;
import com.google.gson.Gson;
import com.shrihari.axios.security.JwtGenerator;
import com.shrihari.axios.utils.roles;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.lang.reflect.Type;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static java.net.URI.create;

@RestController
@RequestMapping("/healthdesk/send/data")
@Transactional
@CrossOrigin(origins = "*")
public class get_data {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private StringRedisTemplate redisTemplate;
    @Autowired
    Gson gson;
    Client client;
    String json, requestBodyForAudio;
    JwtGenerator JwtGenerator;

    @Autowired
    public void setJwtGenerator(JwtGenerator JwtGenerator) {
        this.JwtGenerator = JwtGenerator;
    }

    String prompt;
    String context;
    String uuid;
    HttpClient Httpclient = HttpClient.newHttpClient();

    void generate_summary(String text) {
        context = text;
        prompt = "Analyze the following medical text. Your task is to extract the symptoms, diagnosis, prescription, vitals, lifestyle advice, recommended tests, and follow-up plan. Instructions: 1. Format the entire output as a single-line JSON object without any line breaks, indentation, or extra formatting. 2. The JSON structure must exactly match the following format: {\"symptoms\": [\"item1\", \"item2\"], \"diagnosis\": [...], \"prescription\": [...], \"vitals\": [...], \"lifestyle_advice\": [...], \"tests_recommended\": [...], \"follow_up_plan\": [...]}. 3. Crucially, you must only extract information explicitly mentioned in the text. Do not infer, add, or invent any details. 4. If no information is available for a specific category in the text, use an empty array [] for that key. 5. Your response should contain ONLY the single-line JSON object and nothing else. Text to Analyze: " + text;
        System.out.println(prompt);
        client = Client.builder().apiKey("AIzaSyDzUMSA_nj1PEs9Xpm0KAmZkhy3HjFwS_0").build();
        json = client.models.generateContent("gemini-2.0-flash", prompt, null).text();

    }

    @Async
    String getText(MultipartFile audio, String meetingUuid) {

        if (audio != null && !audio.isEmpty()) {
            Path path = Paths.get(System.getProperty("user.home") + File.separator + "healthdesk" + File.separator + "assets" + File.separator + "audio" + File.separator + meetingUuid + ".wav");
            System.out.println("path : " + path.toString());
            try {
                audio.transferTo(new File(path.toString()));
                AssemblyAiRequestBody assemblyAiRequestBody = new AssemblyAiRequestBody();
                assemblyAiRequestBody.audio_url = "https://cdn.codequantum.in/healthdesk/read/audio/" + meetingUuid;
                assemblyAiRequestBody.language_detection = true;
                assemblyAiRequestBody.speech_model = "best";
                requestBodyForAudio = gson.toJson(assemblyAiRequestBody);
                HttpRequest request = HttpRequest.newBuilder().uri(create("https://api.assemblyai.com/v2/transcript")).header("authorization", "19303a6c44e64a30a69c916c41ce710c").header("content-type", "application/json").POST(HttpRequest.BodyPublishers.ofString(requestBodyForAudio)).build();
                HttpResponse<String> AssemblyAiInitialRequest = Httpclient.send(request, HttpResponse.BodyHandlers.ofString());
                Type AssemblyAiIdResponseBodyType = new TypeToken<AssemblyAiIdResponseBody>() {
                }.getType();
                AssemblyAiIdResponseBody assemblyAiIdResponseBody = gson.fromJson(AssemblyAiInitialRequest.body(), AssemblyAiIdResponseBodyType);
                Thread.sleep(Duration.ofSeconds(65));
                request = HttpRequest.newBuilder().uri(create("https://api.assemblyai.com/v2/transcript/" + assemblyAiIdResponseBody.id)).header("authorization", "19303a6c44e64a30a69c916c41ce710c").GET().build();
                HttpResponse<String> AssemblyFinalRequest = Httpclient.send(request, HttpResponse.BodyHandlers.ofString());
                Type AssemblyAiTranscriptResponseBodyType = new TypeToken<AssemblyAiTranscriptResponseBody>() {
                }.getType();
                AssemblyAiTranscriptResponseBody assemblyAiTranscriptResponseBody = gson.fromJson(AssemblyFinalRequest.body(), AssemblyAiTranscriptResponseBodyType);
                try {
                    Files.delete(path);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return (assemblyAiTranscriptResponseBody.status.equals("completed")) ? assemblyAiTranscriptResponseBody.text : "";
            } catch (Exception e) {
                e.printStackTrace();
                return "";
            }
        }
        return null;
    }

    void addPatientDetails(String patientName, String phone, String age, String gender, String bloodType, String allergies) {

        try {
            jdbcTemplate.update("insert into patients (name,phone,age,gender,bloodType,allergies) values (?,?,?,?,?,?)", patientName, phone, age, gender, bloodType, allergies);
            valid = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    String addInitialDetailsToPatientVideos(String patient_phone, String video_transcribed_text, String transcribed_text_summary, String severity, String doctor_speciality, boolean has_video) {
        try {
            ZoneId indiaZone = ZoneId.of("Asia/Kolkata");
            ZonedDateTime nowInIndia = ZonedDateTime.now(indiaZone);
            LocalDateTime localDateTimeInIndia = nowInIndia.toLocalDateTime();
            String datetime = localDateTimeInIndia.toString().replace("T", " ");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((patient_phone + datetime).getBytes(StandardCharsets.UTF_8));
            final StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                final String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            uuid = hexString.toString();
            jdbcTemplate.update("insert into patient_videos (patient_phone,video_transcribed_text,transcribed_text_summary,severity,doctor_speciality,has_video,uuid) values (?,?,?,?,?,?,?)", patient_phone, video_transcribed_text, transcribed_text_summary, severity, doctor_speciality, (has_video) ? "" : null, uuid);
            return uuid;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    void addDetailsProvidedByDoctorForThePatientVideo(String doctor_assigned, String doctor_remarks, String uuid) {
        try {
            jdbcTemplate.update("update patient_videos set doctor_assigned = ? , doctor_remarks = ? where uuid = ?", doctor_assigned, doctor_remarks, uuid);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    boolean valid = false;
    /*
    TODO a better way to implement this /patient-details isn't secured !!!
     */
    @PostMapping("/patient-details")
    Object addDetails(@RequestParam String patientName, @RequestParam String phone, @RequestParam String age, @RequestParam String gender, @RequestParam String bloodType, @RequestParam String allergies) {
        valid = false;
        addPatientDetails(patientName, phone, age, gender, bloodType, allergies);
        return new authrecord(valid);
    }

    @PostMapping("/add-details-to-patient-video")
    Object adddetailstopatientvideo(@RequestParam String patient_phone, @RequestParam String video_transcribed_text, @RequestParam String transcribed_text_summary, @RequestParam String severity, @RequestParam String doctor_speciality, @RequestParam(required = false) MultipartFile video) {
        try {
            if (video != null && video.getContentType().startsWith("video/")) {
                Path path = Paths.get(System.getProperty("user.home") + File.separator + "healthdesk" + File.separator + "assets" + File.separator + addInitialDetailsToPatientVideos(patient_phone, video_transcribed_text, transcribed_text_summary, severity, doctor_speciality, true) + ".mp4");
                video.transferTo(new File(path.toString()));
                return null;
            } else {
                addInitialDetailsToPatientVideos(patient_phone, video_transcribed_text, transcribed_text_summary, severity, doctor_speciality, false);
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @PostMapping("/add-details-provided-by-doctor-for-the-patient-video")
    Object adddetailsprovidedbydoctorforthepatientvideo(@RequestParam String doctor_assigned, @RequestParam String doctor_remarks, @RequestParam String uuid) {
        try {
            addDetailsProvidedByDoctorForThePatientVideo(doctor_assigned, doctor_remarks, uuid);
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }
    }

    @PostMapping("/conversation")
    Object get_conversation(@RequestParam String meetingUuid, @RequestParam String phnumber, @RequestParam String doctor_email, @RequestHeader String token, @RequestParam MultipartFile audio) {
        try {
            if (!JwtGenerator.getRole(token).equals(roles.ROLES.Patient.getRoleValue())) {
                valid = false;
                generate_summary(getText(audio, meetingUuid));
                Type summaryType = new TypeToken<summaryStructure>() {
                }.getType();
                summaryStructure summary = gson.fromJson(json, summaryType);
                if (summary.symptoms.isEmpty() && summary.diagnosis.isEmpty() && summary.follow_up_plan.isEmpty() && summary.lifestyle_advice.isEmpty() && summary.prescription.isEmpty() && summary.vitals.isEmpty() && summary.tests_recommended.isEmpty()) {
                    valid = false;
                    return new authrecord(valid);
                }
                json = json.replaceAll("\\\\", "\\\\\\\\");
                json = json.replaceAll("'", "\\\\'");
                context = context.replaceAll("\\\\", "\\\\\\\\");
                context = context.replaceAll("'", "\\\\'");
                System.out.println(json);
                System.out.println(context);
                System.out.println("insert into conversation_summary (context,patient_phonenumber,doctor_email_id,summary_data) values ('" + context + "', '" + phnumber + "','" + doctor_email + "', '" + json + "')");
                jdbcTemplate.execute("insert into conversation_summary (context,patient_phonenumber,doctor_email_id,summary_data) values ('" + context + "', '" + phnumber + "','" + doctor_email + "', '" + json + "')");
                valid = true;
                return new authrecord(valid);
            } else return null;
        } catch (Exception e) {
            valid = false;
            e.printStackTrace();
            return new authrecord(valid);
        }
    }
}

