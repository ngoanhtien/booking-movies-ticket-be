package com.booking.movieticket.configuration.socket;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableWebSocketMessageBroker
@EnableScheduling
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//    @Autowired
//    private AuthChannelInterceptor authChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable and configure heart beats to maintain connection
        config.enableSimpleBroker("/topic", "/receive", "/queue")
            .setHeartbeatValue(new long[] {10000, 10000})
            .setTaskScheduler(heartBeatScheduler());
            
        config.setApplicationDestinationPrefixes("/send", "/app"); // Client gửi tin nhắn đến server qua "/send" or "/app"
        // Thiết lập prefix cho destination riêng của người dùng
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Allow connections from frontend domains
        registry.addEndpoint("/ws", "/api/v1/websocket") // Multiple endpoints for flexibility
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000", "*") // Add production URLs in real env
                .withSockJS()
                .setDisconnectDelay(30 * 1000) // 30 seconds disconnect delay
                .setHeartbeatTime(10000); // 10 second heartbeat
    }

    @Bean
    public TaskScheduler heartBeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-scheduler-");
        return scheduler;
    }

//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        // Thêm interceptor tùy chỉnh của bạn để xử lý CONNECT, SEND, ...
//        registration.interceptors(authChannelInterceptor);
//    }
}