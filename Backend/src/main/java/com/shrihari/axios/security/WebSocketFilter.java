package com.shrihari.axios.security;


import com.shrihari.axios.config.StompPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class WebSocketFilter implements ChannelInterceptor {
    private final JwtGenerator jwtGenerator;

    @Autowired
    public WebSocketFilter(JwtGenerator jwtGenerator) {
        this.jwtGenerator = jwtGenerator;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("token");

            if (token != null && jwtGenerator.isValidUser(token)) {
                String username = jwtGenerator.getJwtUsername(token);
                Principal userPrincipal = new StompPrincipal(username);
                accessor.setUser(userPrincipal);

            } else {
                return null;
            }
        }

        if (accessor.getUser() == null && !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return null;
        }
        return message;
    }
}