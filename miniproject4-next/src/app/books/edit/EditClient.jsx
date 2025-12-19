"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

export default function EditClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookId = searchParams.get("bookId");
  const isEditMode = useMemo(() => !!bookId, [bookId]);

  // 🔹 Dialog 상태
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    message: "",
  });

  const closeDialog = () =>
    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));

  // 🔹 로그인 체크 (alert 대신 Dialog + redirect)
  useEffect(() => {
    const user = localStorage.getItem("loginUser");
    if (!user) {
      setDialogState({
        open: true,
        title: "접근 제한",
        message: "로그인 후 이용할 수 있습니다.",
      });
      setTimeout(() => router.replace("/login"), 1000);
    }
  }, [router]);

  // 🔹 입력 상태
  const [backendIp, setBackendIp] = useState(""); // ✅ 추가: 백엔드 IP(또는 host) 변수
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("dall-e-2");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 🔹 표지 생성
  const handleGenerateCover = async () => {
    if (!title.trim() || !content.trim() || !apiKey.trim()) {
      setDialogState({
        open: true,
        title: "입력 오류",
        message: "API Key, 책 제목, 내용을 모두 입력해야 합니다.",
      });
      return;
    }

    setIsGenerating(true);
    setCoverUrl("");

    try {
      const response = await fetch("/api/cover-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ backendIp를 함께 넘김(cover-generator API Route에서 사용)
        body: JSON.stringify({ apiKey, title, content, model, backendIp }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.imageUrl) {
          setCoverUrl(result.imageUrl);
          setDialogState({
            open: true,
            title: "생성 완료",
            message: "AI 표지 생성이 완료되었습니다. 등록을 진행하세요.",
          });
        } else {
          throw new Error("서버로부터 유효한 이미지 URL을 받지 못했습니다.");
        }
      } else {
        throw new Error(result.error || "표지 생성 중 알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("표지 생성 실패:", error?.message);
      setDialogState({
        open: true,
        title: "생성 실패",
        message: error?.message || "표지 생성 요청에 실패했습니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 🔹 등록 / 수정
  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !coverUrl) {
      setDialogState({
        open: true,
        title: "필수 항목 누락",
        message: "책 제목, 내용, 표지가 모두 필요합니다.",
      });
      return;
    }

    const msg = isEditMode
      ? `도서(id: ${bookId}) 수정 요청 전송 (TODO)`
      : "새 도서 등록 요청 전송 (TODO)";

    setDialogState({
      open: true,
      title: isEditMode ? "수정 요청 완료" : "등록 요청 완료",
      message: msg,
    });

    setTimeout(() => router.push("/"), 1000);
  };

  const handleBackToList = () => router.push("/");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {isEditMode ? `도서 수정 (id: ${bookId})` : "새 도서 등록"}
        </Typography>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            OpenAI 설정
          </Typography>

          {/* ✅ 추가: 백엔드 IP/호스트 입력(원하면 숨겨도 됨) */}
          <TextField
            label="백엔드 IP/호스트 (선택)"
            placeholder="예) 15.165.xxx.xxx 또는 api.example.com"
            fullWidth
            value={backendIp}
            onChange={(e) => setBackendIp(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="API Key"
            type="password"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select value={model} onChange={(e) => setModel(e.target.value)}>
              <MenuItem value="dall-e-2">dall-e-2</MenuItem>
              <MenuItem value="dall-e-3">dall-e-3</MenuItem>
            </Select>
          </FormControl>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            도서 정보
          </Typography>

          <TextField
            label="책 제목"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="책 내용"
            fullWidth
            multiline
            minRows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleGenerateCover}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                생성 중...
              </>
            ) : (
              "AI 표지 생성"
            )}
          </Button>

          {coverUrl && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ mb: 1, fontWeight: 700 }}>생성된 표지</Typography>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="book cover"
                style={{
                  width: "100%",
                  maxWidth: 360,
                  borderRadius: 12,
                  border: "1px solid #ddd",
                }}
              />
            </Box>
          )}
        </Card>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handleBackToList}>
            목록으로
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEditMode ? "수정 저장" : "등록"}
          </Button>
        </Box>
      </Container>

      <Dialog open={dialogState.open} onClose={closeDialog}>
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogState.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>확인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
