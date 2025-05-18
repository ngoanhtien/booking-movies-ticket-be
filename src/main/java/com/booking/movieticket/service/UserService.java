package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.dto.request.admin.create.UserForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.UserForUpdateRequest;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.dto.response.admin.create.UserCreatedResponse;
import com.booking.movieticket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    Page<UserResponse> getAllUsers(UserCriteria userCriteria, Pageable pageable);

    UserResponse getUserById(Long id);

    UserCreatedResponse createUser(UserForCreateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateUser(UserForUpdateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateUser(Long id);

    void deactivateUser(Long id);

    String resetPassword(User user);

    User findUser(String email);

    User findUserById(Long id);
}
