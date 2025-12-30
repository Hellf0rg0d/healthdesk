package com.shrihari.axios.authentication;


import com.shrihari.axios.dto.LogEntry;
import com.shrihari.axios.security.JwtGenerator;
import com.shrihari.axios.services.LoggingService;
import com.shrihari.axios.utils.roles;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Properties;

@CrossOrigin("*")
@RestController
@RequestMapping("/healthdesk/auth")
public class auth {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    boolean valid;
    String _username = "";
    JwtGenerator jwtGenerator;
    String finalToken;
    @Autowired
    private LoggingService loggingService;

    @Autowired
    public void setJwtGenerator(JwtGenerator jwtGenerator) {
        this.jwtGenerator = jwtGenerator;
    }

        void checkpassword(String password, String username, String role) {
            try {
                valid = false;
                jdbcTemplate.query("select password from user where email = ? and role = ?", rs -> {
                    valid = rs.getString(1).equals(password);
                }, username, role);
                if (role.equals("01")) {
                    jdbcTemplate.query("select phone from user where email = ? and role = ?", rs -> {
                        _username = rs.getString(1);
                    }, username, role);
                } else{
                    _username = username;
                }
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in checkpassword for user: " + username + " - " + e.getMessage(), "/healthdesk/auth/check/password"));
                valid = false;
            }
        }
    
        void checkusername(String username, String role) {
            try {
                valid = false;
                jdbcTemplate.query("select count(id) from user where email = ? and role = ?", rs -> {
                    valid = rs.getString(1).equals("1");
                }, username, role);
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in checkusername for user: " + username + " - " + e.getMessage(), "/healthdesk/auth/check/email"));
                valid = false;
            }
        }
    
        void checkPhonenumber(String phonenumber) {
            try {
                valid = false;
                jdbcTemplate.query("select count(id) from user where phone = ?", rs -> {
                    valid = rs.getString(1).equals("1");
                }, phonenumber);
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in checkPhonenumber for phone: " + phonenumber + " - " + e.getMessage(), "/healthdesk/auth/check/phone"));
                valid = false;
            }
        }
    
        void createuser(String username, String name, String phone, String password) {
            valid = false;
            try {
                jdbcTemplate.update("insert into user (name,email,password,phone,role) values (?,?,?,?,'01')", name, username, password, phone);
                valid = true;
            } catch (Exception e) {
                valid = false;
                loggingService.log(new LogEntry("Error in createuser for user: " + username + " - " + e.getMessage(), "/healthdesk/auth/create/patient"));
                e.printStackTrace();
            }
        }
    
        boolean sendmail(String receivermail, String title, int otp) {
            try {
                // String html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>OTP Verification</title></head><body style=\"font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f4f4f4;\"><tr><td align=\"center\" style=\"padding: 20px 0;\"><table width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #ffffff; border-collapse: collapse; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);\"><tr><td style=\"padding: 30px;\"><h2 style=\"color: #2c3e50; margin-bottom: 20px; font-size: 24px; text-align: center;\">OTP Verification</h2>  <p style=\"color: #555; line-height: 1.6; margin-bottom: 25px;\">A One-Time Password (OTP) was requested and is shared below.</p><div style=\"background-color: #3498db; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 20px;\">"+Integer.toString(otp)+"</div></tr></table></td></tr></table></body></html>";
                String html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>OTP Verification</title></head><body style=\"font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\"> <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f4f4f4;\"> <tr> <td align=\"center\" style=\"padding: 20px 0;\"> <table width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #ffffff; border-collapse: collapse; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);\"> <tr> <td style=\"padding: 30px;\"> <h2 style=\"color: #2c3e50; margin-bottom: 20px; font-size: 24px; text-align: center;\">OTP Verification</h2>  <p style=\"color: #555; line-height: 1.6; margin-bottom: 25px;\">A One-Time Password (OTP) has been sent to your registered email address for verification.</p> <div style=\"background-color: #3498db; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 20px;\">" + Integer.toString(otp) + "</div> </p>  </td> </tr> </table> </td> </tr> </table> </body> </html>";
                Properties props = System.getProperties();
                props.put("mail.smtp.host", "smtp.gmail.com");
                props.put("mail.smtp.port", "465");
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.socketFactory.port", "465");
                props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
    
                Session session = Session.getInstance(props, new jakarta.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication("milkbazarinfo@gmail.com", "eyaa qucd plzk eper ");
                    }
                });
                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress("milkbazarinfo@gmail.com"));
                message.setRecipients(
                        Message.RecipientType.TO,
                        InternetAddress.parse(receivermail)
                );
                message.setSubject(title);
                //    message.setText(body+"\n\n<b>"+otp+"</b>\nTHIS IS AUTOGENERATED DO NOT RESPOND BACK");
                message.setContent(html, "text/html; charset=utf-8");
                Transport.send(message);
    
                System.out.println("Done");
                return true;
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in sendmail for email: " + receivermail + " - " + e.getMessage(), "/healthdesk/auth/send/email"));
                e.printStackTrace();
                return false;
            }
    
        }
    
        @GetMapping("/check/password")
        tokenRecord password(@RequestParam String email, @RequestParam String password, @RequestParam String role) {
            finalToken = "";
            try {
                checkpassword(password, email, role);
                if (valid) {
                    finalToken = jwtGenerator.generate(_username, (role.equals("01") ? roles.ROLES.Patient : (role.equals("02") ? roles.ROLES.Doctor : roles.ROLES.Pharmacist)));
                }
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error during authentication for user: " + email + " - " + e.getMessage(), "/healthdesk/auth/check/password"));
                valid = false;
            }
    
            return new tokenRecord(finalToken, valid);
        }
    
        @PostMapping("/create/patient")
        public authrecord patient(@RequestParam String name, @RequestParam String phone, @RequestParam String email, @RequestParam String password) {
            createuser(email, name, phone, password);
            return new authrecord(valid);
        }
    
        @GetMapping("/check/phone")
        public authrecord phoneNumber(@RequestParam String phonenumber) {
            checkPhonenumber(phonenumber);
            return new authrecord(valid);
        }
    
        @GetMapping("/check/email")
        public authrecord username(@RequestParam String email, @RequestParam String role) {
            checkusername(email, role);
            return new authrecord(valid);
        }
    
        @GetMapping("/send/email")
        public authrecord email(@RequestParam String email) {
            try {
                int otp = 100000 + (int) (Math.random() * (1000000 - 100000));
                jdbcTemplate.update("delete from otp where username = '" + email + "'");
                jdbcTemplate.update("insert into otp (username,otp) values ('" + email + "','" + otp + "')");
                return new authrecord(sendmail(email, "OTP", otp));
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in email for email: " + email + " - " + e.getMessage(), "/healthdesk/auth/send/email"));
                return new authrecord(false);
            }
        }
    
        @GetMapping("/check/otp/email")
        public authrecord email_otp(@RequestParam String email, @RequestParam String otp) {
            try {
                valid = false;
                jdbcTemplate.query("select otp from otp where username = '" + email + "'", rs -> {
                    valid = rs.getString(1).equals(otp);
                });
                return new authrecord(valid);
            } catch (Exception e) {
                loggingService.log(new LogEntry("Error in email_otp for email: " + email + " - " + e.getMessage(), "/healthdesk/auth/check/otp/email"));
                return new authrecord(false);
            }
        }
    @GetMapping("/version")
    public String returnVersion() {
        return "0.1";
    }
}



