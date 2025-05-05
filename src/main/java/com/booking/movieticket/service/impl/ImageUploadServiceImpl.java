package com.booking.movieticket.service.impl;

import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.service.ImageUploadService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ImageUploadServiceImpl implements ImageUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }

        try {
            long startTime = System.currentTimeMillis();
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "auto");

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            long endTime = System.currentTimeMillis();

            String imageUrl = uploadResult.get("url").toString();

            if (imageUrl == null || imageUrl.isEmpty()) {
                throw new IOException("Failed to get URL from upload result");
            }
            return imageUrl;

        } catch (IOException e) {
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

}
