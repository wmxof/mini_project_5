// Next.js App Router API Route
// app/api/cover-generator/route.jsx

import { NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

function isValidHost(host) {
  if (typeof host !== "string") return false;
  const h = host.trim();

  // IPv4
  const ipv4 =
    /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  // hostname/domain (원하면 더 엄격히 가능)
  const hostname =
    /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)*[a-zA-Z0-9-]{1,63}$/;

  return ipv4.test(h) || hostname.test(h);
}

function buildBackendBaseUrl({ backendIp, backendHost, backendPort }) {
  const host = (backendIp || backendHost || "").trim();
  if (!host) return DEFAULT_BACKEND_BASE_URL;

  if (!isValidHost(host)) {
    const err = new Error("INVALID_BACKEND_HOST");
    err.statusCode = 400;
    throw err;
  }

  const port = backendPort ? String(backendPort).trim() : "8080";
  if (!/^\d{2,5}$/.test(port)) {
    const err = new Error("INVALID_BACKEND_PORT");
    err.statusCode = 400;
    throw err;
  }

  return `http://${host}:${port}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey, title, content, model } = body;

    if (!apiKey || !title || !content || !model) {
      return NextResponse.json(
        { error: "API Key, 책 제목, 책 내용, 모델은 필수입니다." },
        { status: 400 }
      );
    }

    // ✅ 요청에서 IP/호스트/포트(옵션) 받아서 백엔드 주소 생성
    const BACKEND_BASE_URL = buildBackendBaseUrl({
      backendIp: body.backendIp,
      backendHost: body.backendHost,
      backendPort: body.backendPort,
    });

    const openaiUrl = "https://api.openai.com/v1/images/generations";

    const size = model === "dall-e-3" ? "1024x1792" : "1024x1024";
    const quality = model === "dall-e-3" ? "standard" : undefined;

    const finalPrompt = `
A professional, minimalist book cover illustration. 
The scene depicts: [${content}] with the atmosphere matching the title: [${title}].
The subject focus should be clear and realistic and must reflect the description.

CRITICAL INSTRUCTIONS: Do not generate any text, letters, numbers, symbols, or logos anywhere in the image.
The entire image must be a visual illustration only.
    `.trim();

    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: finalPrompt,
        n: 1,
        size,
        ...(quality ? { quality } : {}),
        response_format: "url",
      }),
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      console.error("OpenAI API Error:", data?.error || data);
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI API 호출에 실패했습니다." },
        { status: response.status }
      );
    }

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // ✅ 1) 생성된 이미지 URL을 'IP 기반 백엔드 주소'로 저장 API 호출
    try {
      const saveResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      if (!saveResponse.ok) {
        const errText = await saveResponse.text().catch(() => "");
        console.error("Failed to save image URL to backend:", saveResponse.status, errText);
      }
    } catch (e) {
      console.error("Error sending image URL to backend:", e);
    }

    // ✅ 2) 프론트로 결과 반환
    return NextResponse.json({ imageUrl });
  } catch (error) {
    const status = error.statusCode || 500;

    if (status === 400) {
      return NextResponse.json(
        { error: "백엔드 주소(IP/호스트/포트)가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    console.error("Server processing error:", error);
    return NextResponse.json(
      { error: "서버에서 요청을 처리하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
