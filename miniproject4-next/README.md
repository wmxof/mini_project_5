📚 Mini Project 04 – Book Generation Service Frontend (Next.js)

Spring Boot로 만든 책 생성 백엔드와 연동되는
Next.js + MUI 기반 도서 관리 & AI 표지 생성 프론트엔드 프로젝트입니다.

사용자는 회원가입/로그인을 통해 도서(Book)를 등록하고,
OpenAI(DALL·E)를 이용해 AI 표지 이미지를 생성한 후,
생성된 이미지를 책과 연결해 관리할 수 있습니다.

# 🛠️ 기술 스택

Next.js (App Router)
React
Material UI (MUI)
Axios
Context API (AuthContext)
OpenAI DALL·E API (이미지 생성)
환경변수 기반 백엔드 연동 (NEXT_PUBLIC_BACKEND_URL, BACKEND_URL)

---

# 🧱 폴더 / 파일 구조 (주요)
src/app
│
├── page.jsx                      # 메인 도서 목록 페이지
│
├── api
│   ├── cover-generator
│   │   └── route.jsx             # OpenAI DALL·E 표지 생성 API Route
│   └── signup
│       └── route.js              # 회원가입 백엔드 연동용 API Route
│
├── books
│   ├── [id]
│   │   └── page.jsx              # 도서 상세 페이지
│   └── edit
│       └── page.jsx              # 도서 등록 / 수정 + AI 표지 생성 페이지
│
├── login
│   └── page.jsx                  # 로그인 페이지
│
├── signup
│   └── page.jsx                  # 회원가입 페이지
│
├── components
│   └── Header.jsx                # 상단 공통 네비게이션 바
│
└── context
    └── AuthContext.jsx           # 전역 로그인 상태 관리 Context

---

# 📁 폴더 / 컴포넌트별 설명

## 🌐 app/page.jsx – 메인 도서 목록 페이지

백엔드 API: GET /api/v1/books/list
등록된 도서 목록을 카드 형태로 출력
페이지네이션 적용 (기본 5개씩 표시)
로그인 상태(localStorage.loginUser)가 있을 경우 우측 상단에 “새 도서 등록” 버튼 노출
/books/edit 페이지로 이동해 새 도서 등록 가능

## 📘 app/books/edit/page.jsx – 도서 등록 / 수정 + AI 표지 생성

역할:
- 새 도서 등록
- 기존 도서 수정
- OpenAI DALL·E를 통한 표지 이미지 생성

URL 패턴:
/books/edit → 새 도서 등록 모드
/books/edit?bookId={id} → 수정 모드

⭐주요 기능.
- 로그인 사용자 검증
- localStorage.loginUser 가 없으면 Dialog로 안내 후 /login 페이지로 이동
- AI 표지 생성 (DALL·E)
- Next.js API Route /api/cover-generator 호출

요청 파라미터:
- apiKey: OpenAI API 키 (클라이언트 입력, 데모용 / 실제 운영에서는 서버 환경변수로!)
- title: 책 제목
- content: 책 내용 (최대 2000자)
- model: dall-e-2 또는 dall-e-3

응답:
- imageUrl (생성된 표지 이미지 URL)
- 생성된 이미지 URL은 화면에 미리보기로 표시되며, 이후 도서 생성 시 함께 저장

도서 생성
- 백엔드: POST /api/v1/books
- Body: { title, description, user_id }
- 응답으로 받은 book_id 를 이용해 POST /api/v1/image 로 표지 이미지 URL도 함께 저장

도서 수정
- 백엔드: PUT /api/v1/books/put
- Body: { bookId, title, description, user_id }
- 책 내용은 2000자 제한이 걸려 있으며, 초과 시 안내 Dialog 노출

## 📖 app/books/[id]/page.jsx – 도서 상세 페이지

URL: /books/{bookId}

백엔드 연동:
POST /api/v1/books/check
→ 책 상세 정보 + power(권한: "작성자" / "이용자")

POST /api/v1/image/check
→ 책 표지 이미지 URL 조회

화면 구성:
왼쪽: 표지 이미지 카드 (없으면 “표지 이미지 없음” 메시지)
오른쪽: 책 제목, 설명, 내용 등 표시

