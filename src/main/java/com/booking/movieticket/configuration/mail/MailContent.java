package com.booking.movieticket.configuration.mail;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Getter
@Configuration
@PropertySource(ignoreResourceNotFound = true, value = "classpath:mailTemplate.properties")
public class MailContent {
    @Value("${resetPasswordSubject}")
    private String subject;

    @Value("${resetPasswordBody}")
    private String body;
}
