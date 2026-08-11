# 사주 미 (saju-me-seojin)

이름과 출생 정보를 입력하면 **Gemini AI**가 사주 명식을 바탕으로 성격·기질·재능을 해석해 주는 웹 앱입니다.

## 주요 기능

- **출생 정보 입력** — 이름, 양력/음력, 생년월일, 태어난 시간, 성별
- **기본 차트 해석** — 년·월·일·시 네 기둥(四柱)과 AI 해석 결과 제공
- **구조화된 해석 UI** — 도입, 핵심 키워드, 번호 섹션, 특이점, 종합 의견으로 읽기 쉽게 표시

## 입력 항목

| 항목 | 설명 |
|------|------|
| 이름 | 선택 (미입력 가능) |
| 달력 | 양력 / 음력 |
| 생년월일 | 직접 입력 (예: `1990` · `01` · `15`) |
| 태어난 시간 | 24시간 형식 (예: `0930` → `09:30`) |
| 시간 모름 | 체크 시 시간 없이 해석 요청 |
| 성별 | 남성 / 여성 |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 만듭니다.

```bash
cp .env.example .env
```

`.env`에 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급한 Gemini API 키를 넣습니다.

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> `.env`는 Git에 올라가지 않습니다. API 키는 절대 커밋하지 마세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 표시되는 주소(기본 `http://localhost:5173`)로 접속합니다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint로 코드 검사 |

## 기술 스택

- **React 19** + **Vite 8**
- **Google Gemini API** (`@google/genai`)
- **Noto Sans / Serif KR** — 한글·한자 타이포

## 프로젝트 구조

```
src/
├── App.jsx          # 입력 폼 · 해석 결과 UI
├── App.css          # 스타일
└── lib/
    ├── gemini.js    # Gemini API 호출
    └── sajuPrompt.js # 사주 해석 프롬프트 · 샘플 명식
```

## 배포 시 참고

`VITE_` 접두사 환경 변수는 **빌드 시 클라이언트 JS에 포함**됩니다.  
공개 배포 시 API 키가 노출될 수 있으므로, 운영 환경에서는 백엔드 프록시를 두는 방식을 권장합니다.

## 라이선스

Private project.
