package com.booking.movieticket.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SocketController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public String sendMessage(String message) {
        return message;
    }


    @MessageMapping("/chat/private/{recipient}")
    public void sendPrivateMessage(@DestinationVariable String recipient, Message message) {
        messagingTemplate.convertAndSendToUser(recipient, "/queue/messages", message);
    }

}
