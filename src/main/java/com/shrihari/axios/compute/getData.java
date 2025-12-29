package com.shrihari.axios.compute;


import com.shrihari.axios.security.JwtGenerator;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/healthdesk/send/data")
@Transactional
@CrossOrigin("*")
public class getData {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private StringRedisTemplate redisTemplate;
    @Autowired
    JwtGenerator JwtGenerator;
    @Autowired
    public void setJwtGenerator(JwtGenerator JwtGenerator){
        this.JwtGenerator = JwtGenerator;
    }


    void setKeyValue(String key,String value){
        redisTemplate.opsForValue().set(key,value,Duration.ofMinutes(60));
    }
    void extendTTL(String key){
        try {
            redisTemplate.expire(key, Duration.ofMinutes(60));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    void removeKeyValue(String key){

        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }




    boolean valid = false;
    @PostMapping("/set-doctor-availability")
    Object setkeyvalue(@RequestParam String key,@RequestHeader String token){
        try{
            if(JwtGenerator.getJwtUsername(token).equals(key)) {
                setKeyValue(key, "Available");
                return HttpServletResponse.SC_FOUND;
            }
            else {
                 return HttpServletResponse.SC_UNAUTHORIZED;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        }

    }
    @PatchMapping("/update-doctor-availability")
    Object updatedoctoravailability(@RequestParam String key,@RequestHeader String token){
        if(JwtGenerator.getJwtUsername(token).equals(key)){
            extendTTL(key);
            return null;
        }
        else{
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
    }
    @PostMapping("/unset-doctor-availability")
    Object unsetdoctoravailability(@RequestParam String key,@RequestHeader String token){
        if(JwtGenerator.getJwtUsername(token).equals(key)){
            removeKeyValue(key);
            return null;
        }
        else{
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
    }


}
