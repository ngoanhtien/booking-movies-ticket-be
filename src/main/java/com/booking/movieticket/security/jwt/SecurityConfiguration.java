package com.booking.movieticket.security.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final CorsConfigurationSource corsConfigurationSource;

    private final AuthenticationFilter authenticationFilter;

    private final ExceptionHandlingFilter exceptionHandlingFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // @formatter:off
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(managementConfigure -> managementConfigure.sessionCreationPolicy(STATELESS))
                .addFilterBefore(exceptionHandlingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(authorizationRequests -> authorizationRequests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/register").permitAll()
                        .requestMatchers("/auth/refresh-token").permitAll()
                        .requestMatchers("/auth/refresh").permitAll()
                        .requestMatchers("/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/auth/register").permitAll()
                        .requestMatchers("/api/v1/auth/refresh-token").permitAll()
                        .requestMatchers("/api/v1/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/account/resetPassword").permitAll()
                        .requestMatchers("/api/v1/payment/sepay-webhook").permitAll()
                        .requestMatchers("/api/v1/payment/**").permitAll()
                        .requestMatchers("/api/v1/payments/**").permitAll()
                        .requestMatchers("/api/v1/bookings/**").permitAll()
                        .requestMatchers("/api/v1/booking/**").permitAll()
                        .requestMatchers("/api/v1/foods/**").permitAll()
                        .requestMatchers("/api/v1/movie/**").permitAll()
                        .requestMatchers("/api/v1/cinema/**").permitAll()
                        .requestMatchers("/api/v1/showtime/*/by-date").permitAll()
                        .requestMatchers("/api/v1/showtime/*/filter").permitAll()
                        .requestMatchers("/api/v1/showtime/*/*/detail").permitAll()
                        .requestMatchers("/api/v1/showtime/public/**").permitAll()
                        .requestMatchers("/user/me").authenticated()
                        .requestMatchers("/user/**").permitAll()
                        .requestMatchers("/admin/**").permitAll()
                        .requestMatchers("/reports/**").permitAll()
                        .requestMatchers("/cinema/**").permitAll()
                        .requestMatchers("/branch/**").permitAll()
                        .requestMatchers("/invoice/**").permitAll()
                        .requestMatchers("/movie/**").permitAll()
                        .requestMatchers("/room/**").permitAll()
                        .requestMatchers("/showtime/**").permitAll()
                        .requestMatchers("/promotion/**").permitAll()
//                        .requestMatchers("/user/**").hasRole("ADMIN")
//                        .requestMatchers("/admin/**").hasRole("ADMIN")
//                        .requestMatchers("/reports/**").hasRole("ADMIN")
//                        .requestMatchers("/cinema/**").hasRole("ADMIN")
//                        .requestMatchers("/branch/**").hasRole("ADMIN")
//                        .requestMatchers("/invoice/**").hasRole("ADMIN")
//                        .requestMatchers("/movie/**").hasRole("ADMIN")
//                        .requestMatchers("/room/**").hasRole("ADMIN")
//                        .requestMatchers("/showtime/**").hasRole("ADMIN")
//                        .requestMatchers("/promotion/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )

        ;
        return http.build();
        // @formatter:on
    }
}