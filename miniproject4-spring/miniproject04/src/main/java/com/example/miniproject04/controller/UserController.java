package com.example.miniproject04.controller;

import com.example.miniproject04.Entity.User;
import com.example.miniproject04.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // 로그인    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> request) {

        // API 명세상 user_id:null을 포함해야 하지만,
        // User 엔티티 매핑 문제로 Controller에서는 Map으로 받아 login_id, password만 사용함.
        String loginId = (String) request.get("login_id");
        String password = (String) request.get("password");

        // 서비스에서 예외 발생 → 글로벌 핸들러가 처리
        User user = userService.login(loginId, password);

        return ResponseEntity.ok(
                Map.of("user_id", user.getUserId())
        );
    }

    //회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> request) {


        String loginId = (String) request.get("login_id");   // not null
        String password = (String) request.get("password");  // not null

        // 서비스에 회원가입 위임
        User saved = userService.signup(loginId, password);

        // 성공 시 생성된 user_id 반환 (로그인 응답과 통일)
        return ResponseEntity.ok(
                Map.of("user_id", saved.getUserId())
        );
    }
}
