# 📚 나의 영단어 노트

영어공부 중 모르는 단어의 **뜻·어원·예문**을 손쉽게 기록하는 개인 웹사이트입니다.  
Netlify를 통해 무료 호스팅하여 인터넷만 되면 어디서든 접속할 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **단어 추가/편집/삭제** | 단어, 발음기호, 품사, 뜻, 어원, 예문, 태그, 메모 저장 |
| **즐겨찾기** | ⭐ 별표로 중요 단어 표시 |
| **검색** | 단어·뜻·어원·태그 통합 검색 |
| **필터** | 품사(명사/동사/형용사 등)별 필터 |
| **정렬** | 최신순 / 오래된순 / 가나다순 / 즐겨찾기 먼저 |
| **로컬 저장** | `localStorage` 사용 — 서버 없이 브라우저에 저장 |

---

## 🗂️ 파일 구조

```
english_study/
├── DESIGN_GUIDELINES.md  ← 디자인 가이드라인 (Paper Wireframe Kit 기반)
├── README.md             ← 이 파일
├── index.html            ← 단일 페이지 앱
├── style.css             ← Paper 손글씨 스타일
├── app.js                ← 영단어 CRUD 로직 (localStorage)
└── netlify.toml          ← Netlify 배포 설정
```

---

## 🚀 Netlify 배포 방법

### 방법 1: GitHub 연동 (권장)

1. 이 폴더를 GitHub 저장소에 push합니다.
   ```bash
   git init
   git add .
   git commit -m "초기 커밋: 영단어 노트"
   git branch -M main
   git remote add origin https://github.com/<유저명>/<저장소명>.git
   git push -u origin main
   ```
2. [app.netlify.com](https://app.netlify.com) 에 가입/로그인합니다.
3. **"Add new site" → "Import an existing project"** 클릭
4. GitHub 저장소를 선택합니다.
5. 빌드 설정:
   - **Build command**: (비워두기)
   - **Publish directory**: `.` (점 하나)
6. **"Deploy site"** 클릭 → 완료!

### 방법 2: 드래그 앤 드롭

1. [app.netlify.com](https://app.netlify.com) 로그인
2. "Sites" 탭 하단의 **드래그 앤 드롭 영역**에 이 폴더를 통째로 드래그
3. 자동 배포 완료 → 고유 URL 발급

---

## 💾 데이터 저장 방식

- 모든 단어는 **브라우저의 `localStorage`** 에 저장됩니다.
- 서버 없이 작동하며, 같은 브라우저에서는 영구 보존됩니다.
- **⚠️ 주의:** 브라우저 데이터 초기화 시 삭제됩니다. 중요한 단어는 별도 백업을 권장합니다.
- 여러 기기에서 동기화하려면 향후 Firebase 등 클라우드 연동 업그레이드가 필요합니다.

---

## 🎨 디자인

Paper Wireframe Kit (Figma Community by Method Inc.)에서 영감을 받은 **손글씨·종이 느낌** 디자인입니다.  
자세한 내용은 [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md)를 참고하세요.

---

## 🛠️ 로컬에서 열기

별도 서버 설치 없이 `index.html` 파일을 브라우저에서 바로 열 수 있습니다.

```bash
# VS Code Live Server 사용 시
# 1. VS Code에서 index.html 열기
# 2. 우하단 "Go Live" 클릭
```

또는 `index.html`을 더블클릭하여 브라우저에서 직접 열어도 됩니다.
