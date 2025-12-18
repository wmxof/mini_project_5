"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const { user, logout, username} = useAuth();

    const handleLogout = () => {
        if (confirm("로그아웃하시겠습니까?")) {
            logout();
            router.replace("/login");
        }
    };

    const hideCreateButton = pathname.startsWith("/books/edit");
    const hideAllButtons = pathname === "/login";

    return (
        <AppBar
            position="static"
            sx={{
                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                boxShadow: "0 6px 16px rgba(15,23,42,0.18)",
            }}
        >
            <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
                {/* 왼쪽 타이틀 */}
                <Typography
                    variant="h6"
                    // component={Link}
                    href="/"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        textDecoration: "none",
                        color: "white",
                        letterSpacing: 0.5,
                    }}
                >
                    도서관리
                </Typography>

                {/* 로그인 페이지는 오른쪽 버튼 숨김 */}
                {!hideAllButtons && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {/* 로그인 안 했을 때 */}
                        {!user && (
                            <>
                                <Button
                                    component={Link}
                                    href="/login"
                                    color="inherit"
                                    sx={{ fontWeight: 500 }}
                                >
                                    로그인
                                </Button>

                                
                                {!hideCreateButton && (
                                    <Button
                                        component={Link}
                                        href="/books/edit"
                                        variant="contained"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: "rgba(255,255,255,0.12)",
                                            "&:hover": {
                                                bgcolor: "rgba(255,255,255,0.25)",
                                            },
                                        }}
                                    >
                                        새 도서 등록
                                    </Button>
                                )}
                            </>
                        )}

                        {/* 로그인 했을 때 */}
                        {user && (
                            <>
                                <Typography sx={{ mr: 1, fontWeight: 600 }}>
                                    {username} 님
                                </Typography>

                                 {!hideCreateButton && (
                                    <Button
                                        component={Link}
                                        href="/books/edit"
                                        variant="contained"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: "rgba(255,255,255,0.15)",
                                            "&:hover": {
                                                bgcolor: "rgba(255,255,255,0.3)",
                                            },
                                        }}
                                    >
                                        새 도서 등록
                                    </Button>
                                )}

                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ fontWeight: 500 }}
                                >
                                    로그아웃
                                </Button>
                            </>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
