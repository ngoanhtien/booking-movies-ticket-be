package com.booking.movieticket.service.impl;

import com.booking.movieticket.configuration.mail.MailConfig;
import com.booking.movieticket.configuration.mail.MailContent;
import com.booking.movieticket.service.MailSendService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

@Service
public class MailSendServiceImpl implements MailSendService {

    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

    @Override
    public void sendMail(String mailTo, String newPass) {
        MailConfig mailConfig = new MailConfig();
        MailContent mailContent = new MailContent();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setSubject(mailContent.getSubject());
        message.setFrom(mailConfig.getUsername());
        message.setTo(mailTo);
        String completeBody = MessageFormat.format(mailContent.getBody(), mailTo, newPass);
        message.setText(completeBody);
        mailSender.send(message);
    }
}
