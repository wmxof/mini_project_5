package com.example.miniproject04.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "generated_image")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GeneratedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imgId;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    /* 양방향일때 사용
    @OneToOne(mappedBy = "generatedImage", fetch = FetchType.LAZY)
    private Book book;*/

    // 단방향 연결
    @OneToOne
    @JoinColumn(name = "book_id")
    private Book book;

}
