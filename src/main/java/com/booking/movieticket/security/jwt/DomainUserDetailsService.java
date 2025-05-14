package com.booking.movieticket.security.jwt;

import com.booking.movieticket.entity.User;
import com.booking.movieticket.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DomainUserDetailsService implements UserDetailsService {

    UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Authentication {}", username);
        User userEntity = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        return getUserDetails(userEntity);
    }

    private UserDetails getUserDetails(User userEntity) {
        String roleName = "ROLE_" + userEntity.getRole().getName();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);
        log.debug("Creating authority with role: {}", roleName);
        
        return new DomainUserDetails(
                userEntity.getId(),
                userEntity.getUsername(),
                userEntity.getPassword(),
                Set.of(authority)
        );
    }
}