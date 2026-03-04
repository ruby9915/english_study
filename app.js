/**
 * 나의 영단어 노트 — app.js
 * - localStorage 기반 영단어 CRUD
 * - 검색, 필터, 정렬
 * - 즐겨찾기
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
  }
  renderWords();
})();
