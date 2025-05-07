package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.admin.update.UserForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.UserForCreateRequest;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    Page<User> getAllUsers(UserCriteria userCriteria, Pageable pageable);

    User getUserById(Long id);

    UserResponse createUser(UserForCreateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateUser(UserForUpdateRequest userRequest, MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateUser(Long id);

    void deactivateUser(Long id);

    String resetPassword(User user);

    User findUser(String email);
}
