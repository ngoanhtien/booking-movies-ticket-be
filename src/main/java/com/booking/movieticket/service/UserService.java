package com.booking.movieticket.service;

import com.booking.movieticket.dto.business.UserDTO;
import com.booking.movieticket.dto.vo.UserCriteria;
import com.booking.movieticket.dto.response.UserResponse;
import com.booking.movieticket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponse saveUser(User user, MultipartFile imageAvatar);

    Page<User> findUsers(UserCriteria userCriteria, Pageable pageable);

    User findUser(Long id);

    void updateUser(User user, MultipartFile avatar);

    void softDeleteUser(Long id);

    String resetPassword(User user);

    User findUser(String email);
}
