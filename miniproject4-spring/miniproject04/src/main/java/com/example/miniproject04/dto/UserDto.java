package com.example.miniproject04.dto;

import lombok.*;

public class UserDto {

    @Getter
    @NoArgsConstructor
    public static class LoginRequest {
        private String login_id;
        private String password;
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponse {
        private Long user_id;
    }

}
