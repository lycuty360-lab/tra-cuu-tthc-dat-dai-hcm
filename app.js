// Main Application Logic for TTHC Portal
document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    currentTab: 'tthc',
    searchQuery: '',
    currentLevel: 'all',
    currentTag: 'all',
    viewMode: 'card', // 'card' or 'table'
    selectedProcedure: null
  };

  const data = window.TTHC_DATA || { procedures: [], counts: {}, legal_docs: [] };

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const cardView = document.getElementById('cardView');
  const tableView = document.getElementById('tableView');
  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const filteredCount = document.getElementById('filteredCount');
  const searchNotice = document.getElementById('searchNotice');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  // Stats
  document.getElementById('statTotal').textContent = data.counts.total || 46;
  document.getElementById('statProvince').textContent = data.counts.province || 30;
  document.getElementById('statCommune').textContent = data.counts.commune || 16;
  document.getElementById('statDocs').textContent = data.legal_docs.length || 10;
  document.getElementById('badgeTthcCount').textContent = data.counts.total || 46;

  // View Mode buttons
  const viewCardBtn = document.getElementById('viewCardBtn');
  const viewTableBtn = document.getElementById('viewTableBtn');

  // Modal elements
  const detailModal = document.getElementById('detailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalLevelBadge = document.getElementById('modalLevelBadge');
  const modalCodeBadge = document.getElementById('modalCodeBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalDuration = document.getElementById('modalDuration');
  const modalAgency = document.getElementById('modalAgency');
  const modalLegal = document.getElementById('modalLegal');
  const modalAgencyDetail = document.getElementById('modalAgencyDetail');
  const copyBtn = document.getElementById('copyBtn');
  const printBtn = document.getElementById('printBtn');

  // Initialize Lucide icons
  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Filter Procedures
  function getFilteredProcedures() {
    const q = state.searchQuery.toLowerCase().trim();
    return data.procedures.filter(item => {
      // Level check
      if (state.currentLevel !== 'all' && item.level !== state.currentLevel) {
        return false;
      }
      // Tag check
      if (state.currentTag !== 'all' && !item.tags.includes(state.currentTag)) {
        return false;
      }
      // Query check
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchLegal = (item.legal_basis || '').toLowerCase().includes(q);
        const matchAgency = (item.agency || '').toLowerCase().includes(q);
        return matchName || matchCode || matchLegal || matchAgency;
      }
      return true;
    });
  }

  // Render Card View
  function renderCards(list) {
    if (list.length === 0) {
      cardView.innerHTML = '';
      return;
    }
    cardView.innerHTML = list.map(item => {
      const isProv = item.level === 'Cấp Tỉnh';
      const badgeColor = isProv ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      const tagPills = item.tags.map(t => `<span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-medium">${t}</span>`).join(' ');

      return `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-gov-600 transition flex flex-col justify-between overflow-hidden group">
          <div class="p-5">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}">
                ${item.level}
              </span>
              <span class="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                ${item.code}
              </span>
            </div>
            <h3 class="font-bold text-slate-800 text-sm sm:text-base leading-snug mb-3 group-hover:text-gov-700 transition">
              ${item.stt}. ${item.name}
            </h3>
            <div class="flex flex-wrap gap-1.5 mb-4">
              ${tagPills}
            </div>
            <div class="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <div class="flex items-start gap-1.5">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0"></i>
                <span>${item.duration}</span>
              </div>
              <div class="flex items-start gap-1.5">
                <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0"></i>
                <span class="line-clamp-1">${item.agency.replace(/- Cơ quan[^:]*:\s*/g, '').slice(0, 70)}...</span>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">QĐ 5548/QĐ-UBND</span>
            <button onclick="openProcedureDetail('${item.code}', ${item.stt})" class="text-xs font-semibold text-gov-600 hover:text-gov-800 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>Xem chi tiết</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Table View
  function renderTable(list) {
    if (list.length === 0) {
      tableBody.innerHTML = '';
      return;
    }
    tableBody.innerHTML = list.map(item => {
      const isProv = item.level === 'Cấp Tỉnh';
      const badgeColor = isProv ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800';

      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3 px-4 text-center font-medium text-slate-500">${item.stt}</td>
          <td class="py-3 px-4 font-mono font-medium text-slate-800 text-xs">${item.code}</td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800 hover:text-gov-700 cursor-pointer" onclick="openProcedureDetail('${item.code}', ${item.stt})">
              ${item.name}
            </div>
            <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${item.tags.join(' • ')}</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${badgeColor}">
              ${item.level}
            </span>
          </td>
          <td class="py-3 px-4 text-xs text-slate-600">${item.duration}</td>
          <td class="py-3 px-4 text-center">
            <button onclick="openProcedureDetail('${item.code}', ${item.stt})" class="px-2.5 py-1 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded text-xs font-medium transition">
              Chi tiết
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Documents Library
  function renderDocs() {
    const docsGrid = document.getElementById('docsGrid');
    if (!docsGrid) return;

    docsGrid.innerHTML = data.legal_docs.map(doc => {
      return `
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                ${doc.category}
              </span>
              <span class="text-xs text-slate-500">${doc.date}</span>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1.5 leading-snug">
              ${doc.title}
            </h3>
            <div class="text-xs text-slate-500 mb-3">
              Cơ quan ban hành: <span class="font-medium text-slate-700">${doc.issuer}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              ${doc.summary}
            </p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-slate-400 truncate">${doc.file_name}</span>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium flex items-center gap-1">
                <i data-lucide="file-text" class="w-3.5 h-3.5 text-slate-500"></i>
                Tài liệu PDF
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update UI List
  function updateList() {
    const filtered = getFilteredProcedures();
    filteredCount.textContent = filtered.length;

    if (state.searchQuery.trim()) {
      clearSearchBtn.classList.remove('hidden');
      searchNotice.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
      searchNotice.classList.add('hidden');
    }

    if (filtered.length === 0) {
      cardView.classList.add('hidden');
      tableView.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      if (state.viewMode === 'card') {
        cardView.classList.remove('hidden');
        tableView.classList.add('hidden');
        renderCards(filtered);
      } else {
        cardView.classList.add('hidden');
        tableView.classList.remove('hidden');
        renderTable(filtered);
      }
    }

    initIcons();
  }

  // Open Procedure Modal
  window.openProcedureDetail = function(code, stt) {
    const item = data.procedures.find(p => (code && p.code === code) || p.stt === stt);
    if (!item) return;

    state.selectedProcedure = item;

    modalLevelBadge.textContent = item.level;
    modalLevelBadge.className = item.level === 'Cấp Tỉnh' 
      ? 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white'
      : 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white';

    modalCodeBadge.textContent = `Mã: ${item.code}`;
    modalTitle.textContent = `${item.stt}. ${item.name}`;
    modalDuration.textContent = item.duration;
    modalAgency.textContent = item.level === 'Cấp Tỉnh' 
      ? 'Văn phòng Đăng ký đất đai TP / Sở TN&MT' 
      : 'UBND cấp Xã / Phường / Thị trấn';

    modalLegal.textContent = item.legal_basis || 'Theo các văn bản hướng dẫn thi hành Luật Đất đai 2024, Nghị định 101, 102 và Quyết định số 44/2026/QĐ-UBND TP.HCM.';
    modalAgencyDetail.textContent = item.agency || '- Cơ quan thực hiện: Văn phòng Đăng ký đất đai Thành phố và các Chi nhánh Văn phòng Đăng ký đất đai.\n- Cơ quan phối hợp: UBND cấp xã, Chi cục Thuế.';

    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initIcons();
  };

  // Close Modal
  function closeModal() {
    detailModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  closeModalBtn.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) closeModal();
  });

  // Copy Detail
  copyBtn.addEventListener('click', () => {
    if (!state.selectedProcedure) return;
    const item = state.selectedProcedure;
    const text = `THỦ TỤC HÀNH CHÍNH: ${item.name}\n`
      + `Cấp thực hiện: ${item.level}\n`
      + `Mã TTHC: ${item.code}\n`
      + `Thời hạn giải quyết: ${item.duration}\n`
      + `Căn cứ pháp lý: \n${item.legal_basis}\n`
      + `Cơ quan thực hiện: \n${item.agency}`;

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i><span class="text-emerald-700">Đã sao chép!</span>`;
      initIcons();
      setTimeout(() => {
        copyBtn.innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i><span>Sao chép</span>`;
        initIcons();
      }, 2000);
    });
  });

  // Print
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Search Events
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    updateList();
  });
  searchBtn.addEventListener('click', () => {
    updateList();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    updateList();
    searchInput.focus();
  });

  // Quick search helper
  window.filterBySearch = function(keyword) {
    // Switch to TTHC tab
    document.querySelector('[data-tab="tthc"]').click();
    searchInput.value = keyword;
    state.searchQuery = keyword;
    updateList();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Level Buttons
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => {
        b.className = 'level-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200';
      });
      btn.className = 'level-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-gov-600 text-white shadow-sm';
      state.currentLevel = btn.getAttribute('data-level');
      updateList();
    });
  });

  // Tag Buttons
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tag-btn').forEach(b => {
        b.className = 'tag-btn px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium';
      });
      btn.className = 'tag-btn px-2.5 py-1 rounded-md text-xs bg-gov-600 text-white font-medium shadow-sm';
      state.currentTag = btn.getAttribute('data-tag');
      updateList();
    });
  });

  // Reset filter button
  resetFilterBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.currentLevel = 'all';
    state.currentTag = 'all';
    searchInput.value = '';
    document.querySelector('.level-btn[data-level="all"]').click();
    document.querySelector('.tag-btn[data-tag="all"]').click();
    updateList();
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      state.currentTab = tab;

      // Update button styles
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.className = 'tab-btn px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100';
      });
      btn.className = 'tab-btn px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 bg-gov-50 text-gov-700 border border-gov-100';

      // Update contents
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tabContent-${tab}`).classList.remove('hidden');

      // Hide or show view switcher
      const viewModeContainer = document.getElementById('viewModeContainer');
      if (tab === 'tthc') {
        viewModeContainer.classList.remove('hidden');
      } else {
        viewModeContainer.classList.add('hidden');
      }

      initIcons();
    });
  });

  // View Mode toggles
  viewCardBtn.addEventListener('click', () => {
    state.viewMode = 'card';
    viewCardBtn.className = 'p-1.5 rounded-md bg-white shadow-sm text-gov-700 font-medium text-xs flex items-center gap-1';
    viewTableBtn.className = 'p-1.5 rounded-md text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1';
    updateList();
  });
  viewTableBtn.addEventListener('click', () => {
    state.viewMode = 'table';
    viewTableBtn.className = 'p-1.5 rounded-md bg-white shadow-sm text-gov-700 font-medium text-xs flex items-center gap-1';
    viewCardBtn.className = 'p-1.5 rounded-md text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1';
    updateList();
  });

  // Initial render
  updateList();
  renderDocs();
  initIcons();
});
