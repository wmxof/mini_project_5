package com.example.miniproject04.controller;

import com.example.miniproject04.Entity.Book;
import com.example.miniproject04.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    /** 책 생성 */
    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Map<String, Object> req) {

        Long userId = Long.valueOf(req.get("user_id").toString());
        String title = (String) req.get("title");
        String description = (String) req.get("description");

        if (title == null || title.trim().isEmpty() ||
                description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("제목과 내용을 다시 확인");
        }

        Book saved = bookService.createBook(userId, title, description);

        return ResponseEntity.ok(Map.of("book_id", saved.getBookId()));
    }

    /** 책 단건 조회 */
    @PostMapping("/check")
    public ResponseEntity<?> checkBook(@RequestBody Map<String, Object> req) {

        Long bookId = Long.valueOf(req.get("book_id").toString());
        Long userId = Long.valueOf(req.get("user_id").toString());

        Book book = bookService.findBook(bookId);

        String power = book.getUser().getUserId().equals(userId)
                ? "작성자" : "이용자";

        return ResponseEntity.ok(
                Map.of(
                        "power", power,
                        "title", book.getTitle(),
                        "description", book.getDescription()
                )
        );
    }

    /** 책 목록 조회 */
    @GetMapping("/list")
    public ResponseEntity<?> listBooks() {

        List<Book> books = bookService.findBooks();

        if (books.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "error",
                            "message", "조회할 수 있는 책이 없습니다."
                    ));
        }

        List<Map<String, Object>> data = new ArrayList<>();

        for (Book book : books) {
            Map<String, Object> item = new HashMap<>();
            item.put("book_id", book.getBookId());
            item.put("title", book.getTitle());
            item.put("description", book.getDescription());
            data.add(item);
        }

        return ResponseEntity.ok(Map.of("data", data));
    }

    /** 책 수정 */
    @PutMapping("/put")
    public ResponseEntity<?> updateBook(@RequestBody Map<String, Object> req) {

        Long bookId = Long.valueOf(req.get("book_id").toString());
        Long userId = Long.valueOf(req.get("user_id").toString());
        String title = (String) req.get("title");
        String description = (String) req.get("description");

        bookService.updateBook(bookId, userId, title, description, null);

        return ResponseEntity.ok().build();
    }

    //책 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteBook(@RequestBody Map<String, Object> req) {

        Long bookId = Long.valueOf(req.get("book_id").toString());
        Long userId = Long.valueOf(req.get("user_id").toString());

        bookService.deleteBook(bookId, userId);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "삭제되었습니다."
                )
        );
    }


}
