package com.example.miniproject04.service;

import com.example.miniproject04.Entity.Book;
import com.example.miniproject04.Entity.User;
import com.example.miniproject04.repository.BookRepository;
import com.example.miniproject04.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;


import java.util.List;


@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;

    /** --------------------------------------------
     * 1. 책 생성 (POST /api/v1/books)
     * -------------------------------------------- */
    @Transactional
    public Book createBook(Long userId, String title, String description) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Book book = new Book();
        book.setUser(user);
        book.setTitle(title);
        book.setDescription(description);

        return bookRepository.save(book);  // ← Controller에서 Map.of("book_id") 응답 생성
    }

    /** --------------------------------------------
     * 2. 책 단건 조회 (POST /api/v1/books/check)
     *    Controller에서 power/title/desc 구성
     * -------------------------------------------- */
    @Transactional(readOnly = true)
    public Book findBook(Long bookId) {

        return bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("삭제된 목록입니다."));
    }

    /** --------------------------------------------
     * 3. 책 목록 조회 (GET /api/v1/books/list)
     *    Controller에서 JSON 형태로 변환
     * -------------------------------------------- */
    @Transactional(readOnly = true)
    public List<Book> findBooks() {
        return bookRepository.findAll(Sort.by(Sort.Direction.DESC, "bookId"));
    }

    /** --------------------------------------------
     * 4. 책 수정 (PUT /api/v1/books/put)
     *    명세서: 제목/내용만 수정, 이미지 수정 X
     * -------------------------------------------- */
    @Transactional
    public void updateBook(Long bookId, Long userId, String title, String description, String ignoreImage) {

        Book book = findBook(bookId);

        // 권한 확인
        if (!book.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("권환 없음");
        }

        // 제목/내용 수정
        if (title != null && !title.trim().isEmpty())
            book.setTitle(title);

        if (description != null && !description.trim().isEmpty())
            book.setDescription(description);

        bookRepository.save(book);
    }

    /** --------------------------------------------
     * 5. 책 삭제 (DELETE /api/v1/books/delete/{book_id})
     * -------------------------------------------- */
//    @Transactional
//    public void deleteBook(Long bookId, Long userId) {
//
//        Book book = findBook(bookId);
//
//        // 권한 확인
//        if (!book.getUser().getUserId().equals(userId)) {
//            throw new IllegalArgumentException("권환 없음");
//        }
//
//        bookRepository.delete(book);
//    }
    @Transactional
    public void deleteBook(Long bookId, Long userId) {

        Book book = findBook(bookId);

        // 권한 확인
        if (!book.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("권환 없음");
        }

        // 1) 이미지 먼저 삭제
        imageService.deleteImageByBookId(bookId);

        // 2) 책 삭제
        bookRepository.delete(book);
    }
}
