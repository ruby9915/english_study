/**
 * 나의 영단어 노트 — app.js
 * - localStorage 기반 영단어 CRUD (자동 저장)
 * - JSON 파일 내보내기 / 불러오기 (오프라인 데이터 관리)
 * - 검색, 필터, 정렬
 * - 즐겨찾기
 *
 * [오프라인 사용법]
 *  1. index.html을 브라우저에서 직접 열기
 *  2. 단어는 브라우저 localStorage에 자동 저장됨
 *  3. 백업·이전: 「💾 저장」→ vocabulary.json 다운로드
 *  4. 복원·불러오기: 「📂 불러오기」→ JSON 파일 선택
 */

'use strict';

/* =============================================
   상수 & 저장소
   ============================================= */
const STORAGE_KEY = 'vocabulary_words';

/** @type {Word[]} */
let words = loadWords();
let editingId = null;   // 현재 편집 중인 단어 ID
let deletingId = null;  // 삭제 확인 중인 단어 ID

/* =============================================
   데이터 타입 정의 (JSDoc)
   =============================================
   @typedef {Object} Word
   @property {string} id
   @property {string} word
   @property {string} pronunciation
   @property {string} partOfSpeech
   @property {string} meaning
   @property {string} etymology
   @property {string} example
   @property {string[]} tags
   @property {string} note
   @property {boolean} isFavorite
   @property {string} createdAt  ISO 8601
*/

/* =============================================
   localStorage 헬퍼
   ============================================= */
function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* =============================================
   DOM 참조
   ============================================= */
const wordGrid      = document.getElementById('word-grid');
const emptyState    = document.getElementById('empty-state');
const wordCount     = document.getElementById('word-count');
const searchInput   = document.getElementById('search-input');
const filterPos     = document.getElementById('filter-pos');
const filterSort    = document.getElementById('filter-sort');

// 모달 — 추가/편집
const modalOverlay  = document.getElementById('modal-overlay');
const modalTitle    = document.getElementById('modal-title');
const wordForm      = document.getElementById('word-form');
const formId        = document.getElementById('form-id');
const formWord      = document.getElementById('form-word');
const formPron      = document.getElementById('form-pron');
const formPos       = document.getElementById('form-pos');
const formMeaning   = document.getElementById('form-meaning');
const formEtymology = document.getElementById('form-etymology');
const formExample   = document.getElementById('form-example');
const formTags      = document.getElementById('form-tags');
const formNote      = document.getElementById('form-note');
const errWord       = document.getElementById('err-word');
const errMeaning    = document.getElementById('err-meaning');

// 모달 — 삭제 확인
const confirmOverlay  = document.getElementById('confirm-overlay');
const confirmMessage  = document.getElementById('confirm-message');

// 토스트
const toast = document.getElementById('toast');
let toastTimer = null;

// JSON 파일 관리 (오프라인)
const btnImport   = document.getElementById('btn-import');
const btnExport   = document.getElementById('btn-export');
const jsonFileInput = document.getElementById('json-file-input');
const fileStatusText = document.getElementById('file-status-text');

// 모달 AI 자동완성
const btnAIAutofill      = document.getElementById('btn-ai-autofill');
const aiAutofillSpinner  = document.getElementById('ai-autofill-spinner');
const aiAutofillLabel    = document.querySelector('.ai-autofill-label');

// Ollama AI
const btnToggleAI       = document.getElementById('btn-toggle-ai');
const aiPanel           = document.getElementById('ai-panel');
const aiModelSelect     = document.getElementById('ai-model-select');
const aiStatusDot       = document.getElementById('ai-status-dot');
const aiStatusText      = document.getElementById('ai-status-text');
const aiUseContext      = document.getElementById('ai-use-context');
const aiQueryInput      = document.getElementById('ai-query-input');
const btnAISend         = document.getElementById('btn-ai-send');
const btnAIClear        = document.getElementById('btn-ai-clear');
const aiResponseArea    = document.getElementById('ai-response-area');
const aiResponseContent = document.getElementById('ai-response-content');
const aiResponseLoading = document.getElementById('ai-response-loading');

