package com.example.miniproject04.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    // FK: user_id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @com.fasterxml.jackson.annotation.JsonSetter("userId")
    public void setUserId(Long userId) {
        if (userId != null) {
            User ref = new User();
            ref.setUserId(userId);
            this.user = ref;
        }
    }
}