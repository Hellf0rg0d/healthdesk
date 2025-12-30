package com.shrihari.axios.security;


import com.shrihari.axios.utils.roles;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Date;

@Service
public class JwtGenerator {
   private String key;
    @Autowired
    public JwtGenerator(@Value("${jwt.secret-key}") String key){

        this.key = key;
    }
    public String generate(String username, roles.ROLES role){
        return Jwts.builder().subject(username).claim("role",role.getRoleValue()).signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(key))).issuedAt(new Date()).expiration(new Date(new Date().getTime() + 12*3600*1000)).compact();
    }
    public String getJwtUsername(String token){
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(key))).build().parseSignedClaims(token).getPayload().getSubject();
    }
    public String getRole(String token){
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(key))).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }
    public boolean isValidUser(String token) {
        try {
            return new Date().before(Jwts.parser().verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(key))).build().parseSignedClaims(token).getPayload().getExpiration());
        }
        catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }
}
