# 영단어 노트 — 디자인 가이드라인

> 모던 앱 스타일 — Dark Navy + Gold Yellow + Clean White
> 운동 앱 디자인에서 영감을 받은 클린하고 세련된 UI 시스템입니다.

---

## 1. 디자인 철학

| 원칙 | 설명 |
|------|------|
| **App-Native** | 모바일 앱과 동일한 무게감·여백·반경으로 네이티브 앱처럼 보이게 |
| **내용 중심** | 단어·뜻·어원이라는 핵심 내용이 디자인보다 앞에 선다 |
| **Dark Navy 앵커** | `#1A2340` 네이비를 기준색으로 삼아 신뢰감·집중감을 표현 |
| **Gold Accent** | `#F5C842` 골드 옐로우로 즐겨찾기·중요 요소에 시선 집중 |
| **모바일 우선** | Netlify 배포 후 어디서든 접속하므로 모바일 레이아웃을 기본 설계 |

---

## 2. 색상 팔레트

### 기본 색상

| 이름 | HEX | 용도 |
|------|-----|------|
| `--color-bg` | `#F2F4F8` | 전체 페이지 배경 |
| `--color-surface` | `#FFFFFF` | 카드·모달·헤더 표면 |
| `--color-surface-2` | `#F7F8FB` | 중첩 입력 필드·메모 배경 |
| `--color-navy` | `#1A2340` | Primary 텍스트, 버튼 배경 (핵심 앵커 색) |
| `--color-navy-light` | `#2C3A5C` | 버튼 호버 상태 |
| `--color-text` | `#1A2340` | 본문 텍스트 |
| `--color-text-sub` | `#5A6580` | 보조 텍스트, 레이블 |
| `--color-text-muted` | `#9AA4BC` | Placeholder, 날짜, 흐린 안내 문구 |
| `--color-border` | `#E4E8F0` | 기본 테두리, 구분선 |
| `--color-border-dark` | `#C8CFDF` | 강조 테두리, 호버 시 테두리 |

### 강조 색상 (Accent)

| 이름 | HEX | 용도 |
|------|-----|------|
| `--color-yellow` | `#F5C842` | 즐겨찾기 카드 테두리·좌측 라인 (핵심 강조색) |
| `--color-yellow-dark` | `#D4A800` | 단어 수 카운터 텍스트 |
| `--color-yellow-bg` | `rgba(245,200,66,0.12)` | 카운터 배경, 즐겨찾기 카드 그림자 |
| `--color-blue` | `#4A7CF5` | 어원 섹션 좌측 라인 |
| `--color-blue-bg` | `rgba(74,124,245,0.10)` | 어원 섹션 배경 |
| `--color-green` | `#3DB87A` | 저장 완료 토스트 |
| `--color-red` | `#E05A5A` | 삭제·경고 버튼, 에러 메시지 |
| `--color-orange` | `#F5894A` | 보조 강조 (필요 시) |

---

## 3. 타이포그래피

### 폰트 스택

```
제목 (Heading): 'Caveat', 'Patrick Hand', cursive
본문 (Body):    'Kalam', 'Nanum Pen Script', sans-serif
영어 단어:       'Caveat', cursive  (크고 굵게)
UI 레이블:       'Noto Sans KR', sans-serif  (가독성을 위해 산세리프)
```

> **Google Fonts 임포트:**
> `Caveat` · `Kalam` · `Noto Sans KR`

### 크기 스케일

| 역할 | 크기 | 굵기 | 사용 예 |
|------|------|------|---------|
| `--text-hero` | `2.8rem` | 700 | 사이트 제목 |
| `--text-word` | `2rem` | 700 | 단어 카드 표제어 |
| `--text-heading` | `1.4rem` | 600 | 섹션 제목 |
| `--text-body` | `1rem` | 400 | 뜻, 설명 |
| `--text-small` | `0.875rem` | 400 | 태그, 날짜 |
| `--text-tiny` | `0.75rem` | 400 | 기타 메타 정보 |

---

## 4. 간격 시스템

4px 기반 스페이싱 (변수명 `--sp-N` = N×4px)

