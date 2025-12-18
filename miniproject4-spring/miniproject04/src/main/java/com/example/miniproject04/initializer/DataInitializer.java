package com.example.miniproject04.initializer;

import com.example.miniproject04.Entity.User;
import com.example.miniproject04.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {

            // 이미 데이터가 있으면 초기 유저 생성 생략
            if (userRepository.count() == 0) {

                User admin = new User(
                        null,          // userId (자동 생성)
                        "admin",       // loginId
                        "admin1234"    // password
                );

                User guest = new User(
                        null,
                        "guest",
                        "1234"
                );

                userRepository.save(admin);
                userRepository.save(guest);

                System.out.println("✨ 초기 유저(admin, guest) 자동 생성 완료!");
            }
        };
    }
}
