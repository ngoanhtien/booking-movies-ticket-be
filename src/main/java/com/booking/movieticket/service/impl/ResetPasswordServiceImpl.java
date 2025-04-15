package com.booking.movieticket.service.impl;

import com.booking.movieticket.entity.User;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.ResetPasswordService;
import com.booking.movieticket.util.RandomStringGenerator;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class ResetPasswordServiceImpl implements ResetPasswordService {

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public ResetPasswordServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String resetPassword(User user) {
        String newPass = RandomStringGenerator.generateRandomString();
        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        return newPass;
    }
}