```
--sp-1:  4px
--sp-2:  8px
--sp-3:  12px
--sp-4:  16px
--sp-5:  20px
--sp-6:  24px
--sp-8:  32px
--sp-10: 40px
--sp-12: 48px
```

### 그림자 시스템

| 변수 | 값 | 용도 |
|------|----|------|
| `--shadow-sm` | `0 1px 4px rgba(26,35,64,0.07)` | 카드 기본 상태 |
| `--shadow-md` | `0 4px 16px rgba(26,35,64,0.10)` | 카드 호버, 드롭다운 |
| `--shadow-lg` | `0 8px 32px rgba(26,35,64,0.14)` | 모달 |

### 둥글기 시스템

| 변수 | 값 | 용도 |
|------|----|------|
| `--radius-sm` | `6px` | 소형 버튼, 뱃지 내부 |
| `--radius-md` | `12px` | 입력 필드 |
| `--radius-lg` | `18px` | 카드 |
| `--radius-xl` | `24px` | 모달 패널 |
| `--radius-full` | `9999px` | 버튼, 검색바, 태그 (Pill 형태) |

---

## 5. 컴포넌트 명세

### 5-1. 카드 (Word Card)

```
┌────────────────────────────────────┐  ← border: 1.5px solid --color-border
▌  ephemeral              ☆ 편집 삭제│     border-radius: 18px (--radius-lg)
▌  /ɪˈfɛm.ər.əl/                     │     background: --color-surface
│  ──────────────────────────────    │     box-shadow: --shadow-sm
│  일시적인, 덧없는                    │
│                                    │     ← 좌측 4px 라인 (기본: --color-border)
│  ┊ ETYMOLOGY                       │       호버/즐겨찾기: --color-yellow
│  ┊ Greek ephemeros (for a day)    │
│                                    │
│  EXAMPLE                           │
│  "The ephemeral nature of..."      │
│                                    │
│  [형용사]  [literature]   2026.03.10│
└────────────────────────────────────┘
```

- **기본 상태:** `--shadow-sm`, 좌측 4px 라인 = `--color-border`
- **호버 효과:** `translateY(-4px)`, `--shadow-md`, 좌측 라인 → `--color-yellow`
- **즐겨찾기 카드:** border = `--color-yellow` 2px, 좌측 라인 = `--color-yellow`
- **어원 섹션:** 좌측 3px 라인 `--color-blue` + `--color-blue-bg` 배경
- **카드 진입 애니메이션:** `opacity 0→1` + `translateY(14px→0)` (0.25s)

### 5-2. 입력 모달 (Add/Edit Modal)

```
┌──────────────────────────────────────┐  ← border-radius: 24px (--radius-xl)
│  새 단어 추가                   [✕]  │     backdrop: blur(4px)
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  WORD *                              │
│  ┌──────────────────────────────┐   │
│  │ e.g. ephemeral               │   │  ← border-radius: 12px (--radius-md)
│  └──────────────────────────────┘   │     배경: --color-surface-2
│  품사                                │     포커스: border = --color-navy
│  ┌──────────────────────────────┐   │
│  │ 형용사 (Adjective)         ▼ │   │
│  └──────────────────────────────┘   │
│  ...                                 │
│                    [취소] [저장하기] │  ← 저장: --color-navy 배경, pill 형태
└──────────────────────────────────────┘
```

- 모달 배경: `rgba(10,16,38,0.5)` + `backdrop-filter: blur(4px)`
- 입력 필드: 박스 스타일 (`--radius-md`), 포커스 시 `box-shadow: 0 0 0 3px`
- 레이블: 대문자 + letter-spacing (UPPERCASE 스타일)

### 5-3. 검색 바

```
🔍 [단어 또는 뜻을 검색하세요...        ]
```

- `border-radius: 9999px` (완전 Pill 형태)
- 포커스 시 border-color → `--color-navy` + `box-shadow` 링
- 배경: `--color-surface-2` → 포커스 시 `--color-surface`

### 5-4. 태그 / 뱃지

- `border-radius: 9999px` (완전 Pill)
- border 없음, 배경색으로만 구분
- 품사별 색상 매핑:

