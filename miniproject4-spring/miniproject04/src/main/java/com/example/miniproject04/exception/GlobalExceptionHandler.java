package com.example.miniproject04.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {

        String msg = e.getMessage();
        HttpStatus status;
        String clientMessage;

        switch (msg) {
            //User
            case "아이디 또는 비밀번호가 잘못되었습니다.":
                status = HttpStatus.UNAUTHORIZED; // 401
                clientMessage = "아이디 또는 비밀번호가 잘못되었습니다.";
                break;
            case "아이디와 비밀번호를 다시 확인해주세요.":
                // 회원가입 시 login_id 또는 password 누락/공백
                status = HttpStatus.BAD_REQUEST;           // 400
                clientMessage = "아이디와 비밀번호를 다시 확인해주세요.";
                break;
            case "이미 사용 중인 아이디입니다.":
                status = HttpStatus.BAD_REQUEST;   // 400
                clientMessage = "이미 사용 중인 아이디입니다.";
                break;
            case "존재하지 않는 사용자입니다.":
                status = HttpStatus.BAD_REQUEST;   // 400
                clientMessage = "존재하지 않는 사용자입니다.";
                break;
            //Book
            case "존재하지 않는 책입니다.":
                status = HttpStatus.NOT_FOUND;     // 404
                clientMessage = "삭제된 목록입니다.";
                break;

            case "권한이 없습니다.":
                status = HttpStatus.FORBIDDEN;     // 403
                clientMessage = "권한 없음";
                break;

            case "제목과 내용을 다시 확인":
                status = HttpStatus.BAD_REQUEST;   // 400
                clientMessage = "제목과 내용을 다시 확인";
                break;

            default:
                // 혹시 모르는 다른 IllegalArgumentException 이 들어왔을 때 최소한의 처리
                status = HttpStatus.BAD_REQUEST;
                clientMessage = msg;
                break;
        }

        return ResponseEntity.status(status)
                .body(Map.of(
                        "status", "error",
                        "message", clientMessage
                ));
    }
}
