//package com.booking.movieticket.controller;
//
//import com.booking.movieticket.dto.business.AccountDTO;
//import com.booking.movieticket.dto.request.AccountRequest;
//import com.booking.movieticket.entity.Role;
//import com.booking.movieticket.service.ImageUploadService;
//import jakarta.validation.Valid;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.BeanUtils;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.annotation.Validated;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.HashSet;
//import java.util.Optional;
//import java.util.Set;
//
//@RestController
//@RequestMapping("/account")
//@RequiredArgsConstructor
//@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
//@Slf4j
//@CrossOrigin(origins = "*")
//@Validated
//public class AccountController
//{
//    private ImageUploadService imageUploadService;
//
//    @PostMapping
//    public ResponseEntity<?> saveUser(@ModelAttribute @Valid AccountRequest accountRequest,
//            @RequestParam(value = "imageAvatar", required = false) MultipartFile imageAvata){
//        AccountDTO accountDTO = new AccountDTO();
//        try {
//            if (accountRequest.getAvatarUrl() == null){
//                accountRequest.setAvatarUrl(imageUploadService.uploadImage(imageAvata));
//            }
//            BeanUtils.copyProperties(accountRequest, accountDTO);
//
//            Optional<Role> role = roleRepository.findById(userRequest.getRoleId());
//            Set<Role> roles = new HashSet<>();
//            roles.add(role.get());
//            userDTO.setRoles(roles);
//        } catch (IOException e) {
//            return new ResponseEntity<>(new ErrorApiResponse(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.name(), e.getMessage()), HttpStatus.NOT_FOUND);
//        }
//        catch ( IOException e )
//        {
//            throw new RuntimeException( e );
//        }
//        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.CREATED, userService.saveUser(userDTO), "Thêm phim thành công!"), HttpStatus.CREATED);
//    }
//
//}
