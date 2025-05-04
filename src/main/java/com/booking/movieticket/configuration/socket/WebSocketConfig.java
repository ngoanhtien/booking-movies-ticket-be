package com.booking.movieticket.configuration.socket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//    @Autowired
//    private AuthChannelInterceptor authChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt một message broker đơn giản
        config.enableSimpleBroker("/receive"); // Các tin nhắn sẽ được gửi đến client qua "/receive"
        config.setApplicationDestinationPrefixes("/send"); // Client gửi tin nhắn đến server qua "/send"
        // Thiết lập prefix cho destination riêng của người dùng
        config.setUserDestinationPrefix("/private");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // Endpoint STOMP
                .setAllowedOrigins("http://localhost:5173") // Chỉ cho phép domain này
                .withSockJS(); // Sử dụng SockJS
    }

//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        // Thêm interceptor tùy chỉnh của bạn để xử lý CONNECT, SEND, ...
//        registration.interceptors(authChannelInterceptor);
//    }
}
