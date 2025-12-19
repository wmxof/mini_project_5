"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const bookId = params.id; // /books/[id]

  // 🔹 책 정보
  const [book, setBook] = useState({ power: "" });

  // 🔹 Dialog 상태
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    message: "",
  });

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  // 🔹 상세 조회
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // user가 아직 null이면(새로고침 직후) 작성자 권한 체크가 정확히 안 될 수 있어서 대기
        // 상세 자체를 user 없이도 가져올 수 있으면 여기 조건은 빼도 됨
        if (!bookId) return;
        if (user == null) return;

        const bookRes = await axios.post(`${API_BASE_URL}/api/v1/books/check`, {
          book_id: bookId,
          user_id: user,
        });

        const imgRes = await axios.post(`${API_BASE_URL}/api/v1/image/check`, {
          book_id: bookId,
        });

        setBook((prev) => ({
          ...prev,
          ...bookRes.data,
          ...imgRes.data,
          power: bookRes.data?.power || prev.power,
        }));
      } catch (err) {
        console.error("❌ 도서 상세 조회 실패:", err);
        setDialogState({
          open: true,
          title: "조회 실패",
          message: "도서 정보를 불러오지 못했습니다.",
        });
      }
    };

    fetchDetail();
  }, [bookId, user]);

  // ✅ 삭제 API 호출 함수
  const deleteBook = async () => {
    const res = await axios.delete(`${API_BASE_URL}/api/v1/books/delete`, {
      data: {
        user_id: user,
        book_id: bookId,
      },
    });

    return res.data;
  };

  // ✅ 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const result = await deleteBook();

      setDialogState({
        open: true,
        title: "삭제 완료",
        message: result?.message || "도서가 삭제되었습니다.",
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (e) {
      console.error(e);
      setDialogState({
        open: true,
        title: "삭제 실패",
        message:
          e?.response?.data?.message ||
          "도서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
      <Header />

      <Container maxWidth={false} sx={{ maxWidth: 1400, pt: 6, pb: 8 }}>
        {/* 상단 헤더 영역 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              도서 상세 정보
            </Typography>
            <Typography variant="body2" color="text.secondary">
              생성된 표지와 책 내용을 확인하고 관리할 수 있습니다.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {book.power === "작성자" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => router.push(`/books/edit?bookId=${bookId}`)}
                >
                  수정
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* 표지 + 내용 레이아웃 */}
        <Box
          mt={3}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={3}
          alignItems="stretch"
        >
          {/* 왼쪽: 표지 영역 */}
          <Box flex={{ xs: "none", md: "0 0 32%" }}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                minHeight: 520,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
              }}
            >
              {book.image_url ? (
                <Box
                  component="img"
                  src={book.image_url}
                  alt="도서 표지"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />
              ) : (
                <Typography variant="h6" color="text.secondary">
                  표지 이미지 없음
                </Typography>
              )}
            </Paper>
          </Box>

          {/* 오른쪽: 책 내용 카드 */}
          <Box flex="1 1 0">
            <Paper
              elevation={1}
              sx={{
                borderRadius: 3,
                p: 4,
                minHeight: 520,
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                bgcolor: "white",
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight={700}>
                {book.title}
              </Typography>

              <Box
                sx={{
                  border: "1px solid rgba(148,163,184,0.6)",
                  borderRadius: 2,
                  p: 3,
                  minHeight: 320,
                  mb: 4,
                  bgcolor: "#f9fafb",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {book.description}
                </Typography>
                <Typography variant="body1">{book.contents}</Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* 뒤로가기 버튼 */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button variant="outlined" component={Link} href="/" color="primary">
            도서 목록으로 돌아가기
          </Button>
        </Box>
      </Container>

      {/* 공용 Dialog */}
      <Dialog open={dialogState.open} onClose={closeDialog}>
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogState.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
