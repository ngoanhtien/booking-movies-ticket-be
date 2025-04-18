package com.booking.movieticket.service.impl;

import ch.qos.logback.core.spi.ErrorCodes;
import com.booking.movieticket.dto.business.AccountDTO;
import com.booking.movieticket.dto.filter.AccountFilterCriteria;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.repository.specification.UserSpecificationBuilder;
import com.booking.movieticket.service.AccountService;
import com.booking.movieticket.service.ImageUploadService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults( level = AccessLevel.PRIVATE, makeFinal = true )
@Slf4j
public class AccountServiceImpl implements AccountService
{
    UserRepository userRepository;

    ImageUploadService imageUploadService;

    @Override
    public User saveUser( AccountDTO accountDTO )
    {
        if ( userRepository.existsByEmail( accountDTO.getEmail() ) )
        {
            throw new RuntimeException( "email đã tồn tại" );
        }
        User user = new User();
        BeanUtils.copyProperties( accountDTO, user );
        user.setIsEnabled( true );
        return userRepository.save( user );
    }

    @Override
    public Page<User> findUsers( AccountFilterCriteria accountFilterCriteria, Pageable pageable )
    {
        return userRepository.findAll( UserSpecificationBuilder.findByCriteria( accountFilterCriteria ), pageable );
    }

    @Override
    public User findUser( Long id )
    {
        return userRepository.findById( id ).orElseThrow( () -> new AppException( ErrorCode.RESOURCE_NOT_FOUND, "Người dùng không tồn tại" ) );
    }

    @Override
    public String updateUser( AccountDTO accountDTO, MultipartFile avatar )
    {
        if ( accountDTO.getId() == null )
        {
            throw new AppException( ErrorCode.RESOURCE_NOT_FOUND, "Chưa nhập id" );
        }
        Optional<User> user = userRepository.findById( accountDTO.getId() );
        if ( user.isEmpty() )
        {
            throw new AppException( ErrorCode.RESOURCE_NOT_FOUND, "Người dùng không tồn tại" );
        }
        try
        {
            if ( accountDTO.getAvatarUrl() == null )
            {
                accountDTO.setAvatarUrl( imageUploadService.uploadImage( avatar ) );
            }
        }
        catch ( IOException e )
        {
            log.error( "lỗi khi xử lý ảnh: {}", String.valueOf( e ) );
        }
        catch ( Exception e )
        {
            log.error( e.getMessage() );
        }
        BeanUtils.copyProperties( accountDTO, user.get() );
        userRepository.save( user.get() );
        return "Cập nhật thông tin thành công!";
    }

    @Override
    public void toggleAccountStatus( Long id )
    {
        User user = findUser( id );
        user.setIsEnabled( !user.getIsEnabled() );
        userRepository.save( user );
    }
}
