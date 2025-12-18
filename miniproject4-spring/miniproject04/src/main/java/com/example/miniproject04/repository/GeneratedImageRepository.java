package com.example.miniproject04.repository;

import com.example.miniproject04.Entity.Book;
import com.example.miniproject04.Entity.GeneratedImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneratedImageRepository extends JpaRepository<GeneratedImage, Long> {
    GeneratedImage findByBook(Book book);
}