/* =============================================
   렌더링
   ============================================= */
function getFilteredWords() {
  const query = searchInput.value.trim().toLowerCase();
  const pos   = filterPos.value;
  const sort  = filterSort.value;

  let result = words.filter(w => {
    const matchQuery =
      !query ||
      w.word.toLowerCase().includes(query) ||
      w.meaning.toLowerCase().includes(query) ||
      w.etymology.toLowerCase().includes(query) ||
      w.tags.some(t => t.toLowerCase().includes(query));

    const matchPos = !pos || w.partOfSpeech === pos;

    return matchQuery && matchPos;
  });

  result.sort((a, b) => {
    switch (sort) {
      case 'oldest':  return new Date(a.createdAt) - new Date(b.createdAt);
      case 'alpha':   return a.word.localeCompare(b.word, 'en', { sensitivity: 'base' });
      case 'favorite': {
        if (a.isFavorite !== b.isFavorite) return b.isFavorite - a.isFavorite;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      default:        return new Date(b.createdAt) - new Date(a.createdAt); // newest
    }
  });

  return result;
}

function renderWords() {
  const filtered = getFilteredWords();

  wordCount.textContent = `전체 ${words.length}개${filtered.length !== words.length ? ` · ${filtered.length}개 표시` : ''}`;

  if (filtered.length === 0) {
    wordGrid.innerHTML = '';
    if (words.length === 0) {
      emptyState.hidden = false;
      wordGrid.hidden = true;
    } else {
      emptyState.hidden = true;
      wordGrid.hidden = false;
      wordGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl) 0;">
          <div style="font-size:2.5rem;margin-bottom:var(--space-md);">🔍</div>
          <p style="font-family:var(--font-hand);font-size:var(--text-heading);color:var(--color-pencil);">검색 결과가 없어요.</p>
          <p style="font-size:var(--text-small);color:var(--color-faint);margin-top:8px;">다른 키워드로 검색해 보세요.</p>
        </div>`;
    }
    return;
  }

  emptyState.hidden = true;
  wordGrid.hidden = false;
  wordGrid.innerHTML = filtered.map(createCardHTML).join('');
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function posLabel(pos) {
  const map = {
    noun: '명사', verb: '동사', adjective: '형용사',
    adverb: '부사', phrase: '구', other: '기타'
  };
  return map[pos] || '';
}

function escapedHTML(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createCardHTML(w) {
  const posBadge = w.partOfSpeech
    ? `<span class="badge badge-${escapedHTML(w.partOfSpeech)}">${escapedHTML(posLabel(w.partOfSpeech))}</span>`
    : '';

  const tagChips = w.tags.length
    ? w.tags.map(t => `<span class="tag-chip">${escapedHTML(t)}</span>`).join('')
    : '';

  const etymologySection = w.etymology
    ? `<div class="card-etymology">
         <div class="card-section-label">🌱 어원</div>
         <div class="card-section-text">${escapedHTML(w.etymology)}</div>
       </div>`
    : '';

  const exampleSection = w.example
    ? `<div>
         <div class="card-section-label">✏️ 예문</div>
         <div class="card-example">${escapedHTML(w.example)}</div>
       </div>`
    : '';

  const noteSection = w.note
    ? `<div class="card-note">💡 ${escapedHTML(w.note)}</div>`
    : '';

  return `
    <article class="word-card${w.isFavorite ? ' is-favorite' : ''}" data-id="${escapedHTML(w.id)}">
      <div class="card-top">
        <div class="card-word-wrap">
          <div class="card-word">${escapedHTML(w.word)}</div>
          ${w.pronunciation ? `<div class="card-pron">${escapedHTML(w.pronunciation)}</div>` : ''}
        </div>
        <div class="card-actions">
          <button
            class="btn-favorite${w.isFavorite ? ' active' : ''}"
            data-action="favorite" data-id="${escapedHTML(w.id)}"
            aria-label="${w.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}"
          >${w.isFavorite ? '⭐' : '☆'}</button>
          <button class="btn-icon-sm" data-action="edit"   data-id="${escapedHTML(w.id)}" aria-label="편집">편집</button>
          <button class="btn-icon-sm delete" data-action="delete" data-id="${escapedHTML(w.id)}" aria-label="삭제">삭제</button>
        </div>
      </div>

      <hr class="card-divider" />

      <div class="card-meaning">${escapedHTML(w.meaning)}</div>

      ${etymologySection}
      ${exampleSection}
      ${noteSection}

      <hr class="card-divider" />

      <div class="card-footer">
        <div class="card-tags">
          ${posBadge}
          ${tagChips}
        </div>
        <span class="card-date">${formatDate(w.createdAt)}</span>
      </div>
    </article>`;
}

/* =============================================
   이벤트: 카드 그리드 (이벤트 위임)
   ============================================= */
wordGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === 'favorite') toggleFavorite(id);
  if (action === 'edit')     openEditModal(id);
  if (action === 'delete')   openDeleteConfirm(id);
});

/* =============================================
   즐겨찾기 토글
   ============================================= */
function toggleFavorite(id) {
  const w = words.find(x => x.id === id);
  if (!w) return;
  w.isFavorite = !w.isFavorite;
  saveWords();
  renderWords();
  showToast(w.isFavorite ? `⭐ "${w.word}" 즐겨찾기 추가!` : `"${w.word}" 즐겨찾기 해제`);
}

/* =============================================
   모달 — 추가
   ============================================= */
document.getElementById('btn-open-add').addEventListener('click', openAddModal);
document.getElementById('btn-empty-add').addEventListener('click', openAddModal);

function openAddModal() {
  editingId = null;
  modalTitle.textContent = '✏️ 새 단어 추가';
  wordForm.reset();
  clearFormErrors();
  _updateAutofillBtn();
  openModal(modalOverlay);
  formWord.focus();
}

/* =============================================
   모달 — 편집
   ============================================= */
function openEditModal(id) {
  const w = words.find(x => x.id === id);
  if (!w) return;
  editingId = id;
  modalTitle.textContent = '✏️ 단어 편집';

  formId.value         = w.id;
  formWord.value       = w.word;
  formPron.value       = w.pronunciation;
  formPos.value        = w.partOfSpeech;
  formMeaning.value    = w.meaning;
  formEtymology.value  = w.etymology;
  formExample.value    = w.example;
  formTags.value       = w.tags.join(', ');
  formNote.value       = w.note;

  clearFormErrors();
  _updateAutofillBtn();
  openModal(modalOverlay);
  formWord.focus();
}

/* =============================================
   폼 제출 (추가 + 편집 공통)
   ============================================= */
wordForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const wordVal = formWord.value.trim();
  const meaningVal = formMeaning.value.trim();

  // 유효성 검사
  let valid = true;
  if (!wordVal) {
    errWord.textContent = '단어를 입력해 주세요.';
    formWord.classList.add('error');
    valid = false;
  } else {
    errWord.textContent = '';
    formWord.classList.remove('error');
  }

  if (!meaningVal) {
    errMeaning.textContent = '뜻을 입력해 주세요.';
    formMeaning.classList.add('error');
    valid = false;
  } else {
    errMeaning.textContent = '';
    formMeaning.classList.remove('error');
  }

  if (!valid) return;

  const tagsRaw = formTags.value.trim();
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  if (editingId) {
    // 편집
    const idx = words.findIndex(x => x.id === editingId);
    if (idx !== -1) {
      words[idx] = {
        ...words[idx],
        word:          wordVal,
        pronunciation: formPron.value.trim(),
        partOfSpeech:  formPos.value,
        meaning:       meaningVal,
        etymology:     formEtymology.value.trim(),
        example:       formExample.value.trim(),
        tags,
        note:          formNote.value.trim(),
      };
    }
    showToast(`✅ "${wordVal}" 수정 완료!`);
  } else {
    // 신규 추가
    const newWord = {
      id:            generateId(),
      word:          wordVal,
      pronunciation: formPron.value.trim(),
      partOfSpeech:  formPos.value,
      meaning:       meaningVal,
      etymology:     formEtymology.value.trim(),
      example:       formExample.value.trim(),
      tags,
      note:          formNote.value.trim(),
      isFavorite:    false,
      createdAt:     new Date().toISOString(),
    };
    words.unshift(newWord);
    showToast(`✅ "${wordVal}" 추가 완료!`);
  }

  saveWords();
  renderWords();
  closeModal(modalOverlay);
});

/* =============================================
   모달 — 삭제 확인
   ============================================= */
function openDeleteConfirm(id) {
  const w = words.find(x => x.id === id);
  if (!w) return;
  deletingId = id;
  confirmMessage.textContent = `"${w.word}" 단어를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`;
  openModal(confirmOverlay);
}

document.getElementById('btn-confirm-ok').addEventListener('click', () => {
  if (!deletingId) return;

  const card = wordGrid.querySelector(`[data-id="${deletingId}"]`);
  const w = words.find(x => x.id === deletingId);
  const label = w ? w.word : '단어';

  if (card) {
    card.classList.add('removing');
    card.addEventListener('animationend', () => {
      words = words.filter(x => x.id !== deletingId);
      saveWords();
      renderWords();
    }, { once: true });
  } else {
    words = words.filter(x => x.id !== deletingId);
    saveWords();
    renderWords();
  }

  showToast(`🗑️ "${label}" 삭제됨`);
  deletingId = null;
  closeModal(confirmOverlay);
});

document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
  deletingId = null;
  closeModal(confirmOverlay);
});

document.getElementById('btn-confirm-close').addEventListener('click', () => {
  deletingId = null;
  closeModal(confirmOverlay);
});

/* =============================================
   모달 열기 / 닫기
   ============================================= */
function openModal(el) {
  el.hidden = false;
  document.body.style.overflow = 'hidden';
  // ESC 키 리스너 등록
  el._escHandler = (e) => { if (e.key === 'Escape') closeModal(el); };
  document.addEventListener('keydown', el._escHandler);
}

function closeModal(el) {
  el.hidden = true;
  document.body.style.overflow = '';
  if (el._escHandler) {
    document.removeEventListener('keydown', el._escHandler);
    el._escHandler = null;
  }
}

// 오버레이 배경 클릭 시 닫기
[modalOverlay, confirmOverlay].forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.getElementById('btn-modal-close').addEventListener('click', () => closeModal(modalOverlay));
document.getElementById('btn-form-cancel').addEventListener('click', () => closeModal(modalOverlay));

/* =============================================
   검색 & 필터 이벤트
   ============================================= */
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderWords, 200);
});

filterPos.addEventListener('change', renderWords);
filterSort.addEventListener('change', renderWords);

/* =============================================
   폼 에러 초기화
   ============================================= */
function clearFormErrors() {
  errWord.textContent = '';
  errMeaning.textContent = '';
  formWord.classList.remove('error');
  formMeaning.classList.remove('error');
}

/* =============================================
   AI 자동완성 (모달 내 단어 입력 시)
   ============================================= */

function _updateAutofillBtn() {
  btnAIAutofill.disabled = !formWord.value.trim() || !ollamaOK;
}

// 단어 또는 예문 입력시 실시간 활성화
formWord.addEventListener('input', _updateAutofillBtn);
formExample.addEventListener('input', _updateAutofillBtn);

async function autoFillWithAI() {
  const word  = formWord.value.trim();
  const model = aiModelSelect.value;
  if (!word || !ollamaOK || !model) {
    if (!model) showToast('⚠️ AI 패널에서 모델을 먼저 선택해주세요.');
    return;
  }

  // 로딩 UI
  btnAIAutofill.disabled = true;
  aiAutofillLabel.textContent = '분석 중…';
  aiAutofillSpinner.hidden = false;

  const example = formExample.value.trim();

  const systemMsg =
    '당신은 옥스포드 영어 어원사전(Oxford Etymological Dictionary) 수준의 전문 어원학자이자 영한사전 AI입니다.\n' +
    '모든 설명은 반드시 한국어로 작성하세요.\n' +
    '확실하지 않은 정보는 추측하지 말고 "불확실" 또는 "여러 설이 있음"이라고 표기하세요.\n' +
    '예문이 주어지면 반드시 그 문장 속에서 단어가 쓰인 특정 의미와 품사를 기준으로 분석하세요.\n' +
    'JSON만 출력하고 코드블록·마크다운·설명 등 다른 텍스트는 절대 포함하지 마세요.';

  const exampleLine = example
    ? `\n예문 (이 문장에서의 의미/품사로 분석하세요): "${example}"\n`
    : '';

  const prompt =
    `영어 단어: "${word}"${exampleLine}\n\n` +
    `아래 JSON 형식으로만 응답하세요:\n` +
    `{\n` +
    `  "pronunciation": "IPA 발음기호 (예: /ɪˈfɛm.ər.əl/)",\n` +
    `  "partOfSpeech": "noun | verb | adjective | adverb | phrase | other 중 하나",\n` +
    `  "meaning": "한국어 뜻. 예문이 있으면 그 문맥의 의미만. 여러 뜻이면 쉼표로 구분",\n` +
    `  "etymology": "상세 어원 (아래 형식으로 작성):\n` +
    `    1) 최초 어원 언어와 원형 (예: 라틴어 'currere' = 달리다)\n` +
    `    2) 중간 변천 과정 (예: 고대 프랑스어 'corir' → 중세 영어 'curren')\n` +
    `    3) 어근/접두사/접미사 분해 (예: con- (함께) + currere (달리다))\n` +
    `    4) 현대 의미로의 변화 과정\n` +
    `    5) 관련 영어 파생어가 있으면 언급 (예: current, curriculum 등 같은 어근)",\n` +
    `  "tags": ["관련 주제 태그 2~4개"]\n` +
    `}\n\n` +
    `중요:\n` +
    `- meaning과 etymology는 반드시 한국어로 작성\n` +
    `- etymology는 최소 3줄 이상 상세하게 작성\n` +
    `- 확실하지 않으면 추측하지 말 것`;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, system: systemMsg, prompt, stream: false }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data  = await res.json();
    const raw   = data.response || '';

    // 자유형식 JSON 추출 (코드블록 안에 있어도 동작)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON 추출 실패');
    const p = JSON.parse(jsonMatch[0]);

    if (p.pronunciation) formPron.value = p.pronunciation;
    if (p.partOfSpeech) {
      // AI가 한국어 또는 영어로 품사를 반환할 수 있으므로 매핑
      const posMap = {
        noun: 'noun', '명사': 'noun',
        verb: 'verb', '동사': 'verb',
        adjective: 'adjective', '형용사': 'adjective',
        adverb: 'adverb', '부사': 'adverb',
        phrase: 'phrase', '구': 'phrase',
        other: 'other', '기타': 'other',
      };
      const raw_pos = p.partOfSpeech.toLowerCase().trim();
      formPos.value = posMap[raw_pos] || Object.values(posMap).find(v => raw_pos.includes(v)) || '';
    }
    if (p.meaning)       formMeaning.value   = p.meaning;
    if (p.etymology)     formEtymology.value = p.etymology;
    // 예문은 사용자가 직접 입력했으므로 덮어쓰지 않음
    if (Array.isArray(p.tags) && p.tags.length) formTags.value = p.tags.join(', ');

    showToast(`✨ "${word}" 자동완성 완료!`);
  } catch (err) {
    showToast(`❌ AI 자동완성 실패: ${err.message}`);
  } finally {
    aiAutofillSpinner.hidden = true;
    aiAutofillLabel.textContent = 'AI 자동완성';
    _updateAutofillBtn();
  }
}

btnAIAutofill.addEventListener('click', autoFillWithAI);

/* =============================================
   JSON 파일 관리 (오프라인)
   ============================================= */

/** 현재 단어 목록을 vocabulary.json으로 다운로드 */
function exportJSON() {
  if (words.length === 0) {
    showToast('⚠️ 저장할 단어가 없습니다.');
    return;
  }
  const json = JSON.stringify(words, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'vocabulary.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  fileStatusText.textContent = `💾 vocabulary.json 저장 완료 (${words.length}개 단어)`;
  showToast(`💾 vocabulary.json 저장됨 (${words.length}개)`);
}

/** 단어를 읽어 단어 목록 교체 */
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loaded = JSON.parse(e.target.result);
      if (!Array.isArray(loaded)) throw new Error('배열 형식이 아닙니다.');
      words = loaded;
      saveWords(); // localStorage도 동기화
      renderWords();
      fileStatusText.textContent = `📂 ${file.name} 로드됨 (${loaded.length}개 단어)`;
      showToast(`📂 ${loaded.length}개 단어를 불러왔습니다!`);
    } catch (err) {
      showToast('❌ JSON 형식이 올바르지 않습니다.');
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// 홈으로 돌아가기 (검색·필터 초기화 + 최상단 스크롤)
document.getElementById('btn-home').addEventListener('click', () => {
  searchInput.value = '';
  filterPos.value   = '';
  filterSort.value  = 'newest';
  renderWords();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 불러오기 버튼 → 파일 선택 창 열기
btnImport.addEventListener('click', () => jsonFileInput.click());

// 저장 버튼 → JSON 다운로드
btnExport.addEventListener('click', exportJSON);

// 파일 선택 완료 시 import 실행
jsonFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importJSON(file);
  e.target.value = ''; // 같은 파일 재선택 허용
});

/* =============================================
   Ollama AI 어시스턴트
   ============================================= */
const OLLAMA_BASE = 'http://localhost:11434';
let ollamaOK = false;
let aiAbortCtrl = null;

/** Ollama 서버 연결 확인 + 모델 목록 로드 */
async function initOllama() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);

    aiModelSelect.innerHTML = models.length
      ? models.map(m => `<option value="${m}">${m}</option>`).join('')
      : '<option value="">모델 없음 (사전에 ollama pull 필요)</option>';

    ollamaOK = models.length > 0;
    aiStatusDot.className = `ai-status-dot ${ollamaOK ? 'ok' : 'warn'}`;
    aiStatusText.textContent = ollamaOK
      ? `연결됨 — 모델 ${models.length}개`
      : 'Ollama 연결됨 (모델 없음)';
    btnAISend.disabled = !ollamaOK;
    _updateAutofillBtn();
  } catch {
    aiStatusDot.className = 'ai-status-dot err';
    aiStatusText.textContent = 'Ollama 연결 실패 — 터미널에서 ollama serve 실행 후 재시도';
    aiModelSelect.innerHTML = '<option value="">연결 안 됨</option>';
    btnAISend.disabled = true;
    _updateAutofillBtn();
  }
}

