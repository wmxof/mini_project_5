"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    success: false,
  });

  const openDialog = (title, message, success = false) => {
    setDialog({ open: true, title, message, success });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
    // ✅ 최신 success 값으로 판단하도록 prev 사용
    setDialog((prev) => {
      if (prev.success) router.replace("/");
      return prev;
    });
  };

  const handleLogin = async () => {
    // ✅ 프론트에서 최소 입력 검증(UX)
    if (!id.trim() || !pw.trim()) {
      openDialog("로그인 실패", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await login(id, pw);
      openDialog("로그인 성공", "환영합니다! 도서 목록 페이지로 이동합니다.", true);
    } catch (e) {
      // ✅ AuthContext에서 던진 에러 메시지가 있으면 그대로 사용
      openDialog("로그인 실패", e?.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
      <Header />

      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          pt: 8,
          pb: 8,
        }}
      >
        <Card
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            boxShadow: "0 14px 40px rgba(15,23,42,0.12)",
            border: "1px solid rgba(148,163,184,0.4)",
            bgcolor: "white",
          }}
        >
          <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 1 }}>
            로그인
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            도서 관리 서비스를 이용하려면 로그인해주세요.
          </Typography>

          <TextField
            fullWidth
            label="아이디"
            size="medium"
            value={id}
            onChange={(e) => setId(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            size="medium"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            sx={{ mb: 3 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{ py: 1.4, mb: 2, fontWeight: 600 }}
          >
            로그인
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push("/signup")}
            sx={{ py: 1.2, mb: 1 }}
          >
            회원가입
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => router.push("/")}
            sx={{ py: 1.1 }}
          >
            도서 목록으로 돌아가기
          </Button>
        </Card>
      </Container>

      <Dialog open={dialog.open} onClose={closeDialog}>
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialog.message}</DialogContentText>
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
