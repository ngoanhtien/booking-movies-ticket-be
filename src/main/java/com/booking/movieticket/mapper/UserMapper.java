package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.create.UserForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.UserForUpdateRequest;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.dto.response.admin.create.UserCreatedResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Mapping(target = "signupDevice", expression = "java(SignupDevice.valueOf(request.getSignupDevice().toUpperCase()))")
    @Mapping(target = "role", expression = "java(mapRoleId(request.getRoleId()))")
    @Mapping(target = "isConfirmed", constant = "true")
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "password", expression = "java(passwordEncoder.encode(request.getPassword()))")
    public abstract User convertRequestToUser(UserForCreateRequest request);

    public abstract void updateUserFromRequest(UserForUpdateRequest request, @MappingTarget User user);

    public abstract UserCreatedResponse convertEntityToUserCreatedResponse(User user);

    @Mapping(target = "roleName", source = "role.name")
    public abstract UserResponse convertEntityToUserResponse(User user);

    protected Role mapRoleId(Long roleId) {
        if (roleId == null) return null;
        Role role = new Role();
        role.setId(roleId);
        return role;
    }
}
