# 사주 미

생년월일을 넣으면 물개가 **사주 유형 카드**와 해석을 읽어 주는 웹 앱입니다. 친구에게 보내고 케미를 비교할 수 있어요.

- 서비스: [saju-me-seojin.vercel.app](https://saju-me-seojin.vercel.app/)
- 카피: 나는 어떤 형일까

## 주요 기능

- **바로 읽어 보기** — 로그인 없이 이름·양력/음력·생년월일·시간·성별을 넣고 해석을 요청
- **유형 카드** — 별명형·한 줄·키워드·케미를 한 장으로 보여 줌
- **게스트 결과** — 풀이는 준비해 두고, Google 로그인하면 열어 주고 기록에도 남김
- **프로필** — 한 번 저장하면 다음부터는 내 사주를 바로 읽음. 다른 사람 사주도 따로 볼 수 있음
- **기록** — 로그인 사용자별로 저장·다시 보기·삭제 (`saju_readings`)
- **공유** — 이미지 저장, 링크 복사, 친구에게 보내기. `/result?s=` 공개 페이지에서 로그인 없이 전체 해석을 봄
- **유입 카드** — 공유 링크로 들어오면 상대 유형을 먼저 보여 주고, 내 유형도 읽어 보게 함

## 시작하기

```bash
npm install
```

프로젝트 루트에 `.env`를 만들고 아래를 채웁니다.

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

```bash
npm run dev
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
- Google Gemini (`gemini-3.6-flash`) — 물개 말투 해석
- Supabase — 프로필·기록·공개 공유 링크, Google OAuth
- Google Analytics 4 — 로그인·해석·공유 등 전환 이벤트
- Vercel — SPA (`vercel.json` rewrite)

## 화면 흐름

1. `/` 에서 출생 정보를 넣거나, 로그인 사용자는 저장된 프로필로 바로 읽기
2. 게스트는 결과 잠금 화면 → Google 로그인 후 이번 결과를 기록에 저장
3. 로그인 사용자는 유형 카드 + 성격·관계·일·재물 해석, 이미지/링크 공유
4. `/result?s=` 는 공개 공유 페이지. 홈 쿼리에 유형 카드가 있으면 상대 카드를 먼저 보여 줌

## 프로젝트 구조

```
src/
├── main.jsx                # / 와 /result 분기
├── App.jsx                 # 홈 화면 조합
├── hooks/
│   ├── useSajuApp.js       # 세션 · 프로필 · 해석 · 게스트 대기 결과
│   └── useStatusToast.js
├── components/
│   ├── layout/             # 배경 · 히어로 · 게스트 바
│   ├── fortune/            # 사주 입력 폼 · 프로필 요약
│   ├── result/             # 해석 · 유형 카드 · 공유 · 로딩
│   ├── readings/           # 기록 사이드바
│   ├── profile/            # 온보딩 · 프로필 모달
│   └── ui/                 # 마스코트 · 필드 · 버튼
└── lib/                    # 출생 검증, Gemini, Supabase, 공유, GA
```

## 데이터

| 테이블 | 역할 |
|--------|------|
| `public.users` | 로그인 사용자 출생 프로필 |
| `public.saju_readings` | 개인 해석 기록 (`user_id`로 연결) |
| `public.shared_results` | `/result?s=` 공개 공유 본문 |

게스트가 로그인 직전에 본 결과는 `sessionStorage`에 잠시 붙잡아 두고, OAuth 복귀 후 기록으로 옮깁니다.

## 배포 시 참고

`VITE_` 환경 변수는 빌드 시 클라이언트에 포함됩니다. 운영에서는 API 키를 백엔드 프록시로 감추는 편이 안전합니다.

Google 로그인 후 localhost로 떨어지면 Supabase **Authentication → URL Configuration**에서 Site URL을 프로덕션 도메인으로 두고, Redirect URLs에 프로덕션·`http://localhost:5173/**`를 넣으세요.

GA 측정 ID는 `index.html`의 gtag와 `src/lib/ga.js` 이벤트로 동작합니다.

## 라이선스

Private project.
