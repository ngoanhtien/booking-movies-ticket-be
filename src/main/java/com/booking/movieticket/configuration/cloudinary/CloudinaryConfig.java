package com.booking.movieticket.configuration.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class CloudinaryConfig
{
    @Value( "${cloudinary.cloud_name}" )
    private String cloudName;

    @Value( "${cloudinary.api_key}" )
    private String apiKey;

    @Value( "${cloudinary.api_secret}" )
    private String apiSecret;

    @Value( "${cloudinary.secure}" )
    private Boolean secure;

    @Bean
    public Cloudinary cloudinary()
    {
        return new Cloudinary( ObjectUtils.asMap( "cloud_name", cloudName, "api_key", apiKey, "api_secret", apiSecret, "secure", secure ) );
    }

}
