# 사주 미 (saju-me-seojin)

이름과 출생 정보를 입력하면 **Gemini AI**가 사주 명식을 바탕으로 성격·기질·재능을 해석해 주는 웹 앱입니다.

## 주요 기능

- **출생 정보 입력** — 이름, 양력/음력, 생년월일, 태어난 시간, 성별
- **기본 차트 해석** — 년·월·일·시 네 기둥과 AI 해석
- **공유 유형 카드** — 한 장으로 읽고 공유
- **기록 저장** — Supabase에 저장·수정·삭제
- **Google 로그인** — Supabase Auth OAuth

## 시작하기

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` 예시:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

브라우저: `http://localhost:5173`

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | oxlint |

## 기술 스택

- React 19 + Vite 8
- Google Gemini (`@google/genai`)
- Supabase (DB + Google Auth)

## 프로젝트 구조

```
src/
├── App.jsx                 # 화면 조합
├── hooks/
│   ├── useSajuApp.js       # 세션 · 프로필 · 해석 흐름
│   └── useStatusToast.js
├── components/             # 폼 · 결과 · 사이드바 · 모달
└── lib/                    # 출생 검증, API, 해석, 공유
```

## 배포 시 참고

`VITE_` 환경 변수는 빌드 시 클라이언트에 포함됩니다. 운영에서는 API 키를 백엔드 프록시로 감추는 편이 안전합니다.

Google 로그인 후 localhost로 떨어지면 Supabase **Authentication → URL Configuration**에서 Site URL을 프로덕션 도메인으로 두고, Redirect URLs에 프로덕션·`http://localhost:5173/**`를 넣으세요.

출생 정보는 `public.users`, 해석 결과는 `public.saju_readings`에 분리 저장되며 `user_id`로 연결됩니다.

## 라이선스

Private project.
