package com.shrihari.axios.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
@Order(1)
public class FilterClass implements Filter {
    JwtGenerator JwtGenerator;
    @Autowired
    public void setJwtGenerator(JwtGenerator JwtGenerator){
        this.JwtGenerator = JwtGenerator;
    }
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain){
        try {

            Pattern authPattern = Pattern.compile("/healthdesk/auth");
            Pattern logPattern = Pattern.compile("/healthdesk/logs");
            Pattern websocketConnection = Pattern.compile("/healthdesk-ws");
          HttpServletRequest httprequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setHeader("Access-Control-Allow-Origin", "*");
            httpResponse.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
            httpResponse.setHeader("Access-Control-Max-Age", "3600");
            httpResponse.setHeader("Access-Control-Allow-Headers", "authorization, content-type, token");

            if(httprequest.getMethod().equalsIgnoreCase("OPTIONS")){
                httpResponse.setStatus(HttpServletResponse.SC_OK);
                return;
            }
            else if(authPattern.matcher(httprequest.getRequestURI().toString()).find() || websocketConnection.matcher(httprequest.getRequestURI().toString()).find() || logPattern.matcher(httprequest.getRequestURI().toString()).find()){
                chain.doFilter(request,response);
            }

            else {
                if(JwtGenerator.isValidUser(httprequest.getHeader("token"))){
                    chain.doFilter(request,response);
                }
                else {
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    httpResponse.getWriter().write("Unauthorized");
                }

            }
        }
        catch (Exception e){
            e.printStackTrace();
        }
    }
}
