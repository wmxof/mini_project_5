// src/app/api/signup/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// 기본 백엔드 주소(환경변수 우선)
// - 서버 전용이면 NEXT_PUBLIC 말고 BACKEND_BASE_URL 같은 이름 권장
const DEFAULT_BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

// 간단 검증: IPv4 또는 도메인(호스트명) 허용
function isValidHost(host) {
  if (typeof host !== "string") return false;
  const h = host.trim();

  // IPv4
  const ipv4 =
    /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  // 도메인/호스트명(원하면 더 엄격히)
  const hostname =
    /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)*[a-zA-Z0-9-]{1,63}$/;

  return ipv4.test(h) || hostname.test(h);
}

function buildBackendBaseUrl({ backendIp, backendHost, backendPort }) {
  // body에서 backendIp 또는 backendHost로 받도록 둘 다 지원
  const host = (backendIp || backendHost || "").trim();

  if (!host) return DEFAULT_BACKEND_BASE_URL;

  if (!isValidHost(host)) {
    // 검증 실패 시 400
    throw Object.assign(new Error("INVALID_BACKEND_HOST"), { statusCode: 400 });
  }

  const port = backendPort ? String(backendPort).trim() : "8080";
  if (!/^\d{2,5}$/.test(port)) {
    throw Object.assign(new Error("INVALID_BACKEND_PORT"), { statusCode: 400 });
  }

  // 필요하면 https로 바꿔도 됨
  return `http://${host}:${port}`;
}

export async function POST(request) {
  try {
    // 프론트에서 온 값: { loginId, password, backendIp? | backendHost?, backendPort? }
    const body = await request.json();

    const BACKEND_BASE_URL = buildBackendBaseUrl({
      backendIp: body.backendIp,       // ✅ 여기로 IP 받기
      backendHost: body.backendHost,   // (옵션) 호스트명도 지원
      backendPort: body.backendPort,   // (옵션) 포트 변경 지원
    });

    const payload = {
      user_id: null,
      login_id: body.loginId,
      password: body.password,
    };

    const res = await axios.post(
      `${BACKEND_BASE_URL}/api/v1/users/signup`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const forcedStatus = error.statusCode; // 위에서 던진 400 등

    console.error(
      "signup proxy error:",
      forcedStatus || error.response?.status,
      error.response?.data || error.message
    );

    const status = forcedStatus || error.response?.status || 500;

    const message =
      status === 400
        ? "백엔드 주소(IP/호스트/포트)가 올바르지 않습니다."
        : (error.response?.data?.message ||
          (status === 404
            ? "아이디와 비밀번호를 다시 확인해주세요."
            : "백엔드 통신 중 오류가 발생했습니다."));

    return NextResponse.json({ message }, { status });
  }
}