/** 단어장 콘텍스트 문자열 생성 */
function buildAIContext() {
  if (!aiUseContext.checked || words.length === 0) return '';
  const list = words
    .slice(0, 40)
    .map(w => `- ${w.word}${w.partOfSpeech ? ` (${w.partOfSpeech})` : ''}: ${w.meaning}`)
    .join('\n');
  return `\n\n[사용자 단어장 (${Math.min(words.length, 40)}개)]
${list}`;
}

/** Ollama 스트리밍 요청 */
async function askOllama() {
  const query = aiQueryInput.value.trim();
  const model = aiModelSelect.value;
  if (!query || !ollamaOK || !model) return;

  // 진행 중이면 이전 요청 취소
  if (aiAbortCtrl) aiAbortCtrl.abort();
  aiAbortCtrl = new AbortController();

  const systemMsg =
    '당신은 옥스포드 영어 어원사전 수준의 전문 어원학자이자 한국인 영어 학습자를 돕는 AI 튜터입니다.\n' +
    '항상 한국어로 대답하세요 (영어 단어/예문 포함 가능).\n' +
    '단어를 설명할 때: 뜻, 품사, 상세 어원(최초 어원→변천 과정→어근 분해→파생어), 발음 팁, 예문을 심층적으로 알려주세요.\n' +
    '확실하지 않은 정보는 추측하지 말고 "확실하지 않음" 이라고 표기하세요.';

  const prompt = `${systemMsg}${buildAIContext()}\n\n[질문]\n${query}`;

  // UI: 응답 영역 표시
  aiResponseArea.hidden = false;
  aiResponseContent.textContent = '';
  aiResponseLoading.hidden = false;
  btnAISend.disabled = true;
  btnAIClear.hidden = true;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: true }),
      signal: aiAbortCtrl.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    aiResponseLoading.hidden = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.response) {
            aiResponseContent.textContent += obj.response;
            // 자동 스크롤
            aiResponseContent.scrollTop = aiResponseContent.scrollHeight;
          }
        } catch { /* 라인 파싱 실패 무시 */ }
      }
    }
  } catch (err) {
    aiResponseLoading.hidden = true;
    if (err.name === 'AbortError') {
      aiResponseContent.textContent += '\n[입력 취소됨]';
    } else {
      aiResponseContent.textContent = `❌ 오류: ${err.message}`;
    }
  } finally {
    btnAISend.disabled = !ollamaOK;
    btnAIClear.hidden = false;
    aiAbortCtrl = null;
  }
}

