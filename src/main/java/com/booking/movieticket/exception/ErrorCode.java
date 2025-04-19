package com.booking.movieticket.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
//    UNAUTHENTICATED(1000, "Không xác thực", HttpStatus.UNAUTHORIZED),
//    UNAUTHORIZED(1001, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
//    INVALID_CREDENTIALS(1002, "Email hoặc mật khẩu không hợp lệ!", HttpStatus.BAD_REQUEST),
//    USER_NOT_EXISTED(1003, "Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
//    GOOGLE_AUTHENTICATION_FAIL(1004, "Xác thực Google thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
//    FACEBOOK_AUTHENTICATION_FAIL(1005, "Xác thực Facebook thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
//    CLOUD_FLARE_ERROR_UPLOAD(1006, "Lỗi tải lên Cloudflare!", HttpStatus.INTERNAL_SERVER_ERROR),
//    USER_EXISTED(1007, "Người dùng đã tồn tại!", HttpStatus.BAD_REQUEST),
//    AWS_UPLOAD_FILE_ERROR(1008, "Lỗi tải tệp lên AWS!", HttpStatus.INTERNAL_SERVER_ERROR),
//    SEND_EMAIL_ERROR(1009, "Lỗi gửi email!", HttpStatus.BAD_REQUEST),
//    BAD_REQUEST(1010, "Yêu cầu không hợp lệ!", HttpStatus.BAD_REQUEST),
//    VERIFY_CODE_INVALID(1011, "Mã xác minh không hợp lệ!", HttpStatus.BAD_REQUEST),
//    PASSWORD_INVALID(1012, "Mật khẩu phải ít nhất 8 ký tự!", HttpStatus.BAD_REQUEST),
//    ACCESS_DENIED(1013, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
//    INVALID_PASSWORD(1014, "Email hoặc mật khẩu không hợp lệ!", HttpStatus.BAD_REQUEST),
//    POINT_TYPE_NOT_EXISTED(1015, "Loại điểm không tồn tại", HttpStatus.BAD_REQUEST),
//    USER_NOT_REGISTER_EMAIL(1016, "Bạn chưa đăng ký email cho tài khoản của mình, vui lòng đăng ký email", HttpStatus.BAD_REQUEST),
//    NOT_REGISTER_AUTH_FA(1017, "Bạn chưa đăng ký xác thực hai yếu tố", HttpStatus.BAD_REQUEST),
//    INVALID_USER_ID(1018, "UserId không hợp lệ", HttpStatus.BAD_REQUEST),
//    CHAT_BOT_NOT_EXITS(1019, "Chatbot không tồn tại", HttpStatus.BAD_REQUEST),
//    ACCOUNT_NOT_VERIFIED(1021, "Tài khoản chưa được xác minh", HttpStatus.BAD_REQUEST),
//    INVALID_AUTH_FA_CODE(1022, "Mã xác thực không hợp lệ", HttpStatus.BAD_REQUEST),
//    CAPTCHA_INVALID(1023, "Mã Recaptcha không hợp lệ", HttpStatus.BAD_REQUEST),
//    REFRESH_TOKEN_INVALID(1024, "Refresh token không hợp lệ", HttpStatus.BAD_REQUEST),
//    INVALID_TOKEN(1025, "Token không hợp lệ", HttpStatus.BAD_REQUEST),
//    DATE_ERROR_FORMAT(1026, "Định dạng ngày không hợp lệ", HttpStatus.BAD_REQUEST),
//    PASSWORD_MISMATCH(1028, "Mật khẩu không khớp", HttpStatus.BAD_REQUEST),
//    CLOUD_FLARE_ERROR_DELETE(1029, "Lỗi xóa trên Cloudflare!", HttpStatus.INTERNAL_SERVER_ERROR),
//    FILE_NOT_EXISTS(1030, "Tệp không tồn tại", HttpStatus.NOT_FOUND),
//    DISCOUNT_NOT_FOUND(1035, "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
//    EXPIRED_DISCOUNT(1036, "Mã giảm giá đã hết hạn", HttpStatus.BAD_REQUEST),
//    DISCOUNT_OUT_OF_STOCK(1037, "Mã giảm giá đã hết số lượng", HttpStatus.BAD_REQUEST),
//    CATEGORY_NOT_FOUND(1038, "Danh mục không tồn tại", HttpStatus.NOT_FOUND),
//    TYPE_ITEM_INVALID(1039, "Loại mục không hợp lệ", HttpStatus.BAD_REQUEST),
//    RESOURCE_NOT_FOUND(1040, "Không tìm thấy tài nguyên", HttpStatus.BAD_REQUEST),
//    ITEM_NOT_FOUND(1041, "Không tìm thấy mục", HttpStatus.NOT_FOUND),
//    FILE_SIZE_EXCEEDED(1042, "Kích thước tệp vượt quá giới hạn cho phép", HttpStatus.BAD_REQUEST),
//    INVALID_FILE_TYPE(1043, "Loại tệp không hợp lệ", HttpStatus.BAD_REQUEST),
//    EMAIL_NOT_EXISTED(1044, "Email không tồn tại", HttpStatus.BAD_REQUEST),
//    REGISTER_FAILED(1045, "Đăng ký thất bại", HttpStatus.BAD_REQUEST),
//    USERNAME_INVALID(1046, "Tên người dùng phải ít nhất 5} ký tự", HttpStatus.BAD_REQUEST),
//    INVALID_KEY(1047, "Invalid message key", HttpStatus.BAD_REQUEST);

    USER_NOT_FOUND(1000, "User không tìm thấy"),
    USER_DUPLICATE(1001, "User đã tồn tại"),
    REGISTER_FAILED(1002, "Đăng ký thất bại",HttpStatus.INTERNAL_SERVER_ERROR),
    MOVIE_NOT_FOUND(1003, "Không tìm thấy phim", HttpStatus.NOT_FOUND),
    CINEMA_NOT_FOUND(1004, "Không tìm thấy rạp phim", HttpStatus.NOT_FOUND),
    //Lỗi ko xác định
    EXCEPTION(9999, "Lỗi không xác định.");

    ErrorCode(String message) {
        this.message = message;
        this.originalMessage = message;
    }

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
        this.originalMessage = message;
    }

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.originalMessage = message;
        this.message = message;
        this.statusCode = status;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
    private final String originalMessage;

    public ErrorCode formatMessage(Object... args) {
        this.message = String.format(this.originalMessage, args);
        return this;
    }

    public String getFormattedMessage() {
        return this.message;
    }
}