package com.example.miniproject04.service;

import com.example.miniproject04.Entity.User;
import com.example.miniproject04.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 로그인
    @Transactional(readOnly = true)
    public User login(String loginId, String password) {

        // 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다.")
                );

        // 비밀번호 검증
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다.");
        }

        // 로그인 성공
        return user;
    }


    // 회원 가입
    @Transactional
    public User signup(String loginId, String password) {

        // 필수값 검증
        if (loginId == null || loginId.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("아이디와 비밀번호를 다시 확인해주세요.");
        }

        // 아이디 중복 체크
        if (userRepository.findByLoginId(loginId).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // User 엔티티 생성 및 저장
        User user = new User();
        user.setLoginId(loginId);
        user.setPassword(password);

        return userRepository.save(user);
    }
    

}
