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
├── App.jsx                 # 폼 · 세션 · 저장 플로우
├── App.css
├── components/
│   ├── Interpretation.jsx  # 해석 본문 렌더
│   ├── PillarGrid.jsx      # 사주 네 기둥
│   ├── ReadingsSidebar.jsx # 로그인 · 기록 목록
│   └── ResultPanel.jsx     # 공유 카드 + 결과
└── lib/
    ├── birth.js            # 생년월일 검증 유틸
    ├── gemini.js
    ├── parseInterpretation.js
    ├── sajuPrompt.js
    ├── shareCard.js
    └── supabase.js
```

## 배포 시 참고

`VITE_` 환경 변수는 빌드 시 클라이언트에 포함됩니다. 운영에서는 API 키를 백엔드 프록시로 감추는 편이 안전합니다.

## 라이선스

Private project.
