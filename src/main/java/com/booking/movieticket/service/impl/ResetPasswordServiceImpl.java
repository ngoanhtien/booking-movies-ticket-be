package com.booking.movieticket.service.impl;

import com.booking.movieticket.entity.User;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.ResetPasswordService;
import com.booking.movieticket.utils.RandomStringGenerator;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Transactional
public class ResetPasswordServiceImpl implements ResetPasswordService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    public ResetPasswordServiceImpl(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public String resetPassword(User user) {
        String newPass = RandomStringGenerator.generateRandomString();
        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        return newPass;
    }
}
