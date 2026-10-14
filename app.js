// Main Interactive Application Logic for UBND Xã Tân An Hội - Phòng Hạ Tầng
document.addEventListener('DOMContentLoaded', () => {

  // State Management
  const state = {
    currentField: 'dat-dai', // 'dat-dai', 'xay-dung', 'moi-truong', 'quy-hoach'
    currentLevel: 'all',
    currentTag: 'all',
    procedureSearchQuery: '',
    currentHeroIndex: 0,
    heroAutoTimer: null
  };

  const portalData = window.PORTAL_DATA || { fields: [], news: [], extraProcedures: {} };
  const tthcData = window.TTHC_DATA || { procedures: [], counts: {}, legal_docs: [] };

  // DOM Elements
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  
  // Hero Elements
  const heroImageContainer = document.getElementById('heroImageContainer');
  const heroCategoryBadge = document.getElementById('heroCategoryBadge');
  const heroTitle = document.getElementById('heroTitle');
  const heroSummary = document.getElementById('heroSummary');
  const heroDetailBtn = document.getElementById('heroDetailBtn');
  const prevHeroBtn = document.getElementById('prevHeroBtn');
  const nextHeroBtn = document.getElementById('nextHeroBtn');
  const heroDots = document.getElementById('heroDots');

  // Procedures DOM Elements
  const activeFieldBadge = document.getElementById('activeFieldBadge');
  const activeFieldSubtitle = document.getElementById('activeFieldSubtitle');
  const activeFieldTitle = document.getElementById('activeFieldTitle');
  const filterLevelRow = document.getElementById('filterLevelRow');
  const tagFiltersRow = document.getElementById('tagFiltersRow');
  const procedureFilterInput = document.getElementById('procedureFilterInput');
  const procedureCardsGrid = document.getElementById('procedureCardsGrid');
  const procedureCountDisplay = document.getElementById('procedureCountDisplay');
  const noProcedureState = document.getElementById('noProcedureState');
  const viewLegalDocsBtn = document.getElementById('viewLegalDocsBtn');

  // Search in Header
  const globalSearchInput = document.getElementById('globalSearchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const globalSearchBtn = document.getElementById('globalSearchBtn');

  // Modals
  const detailModal = document.getElementById('detailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalLevelBadge = document.getElementById('modalLevelBadge');
  const modalCodeBadge = document.getElementById('modalCodeBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalDuration = document.getElementById('modalDuration');
  const modalAgency = document.getElementById('modalAgency');
  const modalLegal = document.getElementById('modalLegal');
  const modalAgencyDetail = document.getElementById('modalAgencyDetail');
  const copyDetailBtn = document.getElementById('copyDetailBtn');
  const printDetailBtn = document.getElementById('printDetailBtn');

  // Article Modal
  const articleModal = document.getElementById('articleModal');
  const closeArticleModalBtn = document.getElementById('closeArticleModalBtn');
  const articleModalImage = document.getElementById('articleModalImage');
  const articleModalCategory = document.getElementById('articleModalCategory');
  const articleModalTitle = document.getElementById('articleModalTitle');
  const articleModalDate = document.getElementById('articleModalDate');
  const articleModalSummary = document.getElementById('articleModalSummary');
  const articleModalContent = document.getElementById('articleModalContent');

  // Legal Docs Modal
  const legalDocsModal = document.getElementById('legalDocsModal');
  const legalDocsList = document.getElementById('legalDocsList');

  // Initialize Lucide Icons helper
  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 1. LIVE CLOCK & DATE
  function updateLiveClock() {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = `${dayName}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (currentDateDisplay) currentDateDisplay.textContent = dateStr;
    if (currentTimeDisplay) currentTimeDisplay.textContent = timeStr;
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // 2. HERO SLIDER LOGIC
  function updateHeroSlide(index) {
    if (!portalData.news || portalData.news.length === 0) return;
    const item = portalData.news[index];
    state.currentHeroIndex = index;

    // Transition effect
    heroImageContainer.style.opacity = '0.5';
    setTimeout(() => {
      heroImageContainer.style.backgroundImage = `url('${item.heroImage}')`;
      heroImageContainer.style.opacity = '1';
    }, 200);

    heroCategoryBadge.textContent = item.category;
    heroTitle.innerHTML = item.title.replace(/xã Tân An Hội/i, '<br>xã Tân An Hội');
    heroSummary.textContent = item.summary;

    // Render dots
    heroDots.innerHTML = portalData.news.map((_, i) => {
      const activeClass = i === index ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white';
      return `<button onclick="selectHeroSlide(${i})" class="h-2 rounded-full transition-all duration-300 ${activeClass}"></button>`;
    }).join('');

    // Highlight active thumbnail in bottom cards
    document.querySelectorAll('.thumb-card').forEach((card, i) => {
      if (i === index) {
        card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/90');
      } else {
        card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/90');
      }
    });

    initIcons();
  }

  window.selectHeroSlide = function(i) {
    updateHeroSlide(i);
    resetHeroTimer();
  };

  window.selectArticle = function(i) {
    updateHeroSlide(i);
    openArticleModal(portalData.news[i]);
    resetHeroTimer();
  };

  function nextHero() {
    const nextIdx = (state.currentHeroIndex + 1) % portalData.news.length;
    updateHeroSlide(nextIdx);
  }

  function prevHero() {
    const prevIdx = (state.currentHeroIndex - 1 + portalData.news.length) % portalData.news.length;
    updateHeroSlide(prevIdx);
  }

  function resetHeroTimer() {
    clearInterval(state.heroAutoTimer);
    state.heroAutoTimer = setInterval(nextHero, 7000);
  }

  if (nextHeroBtn) nextHeroBtn.addEventListener('click', () => { nextHero(); resetHeroTimer(); });
  if (prevHeroBtn) prevHeroBtn.addEventListener('click', () => { prevHero(); resetHeroTimer(); });

  // Bottom thumbnail scroll buttons
  const prevThumbBtn = document.getElementById('prevThumbBtn');
  const nextThumbBtn = document.getElementById('nextThumbBtn');
  if (prevThumbBtn) prevThumbBtn.addEventListener('click', () => { prevHero(); resetHeroTimer(); });
  if (nextThumbBtn) nextThumbBtn.addEventListener('click', () => { nextHero(); resetHeroTimer(); });

  // Hero Detail click opens article modal
  if (heroDetailBtn) {
    heroDetailBtn.addEventListener('click', () => {
      const currentNews = portalData.news[state.currentHeroIndex];
      openArticleModal(currentNews);
    });
  }

  // 3. ARTICLE MODAL
  function openArticleModal(item) {
    if (!item) return;
    articleModalImage.src = item.heroImage;
    articleModalCategory.textContent = item.category;
    articleModalTitle.textContent = item.title;
    articleModalDate.textContent = item.date;
    articleModalSummary.textContent = item.summary;
    articleModalContent.innerHTML = item.content.split('\n\n').map(p => {
      if (p.startsWith('- ') || p.startsWith('• ')) {
        return `<ul class="list-disc pl-5 space-y-1 text-slate-700">${p.split('\n').map(li => `<li>${li.replace(/^[-•]\s*/, '')}</li>`).join('')}</ul>`;
      }
      return `<p class="leading-relaxed">${p}</p>`;
    }).join('');

    articleModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initIcons();
  }

  if (closeArticleModalBtn) {
    closeArticleModalBtn.addEventListener('click', () => {
      articleModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }

  // 4. FIELD SWITCHER (LĨNH VỰC)
  function switchField(fieldId) {
    state.currentField = fieldId;
    state.currentLevel = 'all';
    state.currentTag = 'all';
    state.procedureSearchQuery = '';
    if (procedureFilterInput) procedureFilterInput.value = '';

    // Update Sidebar Button Styles
    document.querySelectorAll('.field-btn').forEach(btn => {
      const id = btn.getAttribute('data-field');
      const icon = btn.querySelector('i');
      if (id === fieldId) {
        btn.className = 'field-btn w-full p-3 rounded-xl flex items-center justify-between transition-all duration-200 text-left bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20';
        btn.querySelectorAll('.text-slate-500, .text-indigo-600, .text-emerald-600, .text-sky-600, .text-slate-700').forEach(el => {
          el.classList.add('text-white');
        });
      } else {
        btn.className = 'field-btn w-full p-3 rounded-xl flex items-center justify-between transition-all duration-200 text-left bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60';
      }
    });

    // Update Section Title & Badges
    const fieldObj = portalData.fields.find(f => f.id === fieldId) || { name: 'Thủ tục', countText: '' };
    activeFieldBadge.textContent = `LĨNH VỰC: ${fieldObj.name.toUpperCase()}`;
    activeFieldSubtitle.textContent = fieldObj.description;
    activeFieldTitle.textContent = `Danh mục Dịch vụ công & Thủ tục Hành chính: ${fieldObj.name}`;

    // Level filter visibility
    if (fieldId === 'dat-dai') {
      filterLevelRow.classList.remove('hidden');
      viewLegalDocsBtn.classList.remove('hidden');
    } else {
      filterLevelRow.classList.add('hidden');
      viewLegalDocsBtn.classList.add('hidden');
    }

    renderTagFilters();
    renderProceduresList();
    initIcons();

    // Scroll to procedures section smoothly
    const section = document.getElementById('proceduresSection');
    if (section && window.innerWidth < 1024) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  document.querySelectorAll('.field-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-field');
      switchField(id);
    });
  });

  // 5. PROCEDURES LIST LOGIC
  function getCurrentFieldProcedures() {
    if (state.currentField === 'dat-dai') {
      return tthcData.procedures;
    } else {
      return portalData.extraProcedures[state.currentField] || [];
    }
  }

  function renderTagFilters() {
    const list = getCurrentFieldProcedures();
    // Collect unique tags
    const tagSet = new Set();
    list.forEach(item => {
      (item.tags || []).forEach(t => tagSet.add(t));
    });

    const tags = Array.from(tagSet);
    tagFiltersRow.innerHTML = `
      <button onclick="setProcedureTag('all')" class="proc-tag-btn px-2.5 py-1 rounded-md text-xs font-semibold ${state.currentTag === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
        Tất cả (${list.length})
      </button>
    ` + tags.map(t => {
      const count = list.filter(i => (i.tags || []).includes(t)).length;
      const isActive = state.currentTag === t;
      return `
        <button onclick="setProcedureTag('${t}')" class="proc-tag-btn px-2.5 py-1 rounded-md text-xs font-medium transition ${isActive ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          ${t} (${count})
        </button>
      `;
    }).join('');
  }

  window.setProcedureTag = function(t) {
    state.currentTag = t;
    renderTagFilters();
    renderProceduresList();
  };

  // Level buttons for Dat Dai
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => {
        b.className = 'level-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
      });
      btn.className = 'level-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm';
      state.currentLevel = btn.getAttribute('data-level');
      renderProceduresList();
    });
  });

  function getFilteredProcedures() {
    const list = getCurrentFieldProcedures();
    const q = state.procedureSearchQuery.toLowerCase().trim();

    return list.filter(item => {
      // Level filter
      if (state.currentField === 'dat-dai' && state.currentLevel !== 'all') {
        if (item.level !== state.currentLevel) return false;
      }
      // Tag filter
      if (state.currentTag !== 'all') {
        if (!(item.tags || []).includes(state.currentTag)) return false;
      }
      // Query filter
      if (q) {
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCode = (item.code || '').toLowerCase().includes(q);
        const matchAgency = (item.agency || '').toLowerCase().includes(q);
        return matchName || matchCode || matchAgency;
      }
      return true;
    });
  }

  function renderProceduresList() {
    const filtered = getFilteredProcedures();
    procedureCountDisplay.textContent = filtered.length;

    if (filtered.length === 0) {
      procedureCardsGrid.innerHTML = '';
      noProcedureState.classList.remove('hidden');
      return;
    }

    noProcedureState.classList.add('hidden');
    procedureCardsGrid.innerHTML = filtered.map(item => {
      const isProv = item.level === 'Cấp Tỉnh';
      const badgeClass = isProv 
        ? 'bg-sky-50 text-sky-700 border-sky-200' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

      const tagPills = (item.tags || []).map(t => 
        `<span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-medium">${t}</span>`
      ).join(' ');

      return `
        <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}">
                ${item.level || 'Cấp Xã'}
              </span>
              <span class="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                ${item.code}
              </span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm leading-snug mb-2 group-hover:text-blue-700 transition">
              ${item.stt}. ${item.name}
            </h4>
            <div class="flex flex-wrap gap-1 mb-3">
              ${tagPills}
            </div>
            <div class="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2 mb-3">
              <div class="flex items-center gap-1.5">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                <span class="font-medium text-slate-700">${item.duration || 'Theo quy định'}</span>
              </div>
            </div>
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Phòng Hạ tầng</span>
            <button onclick="openProcedureModal('${item.code}', ${item.stt})" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1 transition">
              <span>Chi tiết</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    initIcons();
  }

  // Procedure search input
  if (procedureFilterInput) {
    procedureFilterInput.addEventListener('input', (e) => {
      state.procedureSearchQuery = e.target.value;
      renderProceduresList();
    });
  }

  // 6. PROCEDURE DETAIL MODAL
  window.openProcedureModal = function(code, stt) {
    const list = getCurrentFieldProcedures();
    const item = list.find(p => p.code === code || p.stt === stt);
    if (!item) return;

    modalLevelBadge.textContent = item.level || 'Cấp Xã';
    modalLevelBadge.className = (item.level === 'Cấp Tỉnh')
      ? 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white'
      : 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white';

    modalCodeBadge.textContent = `Mã: ${item.code}`;
    modalTitle.textContent = `${item.stt}. ${item.name}`;
    modalDuration.textContent = item.duration || 'Theo quy định chuẩn';
    modalAgency.textContent = item.level === 'Cấp Tỉnh' 
      ? 'Văn phòng Đăng ký đất đai TP / Sở TN&MT' 
      : 'UBND Xã Tân An Hội (Phòng Hạ tầng)';

    modalLegal.textContent = item.legal_basis || 'Luật Đất đai 2024, Luật Xây dựng, Quyết định số 44/2026/QĐ-UBND và các văn bản hướng dẫn hiện hành.';
    modalAgencyDetail.textContent = item.agency || '- Cơ quan thực hiện: UBND Xã Tân An Hội (Phòng Hạ tầng - Địa chính - Môi trường).\n- Cơ quan phối hợp: Chi cục Thuế, Văn phòng Đăng ký đất đai.';

    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initIcons();

    // Copy Button Action
    copyDetailBtn.onclick = () => {
      const text = `THỦ TỤC: ${item.name}\n`
        + `Mã TTHC: ${item.code}\n`
        + `Cơ quan thực hiện: ${modalAgency.textContent}\n`
        + `Thời hạn giải quyết: ${item.duration}\n`
        + `Căn cứ: ${item.legal_basis}`;

      navigator.clipboard.writeText(text).then(() => {
        copyDetailBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i><span class="text-emerald-700">Đã sao chép!</span>`;
        initIcons();
        setTimeout(() => {
          copyDetailBtn.innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i><span>Sao chép</span>`;
          initIcons();
        }, 2000);
      });
    };

    // Print Button Action
    printDetailBtn.onclick = () => {
      window.print();
    };
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      detailModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }

  // Close modals on clicking outside or ESC
  window.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
    if (e.target === articleModal) {
      articleModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
    if (e.target === legalDocsModal) {
      legalDocsModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
    // Close search dropdown on outside click
    if (!e.target.closest('#globalSearchInput') && !e.target.closest('#searchDropdown')) {
      searchDropdown.classList.add('hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      detailModal.classList.add('hidden');
      articleModal.classList.add('hidden');
      legalDocsModal.classList.add('hidden');
      searchDropdown.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });

  // 7. LEGAL DOCS MODAL
  if (viewLegalDocsBtn) {
    viewLegalDocsBtn.addEventListener('click', () => {
      legalDocsList.innerHTML = tthcData.legal_docs.map(doc => `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">${doc.category}</span>
            <span class="text-xs text-slate-500">${doc.date}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-snug">${doc.title}</h4>
          <div class="text-xs text-slate-500">Cơ quan ban hành: <span class="font-medium text-slate-700">${doc.issuer}</span></div>
          <p class="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">${doc.summary}</p>
          <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span class="font-mono text-slate-400 text-[11px]">${doc.file_name}</span>
            <span class="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded text-[11px]">Văn bản lưu hành</span>
          </div>
        </div>
      `).join('');

      legalDocsModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      initIcons();
    });
  }

  // 8. GLOBAL REALTIME SEARCH IN HEADER
  function handleGlobalSearch(q) {
    q = q.toLowerCase().trim();
    if (!q) {
      searchDropdown.classList.add('hidden');
      return;
    }

    const matches = [];

    // Search News
    portalData.news.forEach((n, idx) => {
      if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
        matches.push({
          type: 'Tin tức / Dự án',
          title: n.title,
          badge: n.category,
          action: () => selectArticle(idx)
        });
      }
    });

    // Search Procedures in all 4 fields
    // Dat dai
    tthcData.procedures.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) {
        matches.push({
          type: 'TTHC Đất đai',
          title: p.name,
          badge: p.code,
          action: () => {
            switchField('dat-dai');
            openProcedureModal(p.code, p.stt);
          }
        });
      }
    });

    // Other fields
    ['xay-dung', 'moi-truong', 'quy-hoach'].forEach(f => {
      (portalData.extraProcedures[f] || []).forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) {
          matches.push({
            type: `TTHC ${f.toUpperCase()}`,
            title: p.name,
            badge: p.code,
            action: () => {
              switchField(f);
              openProcedureModal(p.code, p.stt);
            }
          });
        }
      });
    });

    if (matches.length === 0) {
      searchDropdown.innerHTML = `<div class="p-3 text-xs text-slate-500 text-center">Không tìm thấy thông tin phù hợp với "${q}"</div>`;
    } else {
      searchDropdown.innerHTML = matches.slice(0, 8).map((m, i) => `
        <div onclick="window.triggerSearchMatch(${i})" class="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition border-b border-slate-100 last:border-0">
          <div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span class="font-bold text-blue-600 uppercase">${m.type}</span>
            <span class="font-mono bg-slate-100 px-1.5 py-0.2 rounded">${m.badge}</span>
          </div>
          <div class="text-xs font-semibold text-slate-800 line-clamp-1">${m.title}</div>
        </div>
      `).join('');

      window._currentMatches = matches;
    }

    searchDropdown.classList.remove('hidden');
  }

  window.triggerSearchMatch = function(idx) {
    if (window._currentMatches && window._currentMatches[idx]) {
      searchDropdown.classList.add('hidden');
      globalSearchInput.value = '';
      window._currentMatches[idx].action();
    }
  };

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      handleGlobalSearch(e.target.value);
    });
    globalSearchInput.addEventListener('focus', (e) => {
      if (e.target.value.trim()) handleGlobalSearch(e.target.value);
    });
  }

  // Initial startup
  updateHeroSlide(0);
  resetHeroTimer();
  switchField('dat-dai');
  initIcons();
});