권한 처리:
power === "작성자" 인 경우에만 상단 우측에 “수정”, “삭제” 버튼 노출

삭제 기능:
DELETE /api/v1/books/delete
Body: { user_id, book_id }
성공/실패 여부를 Dialog로 안내 후 메인으로 이동


# 🧑‍💻 인증 관련

## 🔐 context/AuthContext.jsx - 전역 로그인 상태 관리

전역 로그인 상태(user)를 관리하는 Context
내부: login(id, pw):
백엔드: POST /api/v1/users/login
응답의 user_id를 상태와 localStorage("loginUser")에 저장

logout():
상태 초기화 + localStorage 제거
앱 전체에서 useAuth() 로 user, login, logout 사용 가능

## 🔓 app/login/page.jsx – 로그인 페이지

MUI 기반 로그인 폼
useAuth().login(id, pw) 호출

성공 시:
Dialog: "로그인 성공" 표시 후 /로 이동

실패 시:
Dialog: "아이디 또는 비밀번호가 올바르지 않습니다."

## 📝 app/signup/page.jsx – 회원가입 페이지

아이디 / 비밀번호 / 비밀번호 확인 폼

유효성 검사:
모든 항목 입력 여부
비밀번호 & 비밀번호 확인 일치 여부
Next API Route /api/auth/signup 호출 (가정)
내부에서 Spring Boot 백엔드의 /api/v1/users/signup 으로 연동

성공 시:
Dialog 안내 후 /login 으로 이동

## 🧭 components/Header.jsx – 공통 헤더

상단 AppBar 형태의 네비게이션
페이지 공통으로 import하여 사용

기능:
왼쪽: 로고/타이틀 (도서관리)
오른쪽:  로그인 버튼 (/login)/새 도서 등록 버튼 (/books/edit) - 로그인 전
        "{user_id} 님" 표시/새 도서 등록 버튼   - 로그인 후

로그아웃 버튼 (클릭 시 logout() + /login 이동)
/login 페이지에서는 오른쪽 버튼 전체 숨김
/books/edit 페이지에서는 상단 헤더에서 “새 도서 등록” 버튼 숨김

## 🧠 api/cover-generator/route.jsx – AI 표지 생성 API Route

클라이언트에서 직접 OpenAI에 요청하지 않고,
Next.js 서버 사이드에서 OpenAI 이미지 생성 API 호출

요청:
POST /api/cover-generator
Body: { apiKey, title, content, model }

동작:
OpenAI 이미지 생성 API (https://api.openai.com/v1/images/generations) 호출
DALL·E 3는 세로 직사각형 (1024x1792), DALL·E 2는 정사각형(1024x1024)
생성된 imageUrl 추출
백엔드에 POST /api/v1/image 로 URL 전송 시도
최종적으로 { imageUrl } 을 프론트에 반환

⚠️ 주의: 현재 예제 코드에서는 클라이언트에서 전달받은 apiKey를 그대로 사용하고 있으므로
실제 운영 환경에서는 반드시 서버 환경변수(process.env.OPENAI_API_KEY)로 교체해야 합니다.

---

# ⚙️ 환경 변수 설정
프로젝트 루트에 .env.local 파일을 생성하고 다음 값을 설정합니다.

백엔드 서버 주소 (예: Spring Boot)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

서버 사이드에서 백엔드 호출 시 사용할 URL
BACKEND_URL=http://localhost:8080

NEXT_PUBLIC_ 로 시작하는 환경 변수는 브라우저에서도 사용 가능하며,
그 외 변수는 서버(Next.js API Route)에서만 사용됩니다.

---

#🚀 실행 방법

1️⃣ 프로젝트 클론
git clone https://github.com/your-repo/miniproject04-frontend.git
cd miniproject04-frontend

2️⃣ 패키지 설치
npm install
또는
yarn install

3️⃣ 개발 서버 실행
npm run dev
또는
yarn dev

접속 주소: http://localhost:3000

백엔드(Spring Boot) 서버도 함께 실행되어 있어야
로그인 / 도서 목록 / 생성 / 수정 / 이미지 저장 기능이 정상 동작합니다.