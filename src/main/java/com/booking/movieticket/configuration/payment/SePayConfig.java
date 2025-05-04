package com.booking.movieticket.configuration.payment;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Getter
@Component
@Configuration
public class SePayConfig implements Serializable {

    @Value("${sepay.merchant_id}")
    private String merchantId;

    @Value("${sepay.callback_url}")
    private String callbackUrl;
}