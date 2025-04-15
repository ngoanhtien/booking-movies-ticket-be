package com.booking.movieticket.service;

import com.booking.movieticket.dto.business.AccountDTO;
import com.booking.movieticket.entity.User;

public interface AccountService
{
    User saveUser( AccountDTO accountDTO);
}
