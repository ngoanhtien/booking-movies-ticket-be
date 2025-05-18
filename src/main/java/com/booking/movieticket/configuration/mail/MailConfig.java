package com.booking.movieticket.configuration.mail;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Getter
@Component
@Configuration
public class MailConfig implements Serializable {

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${spring.mail.properties.mail.smtp.auth}")
    private String auth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private String tls;

    @Value("${spring.mail.transport.protocol}")
    private String protocol;
}
