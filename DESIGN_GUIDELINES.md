# 영단어 노트 — 디자인 가이드라인

> Paper Wireframe Kit (Figma Community by Method Inc.)에서 영감을 받은 손글씨·종이 느낌의 Lo-Fi 디자인 시스템입니다.

---

## 1. 디자인 철학

| 원칙 | 설명 |
|------|------|
| **Paper-First** | 손으로 스케치한 것처럼 약간 불규칙한 선과 여백을 강조 |
| **내용 중심** | 단어·뜻·어원이라는 핵심 내용이 디자인보다 앞에 선다 |
| **따뜻한 심플함** | 복잡한 그래디언트·그림자 없이 따뜻한 오프화이트와 먹색으로 깔끔하게 |
| **모바일 우선** | Netlify 배포 후 어디서든 접속하므로 모바일 레이아웃을 기본 설계 |

---

## 2. 색상 팔레트

### 기본 색상

| 이름 | HEX | 용도 |
|------|-----|------|
| `--color-paper` | `#F5F0E8` | 전체 배경 (오래된 종이) |
| `--color-card` | `#FAF7F2` | 카드·패널 배경 |
| `--color-ink` | `#1A1A1A` | 본문 텍스트 |
| `--color-pencil` | `#4A4A4A` | 보조 텍스트, 레이블 |
| `--color-faint` | `#9A9188` | Placeholder, 흐린 안내 문구 |
| `--color-line` | `#C8BFB0` | 테두리, 구분선 |
| `--color-line-dark` | `#8A7D6E` | 강조 테두리 |

### 강조 색상 (Crayola 영감)

| 이름 | HEX | 용도 |
|------|-----|------|
| `--color-accent-yellow` | `#F5C842` | 즐겨찾기·중요 표시 (형광펜 효과) |
| `--color-accent-blue` | `#6AAFE6` | 링크, 어원 뱃지 |
| `--color-accent-green` | `#7DC87E` | 성공·저장 완료 알림 |
| `--color-accent-red` | `#E06C6C` | 삭제·경고 |
| `--color-accent-orange` | `#F0A05A` | 태그·카테고리 뱃지 |

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

8px 기반 스페이싱

```
--space-xs:   4px
--space-sm:   8px
--space-md:   16px
--space-lg:   24px
--space-xl:   32px
--space-2xl:  48px
--space-3xl:  64px
```

---

## 5. 컴포넌트 명세

### 5-1. 카드 (Word Card)

```
┌─────────────────────────────────┐  ← border: 2px solid --color-line-dark
│  [★] ephemeral           [편집] │     border-radius: 6px (약간만 둥글게)
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │     background: --color-card
│  일시적인, 덧없는                 │     box-shadow: 3px 4px 0 --color-line
│                                 │     (종이를 테이블에 놓은 느낌)
│  🌱 어원                        │
│  Greek ephemeros (for a day)   │
│                                 │
│  ✏️ 예문                        │
│  "The ephemeral nature of..."   │
│                                 │
│  🏷️ adjective  #literature     │
│  2026.03.10                     │
└─────────────────────────────────┘
```

- **호버 효과:** `transform: translateY(-2px)`, `box-shadow` 살짝 확대
- **즐겨찾기 별표:** 형광펜 노란색으로 강조
- **어원 섹션:** 좌측 3px 실선 (`--color-accent-blue`) + 연한 파란 배경

### 5-2. 입력 모달 (Add/Edit Modal)

```
┌──────────────────────────────────────┐
│  ✏️  새 단어 추가                     │
│  ──────────────────────────────────  │
│  단어         [________________]     │
│  발음기호     [________________]     │
│  품사         [____▼]               │
│  뜻           [________________]    │
│               [________________]    │
│  어원         [________________]    │
│  예문         [________________]    │
│  태그         [________________]    │
│  메모         [________________]    │
│                                      │
│               [취소]  [저장하기]     │
└──────────────────────────────────────┘
```

- 모달 배경: `rgba(26,26,26,0.4)` 반투명 오버레이
- 입력 필드: `border-bottom: 2px solid` (밑줄 스타일, 공책 느낌)
- 주요 버튼: filled + `--color-ink` 배경, 흰 텍스트

### 5-3. 검색 바

```
🔍 [단어 또는 뜻을 검색하세요...  ]
```

- 외곽선 스타일 (border 전체), 둥글기 최소
- 포커스 시 border-color → `--color-ink`

### 5-4. 태그 / 뱃지

- padding: `2px 8px`
- border: `1.5px solid currentColor`
- border-radius: `3px` (거의 직각)
- 색상: 품사별로 다른 accent 색상 매핑

| 품사 | 색상 |
|------|------|
| noun | `--color-accent-blue` |
| verb | `--color-accent-green` |
| adjective | `--color-accent-orange` |
| adverb | `--color-accent-red` |
| phrase | `--color-accent-yellow` + 어두운 텍스트 |

### 5-5. 빈 상태 (Empty State)

```
     📖
     
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
| 카드 호버 | `translateY(-3px)` + box-shadow 확대 (0.15s ease) |
| 버튼 클릭 | `scale(0.96)` (0.1s) — 잉크 도장 누르는 느낌 |
| 모달 열기 | `opacity 0→1` + `translateY(20px→0)` (0.2s ease-out) |
| 단어 저장 | 카드 위에 초록 체크 토스트 메시지 0.5s fade-in/out |
| 단어 삭제 | 카드 `opacity 1→0` + `scale 1→0.9` (0.2s) 후 DOM 제거 |

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
