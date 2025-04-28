package com.booking.movieticket.service.impl;

import com.booking.movieticket.configuration.mail.MailConfig;
import com.booking.movieticket.configuration.mail.MailContent;
import com.booking.movieticket.service.MailSendService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
        ClassPathResource resource = new ClassPathResource( "mailtemplate/resetpassword/index.html" );
        String bodyContent = "";
        try {
            bodyContent = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Format the HTML body with parameters
//        String completeBody = MessageFormat.format(bodyContent, mailTo, newPass);

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

        try {
            // Create a MIME message instead of SimpleMailMessage to support HTML
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setSubject(mailContent.getSubject());
            helper.setFrom(mailConfig.getUsername());
            helper.setTo(mailTo);
            helper.setText(bodyContent, true); // The second parameter 'true' indicates HTML content

            mailSender.send(mimeMessage);
        } catch ( MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}