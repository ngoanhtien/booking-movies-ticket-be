package com.booking.movieticket.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ImageUploadService
{
    String uploadImage( MultipartFile file ) throws IOException;
}
