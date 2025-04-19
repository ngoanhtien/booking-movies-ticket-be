package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.business.UserDTO;
import com.booking.movieticket.dto.vo.UserCriteria;
import com.booking.movieticket.dto.response.UserResponse;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.UserMapper;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.repository.specification.UserSpecificationBuilder;
import com.booking.movieticket.service.RoleService;
import com.booking.movieticket.service.UserService;
import com.booking.movieticket.service.ImageUploadService;
import com.booking.movieticket.util.RandomStringGenerator;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    RoleService roleService;

    ImageUploadService imageUploadService;

    PasswordEncoder passwordEncoder;

    UserRepository userRepository;

    UserMapper userMapper;

    @Override
    public UserResponse saveUser(User user, MultipartFile imageAvatar) {
        try {
            if (user.getAvatarUrl() == null) {
                user.setAvatarUrl(imageUploadService.uploadImage(imageAvatar));
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        user.setIsDeleted(false);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public Page<User> findUsers(UserCriteria userCriteria, Pageable pageable) {
        return userRepository.findAll(UserSpecificationBuilder.findByCriteria(userCriteria), pageable);
    }

    @Override
    public User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_DUPLICATE));
    }

    @Override
    public void updateUser(User userForUpdate, MultipartFile avatar) {
        if (userForUpdate.getId() == null) {
            throw new AppException(ErrorCode.USER_DUPLICATE);
        }
        User user = userRepository.findById(userForUpdate.getId()).orElseThrow(() -> new AppException(ErrorCode.USER_DUPLICATE));
        try {
            if (userForUpdate.getAvatarUrl() == null) {
                user.setAvatarUrl(imageUploadService.uploadImage(avatar));
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.save(user);
    }

    @Override
    public void softDeleteUser(Long id) {
        User user = findUser(id);
        user.setIsDeleted(!user.getIsDeleted());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public String resetPassword(User user) {
        String newPass = RandomStringGenerator.generateRandomString();
        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        return newPass;
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_DUPLICATE));
    }
}
