package com.booking.movieticket.configuration.socket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
@EnableWebSocketMessageBroker
@EnableScheduling
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for topics and queues, with heartbeat
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();

        config.enableSimpleBroker("/topic", "/queue")
                .setTaskScheduler(scheduler)
                .setHeartbeatValue(new long[]{10000, 10000});

        // Prefix for messages bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");

        // Prefix for user-specific messages (if needed)
        config.setUserDestinationPrefix("/user");
    }

//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        registry.addEndpoint("/api/v1/websocket")
//                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "*")
//                .withSockJS()
//                .setHeartbeatTime(10000)
//                .setDisconnectDelay(30000);
//    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/v1/websocket")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    /**
     * If using JWT over STOMP, configure interceptor to extract Authorization header
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Example: registration.interceptors(yourAuthChannelInterceptor);
    }

}