| 품사 | 텍스트 색 | 배경 |
|------|-----------|------|
| noun | `#2563C8` | `rgba(37,99,200,0.10)` |
| verb | `#1A9A5A` | `rgba(26,154,90,0.10)` |
| adjective | `#C06010` | `rgba(192,96,16,0.10)` |
| adverb | `#C02020` | `rgba(192,32,32,0.10)` |
| phrase | `#9A6A00` | `rgba(245,200,66,0.20)` |

### 5-5. 버튼

| 종류 | 배경 | 텍스트 | 형태 |
|------|------|--------|------|
| Primary | `--color-navy` | 흰색 | Pill, 그림자 있음 |
| Secondary | `--color-surface` | `--color-text-sub` | Pill, 테두리 |
| Danger | `--color-red` | 흰색 | Pill |

호버 시 공통: `translateY(-1px)` + 그림자 확대

### 5-6. 빈 상태 (Empty State)

```
     📖  (opacity 0.4)
     
  아직 단어가 없어요.
  첫 번째 단어를 추가해 보세요!
  
       [+ 단어 추가]
```

---

## 6. 레이아웃

### 반응형 그리드

```
모바일  (< 640px)  : 1컬럼 카드 목록
태블릿 (640~1024px): 2컬럼 카드 그리드
데스크톱(> 1024px) : 3컬럼 카드 그리드
```

### 페이지 구조

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  📚 나의 영단어 노트    [+ 단어 추가]   │
├─────────────────────────────────────────┤
│  CONTROLS                               │
│  [🔍 검색]  [품사▼]  [정렬▼]  [전체 N] │
├─────────────────────────────────────────┤
│  WORD GRID                              │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ Card  │  │ Card  │  │ Card  │       │
│  └───────┘  └───────┘  └───────┘       │
│  ...                                    │
├─────────────────────────────────────────┤
│  FOOTER                                 │
│  © 나의 영단어 노트                     │
└─────────────────────────────────────────┘
```

---

## 7. 인터랙션 & 마이크로 애니메이션

| 이벤트 | 효과 |
|--------|------|
| 카드 진입 | `opacity 0→1` + `translateY(14px→0)` (0.25s ease-out) |
| 카드 호버 | `translateY(-4px)` + `--shadow-md` + 좌측 라인 노란색 (0.18s ease) |
| 버튼 클릭 | `scale(0.97)` (0.1s) |
| 버튼 호버 | `translateY(-1px)` + 그림자 강화 |
| 모달 열기 | 오버레이 `opacity 0→1` (0.15s) + 패널 `translateY(20px→0)` (0.2s ease-out) |
| 단어 저장/수정 | 바텀 토스트 메시지, 네이비 배경 Pill, `translateY(-6px)` |
| 단어 삭제 | 카드 `opacity 1→0` + `scale 1→0.93` (0.2s) 후 DOM 제거 |
| 검색 포커스 | border-color 전환 + `box-shadow: 0 0 0 3px` 링 (0.15s) |

---

## 8. 데이터 모델

```json
{
  "id": "uuid-v4",
  "word": "ephemeral",
  "pronunciation": "/ɪˈfɛm.ər.əl/",
  "partOfSpeech": "adjective",
  "meaning": "일시적인, 덧없는",
  "etymology": "Greek 'ephemeros' (epi- + hemera '하루') → 하루만 사는",
  "example": "The ephemeral beauty of cherry blossoms.",
  "tags": ["literature", "nature"],
  "note": "비슷한 단어: transient, fleeting, momentary",
  "isFavorite": false,
  "createdAt": "2026-03-04T00:00:00.000Z"
}
```

---

## 9. 파일 구조

```
english_study/
├── DESIGN_GUIDELINES.md   ← 이 파일
├── index.html             ← 단일 페이지 앱
├── style.css              ← Paper 스타일 전체
├── app.js                 ← 영단어 CRUD + localStorage
└── netlify.toml           ← Netlify 배포 설정
```

---

## 10. 접근성 (a11y)

- 모든 인터랙티브 요소에 `aria-label` 또는 `aria-describedby` 제공
- 색상 대비 WCAG AA 기준 이상 준수 (`--color-ink` on `--color-paper` ≈ 14:1)
- 키보드 탐색 지원 (Tab / Enter / Escape)
- `prefers-reduced-motion` 미디어 쿼리로 애니메이션 비활성화 옵션 제공
