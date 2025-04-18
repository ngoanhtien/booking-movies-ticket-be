package com.booking.movieticket.service;

import com.booking.movieticket.dto.business.AccountDTO;
import com.booking.movieticket.dto.filter.AccountFilterCriteria;
import com.booking.movieticket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface AccountService
{
    User saveUser( AccountDTO accountDTO );

    Page<User> findUsers( AccountFilterCriteria accountFilterCriteria, Pageable pageable );

    User findUser( Long id );

    String updateUser( AccountDTO accountDTO, MultipartFile avatar );

    void toggleAccountStatus(Long id);
}
