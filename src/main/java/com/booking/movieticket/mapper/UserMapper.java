package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.UserRequest;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.service.RoleService;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    protected RoleService roleService;

    public abstract User toUser(UserRequest request);

    public abstract void updateUserFromRequest(UserRequest request, User user);

    public abstract UserResponse toUserResponse(User user);

    @AfterMapping
    protected void afterMapping(UserRequest request, @MappingTarget User user) {
        Role role = roleService.findRoleById(request.getRoleId());
        user.setRole(role);
        user.setIsDeleted(true);
    }
}
