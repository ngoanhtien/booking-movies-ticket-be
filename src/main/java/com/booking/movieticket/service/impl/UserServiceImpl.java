package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.business.UserDTO;
import com.booking.movieticket.dto.dao.UserDAOCriteria;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.repository.specification.UserSpecificationBuilder;
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
    UserRepository userRepository;
    ImageUploadService imageUploadService;
    PasswordEncoder passwordEncoder;

    @Override
    public User saveUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);
        user.setIsDeleted(true);
        return userRepository.save(user);
    }

    @Override
    public Page<User> findUsers(UserDAOCriteria userDAOCriteria, Pageable pageable) {
        return userRepository.findAll(UserSpecificationBuilder.findByCriteria(userDAOCriteria), pageable);
    }

    @Override
    public User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_DUPLICATE));
    }

    @Override
    public String updateUser(UserDTO userDTO, MultipartFile avatar) {
        if (userDTO.getId() == null) {
            throw new AppException(ErrorCode.USER_DUPLICATE);
        }
        Optional<User> user = userRepository.findById(userDTO.getId());
        if (user.isEmpty()) {
            throw new AppException(ErrorCode.USER_DUPLICATE);
        }
        try {
            if (userDTO.getAvatarUrl() == null) {
                userDTO.setAvatarUrl(imageUploadService.uploadImage(avatar));
            }
        } catch (IOException e) {
            log.error("lỗi khi xử lý ảnh: {}", String.valueOf(e));
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        BeanUtils.copyProperties(userDTO, user.get());
        userRepository.save(user.get());
        return "Cập nhật thông tin thành công!";
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