// AI 패널 토글
btnToggleAI.addEventListener('click', () => {
  const nowHidden = aiPanel.hidden;
  aiPanel.hidden = !nowHidden;
  btnToggleAI.setAttribute('aria-expanded', String(nowHidden));
  btnToggleAI.classList.toggle('active', nowHidden);
  if (nowHidden) aiQueryInput.focus();
});

// 질문 전송
btnAISend.addEventListener('click', askOllama);
aiQueryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    askOllama();
  }
});

// 응답 초기화
btnAIClear.addEventListener('click', () => {
  if (aiAbortCtrl) { aiAbortCtrl.abort(); aiAbortCtrl = null; }
  aiResponseArea.hidden = true;
  aiResponseContent.textContent = '';
  aiQueryInput.value = '';
  btnAIClear.hidden = true;
  aiQueryInput.focus();
});

/* =============================================
   토스트 메시지
   ============================================= */
function showToast(message, duration = 2200) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* =============================================
   샘플 데이터 (최초 실행 시)
   ============================================= */
function seedSampleData() {
  const samples = [
    {
      id: generateId(),
      word: 'ephemeral',
      pronunciation: '/ɪˈfɛm.ər.əl/',
      partOfSpeech: 'adjective',
      meaning: '일시적인, 덧없는, 순간적인',
      etymology: 'Greek ephemeros (epi- "on" + hemera "day") → 하루만 사는',
      example: 'The ephemeral beauty of cherry blossoms makes them even more precious.',
      tags: ['literature', 'nature'],
      note: '비슷한 단어: transient, fleeting, momentary, short-lived',
      isFavorite: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      word: 'serendipity',
      pronunciation: '/ˌser.ənˈdɪp.ɪ.ti/',
      partOfSpeech: 'noun',
      meaning: '뜻밖의 행운, 우연한 발견',
      etymology: 'Horace Walpole이 1754년 페르시아 동화 "세렌딥의 세 왕자"에서 만든 신조어',
      example: 'It was pure serendipity that I found my lost ring while looking for my keys.',
      tags: ['positive', 'luck'],
      note: '발음에 주의: "seren-DIP-ity"에 강세',
      isFavorite: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      word: 'ubiquitous',
      pronunciation: '/juːˈbɪk.wɪ.təs/',
      partOfSpeech: 'adjective',
      meaning: '어디에나 있는, 편재하는',
      etymology: 'Latin ubique "everywhere" → 어디에나',
      example: 'Smartphones have become ubiquitous in modern society.',
      tags: ['tech', 'common'],
      note: 'ubiquity (명사형)도 함께 외우기',
      isFavorite: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  words = samples;
  saveWords();
}

/* =============================================
   초기화
   ============================================= */
(function init() {
  if (words.length === 0) {
    seedSampleData();
    fileStatusText.textContent = '✨ 샘플 단어 3개로 시작합니다 — 「💾 저장」으로 JSON 파일 생성 가능';
  } else {
    fileStatusText.textContent = `🗂️ localStorage에서 ${words.length}개 단어 로드됨`;
  }
  renderWords();
  initOllama(); // Ollama 연결 확인
})();
