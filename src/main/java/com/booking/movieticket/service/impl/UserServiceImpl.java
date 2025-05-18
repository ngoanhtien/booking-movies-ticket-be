package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.dto.request.admin.update.UserForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.UserForCreateRequest;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.dto.response.admin.create.UserCreatedResponse;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.UserMapper;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.repository.specification.UserSpecificationBuilder;
import com.booking.movieticket.service.ImageUploadService;
import com.booking.movieticket.service.UserService;
import com.booking.movieticket.util.RandomStringGenerator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    ImageUploadService imageUploadService;

    PasswordEncoder passwordEncoder;

    UserRepository userRepository;

    UserMapper userMapper;

    @Override
    public UserResponse getUserById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return userMapper.convertEntityToUserResponse(userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    @Override
    public Page<UserResponse> getAllUsers(UserCriteria userCriteria, Pageable pageable) {
        return userRepository.findAll(UserSpecificationBuilder.findByCriteria(userCriteria), pageable).map(userMapper::convertEntityToUserResponse);
    }

    @Override
    @Transactional
    public UserCreatedResponse createUser(UserForCreateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(avatarUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_IS_EXISTED);
        }
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_IS_EXISTED);
        }
        if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_IS_EXISTED);
        }
        try {
            User user = userMapper.convertRequestToUser(userRequest);
            processAndSetImages(user, avatarUrl);
            user.setIsDeleted(false);
            return userMapper.convertEntityToUserCreatedResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    @Transactional
    public void updateUser(UserForUpdateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(avatarUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            if (userRequest.getId() == null) {
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }
            if (userRepository.existsByEmail(userRequest.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_IS_EXISTED);
            }
            User user = userRepository.findById(userRequest.getId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            userMapper.updateUserFromRequest(userRequest, user);
            processAndSetImages(user, avatarUrl);
            userRepository.save(user);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    public void activateUser(Long id) {
        updateUserStatus(id, false);
    }

    @Override
    public void deactivateUser(Long id) {
        updateUserStatus(id, true);
    }

    @Override
    @Transactional
    public String resetPassword(User user) {
        String newPass = RandomStringGenerator.generateRandomString();
        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        return newPass;
    }

    @Override
    public User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public User findUserById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateImages(MultipartFile avatarUrl, BindingResult bindingResult) {
        if (avatarUrl == null || avatarUrl.isEmpty()) {
            bindingResult.rejectValue("avatarUrl", "user.avatarUrl.required", "Avatar image is required");
        }
    }

    private void processAndSetImages(User user, MultipartFile avatarUrl) throws IOException {
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            user.setAvatarUrl(imageUploadService.uploadImage(avatarUrl));
        }
    }

    private void updateUserStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (Objects.equals(user.getIsDeleted(), isDeleted)) {
            return;
        }
        user.setIsDeleted(isDeleted);
        userRepository.save(user);
    }
}
