package com.example.miniproject04.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResponseDto<T> {
    private String status;
    private String message;
    private T data;
}
