package com.booking.movieticket.service;

import com.booking.movieticket.dto.business.UserDTO;
import com.booking.movieticket.dto.dao.UserDAOCriteria;
import com.booking.movieticket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    User saveUser(UserDTO userDTO);

    Page<User> findUsers(UserDAOCriteria userDAOCriteria, Pageable pageable);

    User findUser(Long id);

    String updateUser(UserDTO userDTO, MultipartFile avatar);

    void softDeleteUser(Long id);

    String resetPassword(User user);

    User findUserByEmail(String email);
}
