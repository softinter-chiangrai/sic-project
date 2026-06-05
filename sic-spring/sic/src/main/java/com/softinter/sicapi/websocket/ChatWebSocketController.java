package com.softinter.sicapi.websocket;

import com.softinter.sicapi.dto.request.ChatMessageRequest;
import com.softinter.sicapi.dto.response.ChatMessageResponse;
import com.softinter.sicapi.entity.su.SuChatLog;
import com.softinter.sicapi.entity.enums.ChatMessageType; // นำเข้า Enum ตัวใหม่
import com.softinter.sicapi.repository.su.SuChatLogRepository;
import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SuChatLogRepository chatLogRepository;
    private final CurrentUserService currentUserService;

    @MessageMapping("/chat/private")
    public void sendPrivateMessage(@Payload ChatMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        // 1. สร้างวัตถุและแมปค่าเข้าสู่ Entity (SuChatLog)
        SuChatLog chatLog = new SuChatLog();
        chatLog.setSenderId(currentUserId);
        chatLog.setReceiverId(request.getReceiverId());
        chatLog.setMessage(request.getMessage());
        
        // แปลง String เป็น Enum แบบที่คุณต้องการ (พร้อมเช็คป้องกันกรณีหน้าบ้านส่ง null)
           chatLog.setMessageType(request.getMessageType() != null 
        ? request.getMessageType() 
        : ChatMessageType.TEXT);
    
        chatLog = chatLogRepository.save(chatLog);

        // หมายเหตุ: เอา setSenderName, setIsRead, และ setIsActive ออกแล้วเพราะไม่มีใน Entity ตัวล่าสุดครับ

        // บันทึกลงฐานข้อมูลเพื่อรับ ID และข้อมูลระบบมาใช้งานต่อ
        chatLog = chatLogRepository.save(chatLog);

        // 2. แมปค่าจาก Entity และตัวแปรระบบส่งกลับไปให้หน้าบ้านผ่าน Response DTO
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(chatLog.getId());
        response.setSenderId(currentUserId);
        response.setSenderName(currentUsername); // หน้าบ้านยังได้ชื่อผู้ส่งตามเดิมผ่าน DTO ตัวนี้ครับ
        response.setReceiverId(request.getReceiverId());
        response.setMessage(request.getMessage());
        response.setMessageType(request.getMessageType()); // ส่งรูปแบบ String คืนไปให้หน้าบ้านอ่านง่ายๆ
        response.setRead(false);
        response.setCreatedDate(chatLog.getCreatedDate());

        // 3. ส่งข้อความออกผ่าน WebSocket คิวของ User ปลายทาง
        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
    }
}