package com.booking.movieticket.service.nonimpl;

import com.booking.movieticket.configuration.mail.MailConfig;
import com.booking.movieticket.configuration.mail.MailContent;
import com.booking.movieticket.service.MailSendService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class MailSendServiceImpl implements MailSendService {

    MailConfig mailConfig;

    MailContent mailContent;

    @Override
    public void sendMail(String mailTo, String newPass) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // Configure the mail sender with properties from MailConfig
        mailSender.setHost(mailConfig.getHost());
        mailSender.setPort(mailConfig.getPort());
        mailSender.setUsername(mailConfig.getUsername());
        mailSender.setPassword(mailConfig.getPassword());

        // Set additional properties
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", mailConfig.getProtocol());
        props.put("mail.smtp.auth", mailConfig.getAuth());
        props.put("mail.smtp.starttls.enable", mailConfig.getTls());

        // Create and send the message
        SimpleMailMessage message = new SimpleMailMessage();
        message.setSubject(mailContent.getSubject());
        message.setFrom(mailConfig.getUsername());
        message.setTo(mailTo);

        // Format the email body with parameters
        String completeBody = MessageFormat.format(mailContent.getBody(), mailTo, newPass);
        message.setText(completeBody);

        mailSender.send(message);
    }
}