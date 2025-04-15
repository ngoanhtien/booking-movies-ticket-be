package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.business.AccountDTO;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.AccountService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountServiceImpl implements AccountService
{
    UserRepository userRepository;
    @Override
    public User saveUser( AccountDTO accountDTO )
    {
        if(userRepository.existsByEmail(accountDTO.getEmail())){
            throw new RuntimeException("email đã tồn tại");
        }
        User user = new User();
        BeanUtils.copyProperties(accountDTO, user);
        user.setIsEnabled( true );
        return userRepository.save( user );
    }
}
