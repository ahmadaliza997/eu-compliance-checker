const TOTAL_ITEMS = 31;
const sectionCounts = [8, 6, 5, 6, 6];
let allSectionsVisible = false;
let currentLang = 'en';

const STORAGE_KEY = 'eu_compliance_checker_v1';
const LANG_KEY = 'eu_compliance_lang';

// ── Translation Data ──────────────────────────────────────
const translations = {
  en: {
    pageTitle: "EU Export Compliance Checker — Pakistani Textile Exporters",
    progressLabel: "Overall Readiness",
    progressStatus: "{checked} of {total} items checked",
    saveIndicator: "💾 Auto-saved",
    criticalText: "{count} critical {plural} unchecked — address these before shipping",
    criticalTextAllClear: "✓ All critical items checked — your shipment passes the key compliance gates",
    criticalJump: "Show me →",
    toast: "✓ Link copied — share with your freight forwarder or buying agent",
    resetConfirm: "Reset all checkboxes? Your progress will be cleared.",
    band100: "Shipment Ready — All 31 Items Checked",
    band100Desc: "Your shipment documentation should be in order. Final reminder: confirm your REACH certificate is less than 12 months old and your REX declaration is word-for-word correct on your commercial invoice.",
    band71: "Almost Ready — {remaining} Items Remaining",
    band71Desc: "You are {pct}% compliant. {criticalMsg} Complete the remaining items and you are ready to ship.",
    band41: "Partially Ready — Significant Gaps Remain",
    band41Desc: "You are {pct}% through the checklist. {criticalMsg} Complete all sections before your cargo is loaded.",
    band0: "Not Ready to Ship — Critical Gaps Identified",
    band0Desc: "You are only {pct}% through compliance checks. {criticalMsg} Shipping without completing these checks risks your container being rejected at Hamburg or Rotterdam, your buyer being billed the full tariff, and your shipment being destroyed at your cost."
  },
  ur: {
    pageTitle: "یو ای ایکسپورٹ کمپلائنس چیکر — پاکستانی ٹیکسٹائل ایکسپورٹرز",
    progressLabel: "مجموعی تیاری",
    progressStatus: "{total} میں سے {checked} آئٹمز چیک کیے گئے",
    saveIndicator: "💾 خود بخود محفوظ",
    criticalText: "{count} اہم {plural} چیک نہیں کیے گئے — شپنگ سے پہلے ان کو حل کریں",
    criticalTextAllClear: "✓ تمام اہم آئٹمز چیک کیے گئے — آپ کی شپمنٹ اہم کمپلائنس گیٹس پاس کرتی ہے",
    criticalJump: "مجھے دکھائیں →",
    toast: "✓ لنک کاپی ہو گیا — اپنے فریٹ فارورڈر یا خریداری ایجنٹ کے ساتھ شیئر کریں",
    resetConfirm: "تمام چیک باکسز ری سیٹ کریں؟ آپ کی پیشرافت صاف ہو جائے گی۔",
    band100: "شپمنٹ تیار — تمام 31 آئٹمز چیک کیے گئے",
    band100Desc: "آپ کی شپمنٹ دستاویزات درست ہونی چاہئیں۔ آخری یاد دہانی: تصدیق کریں کہ آپ کا ریچ سرٹیفکیٹ 12 ماہ سے کم پرانا ہے اور آپ کا ریکس اعلان آپ کے کمرشل انوائس پر لفظ بہ لفظ درست ہے۔",
    band71: "تقریباً تیار — {remaining} آئٹمز باقی",
    band71Desc: "آپ {pct}% کمپلائنس ہیں۔ {criticalMsg} باقی آئٹمز مکمل کریں اور آپ شپنگ کے لیے تیار ہیں۔",
    band41: "جزوی طور پر تیار — اہم خلا باقی",
    band41Desc: "آپ چیک لسٹ سے {pct}% ہیں۔ {criticalMsg} اپنے کارگو لوڈ ہونے سے پہلے تمام حصے مکمل کریں۔",
    band0: "شپنگ کے لیے تیار نہیں — اہم خلا شناخت ہوئے",
    band0Desc: "آپ صرف کمپلائنس چیکس سے {pct}% ہیں۔ {criticalMsg} ان چیکس کو مکمل کیے بغیر شپنگ کرنا آپ کے کنٹینر کو ہیمبرگ یا روٹterdam پر مسترد ہونے، آپ کے خریدار سے پورا ٹیرف وصول ہونے، اور آپ کی شپمنٹ کو آپ کی لاگت پر تباہ ہونے کا خطرہ ہے۔"
  }
};

// ── Set Language ──────────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang;

  // Update HTML dir attribute
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  // Update language buttons
  document.getElementById('langEn').classList.toggle('active', lang === 'en');
  document.getElementById('langUr').classList.toggle('active', lang === 'ur');

  // Update all elements with data-en and data-ur attributes
  document.querySelectorAll('[data-en][data-ur]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (text) {
      if (text.includes('<')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Update page title
  document.title = translations[lang].pageTitle;

  // Update dynamic text elements
  updateDynamicText();

  // Save language preference
  try { localStorage.setItem(LANG_KEY, lang); } catch(e) {}

  // Re-render score banner if visible
  const checked = document.querySelectorAll('.check-item.checked').length;
  const criticalLeft = document.querySelectorAll('.check-item:not(.checked) .tag-critical').length;
  if (checked > 0) {
    updateScoreBanner(Math.round((checked / TOTAL_ITEMS) * 100), checked, criticalLeft);
  }
}

// ── Update dynamic text elements ──────────────────────────
function updateDynamicText() {
  const t = translations[currentLang];
  const checked = document.querySelectorAll('.check-item.checked').length;
  const criticalLeft = document.querySelectorAll('.check-item:not(.checked) .tag-critical').length;

  document.getElementById('progressLabel').textContent = t.progressLabel;
  document.getElementById('progressStatus').textContent = t.progressStatus.replace('{checked}', checked).replace('{total}', TOTAL_ITEMS);
  document.getElementById('saveIndicator').textContent = t.saveIndicator;
  document.getElementById('toast').textContent = t.toast;

  const criticalText = document.getElementById('criticalText');
  const strip = document.getElementById('criticalStrip');
  if (criticalLeft === 0) {
    criticalText.textContent = t.criticalTextAllClear;
  } else {
    const plural = criticalLeft === 1 ? (currentLang === 'ur' ? 'آئٹم' : 'item') : (currentLang === 'ur' ? 'آئٹمز' : 'items');
    criticalText.textContent = t.criticalText.replace('{count}', criticalLeft).replace('{plural}', plural);
  }
  document.querySelector('.critical-jump').textContent = t.criticalJump;
}

// ── Toggle individual checklist item ─────────────────────
function toggleItem(el) {
  el.classList.toggle('checked');
  saveState();
  updateProgress();
}

// ── Save state to localStorage ────────────────────────────
function saveState() {
  const state = [];
  document.querySelectorAll('.check-item').forEach((el, idx) => {
    state[idx] = el.classList.contains('checked');
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

// ── Load state from localStorage ─────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    const items = document.querySelectorAll('.check-item');
    items.forEach((el, idx) => {
      if (state[idx]) el.classList.add('checked');
    });
  } catch(e) {}
}

// ── Load language preference ─────────────────────────────
function loadLanguage() {
  try {
    const savedLang = localStorage.getItem(LANG_KEY);
    if (savedLang && (savedLang === 'en' || savedLang === 'ur')) {
      setLanguage(savedLang);
    }
  } catch(e) {}
}

// ── Reset all ─────────────────────────────────────────────
function resetAll() {
  const t = translations[currentLang];
  if (!confirm(t.resetConfirm)) return;
  document.querySelectorAll('.check-item').forEach(el => el.classList.remove('checked'));
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  updateProgress();
}

// ── Copy link to clipboard ────────────────────────────────
function copyLink() {
  const url = window.location.href.split('?')[0];
  try {
    navigator.clipboard.writeText(url).then(() => showToast());
  } catch(e) {
    const ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); showToast();
  }
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Jump to first unchecked critical item ─────────────────
function jumpToCritical() {
  const criticals = document.querySelectorAll('.check-item:not(.checked) .tag-critical');
  if (criticals.length === 0) return;
  const item = criticals[0].closest('.check-item');
  const sectionCard = item.closest('.section-card');
  if (sectionCard) {
    const idx = parseInt(sectionCard.id.split('-')[1]);
    showSection(idx, document.querySelectorAll('.tab-btn')[idx]);
  }
  setTimeout(() => {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    item.style.outline = '2px solid #D97706';
    item.style.outlineOffset = '3px';
    setTimeout(() => { item.style.outline = ''; item.style.outlineOffset = ''; }, 2000);
  }, 200);
}

// ── Update all progress indicators ───────────────────────
function updateProgress() {
  let totalChecked = 0;
  let totalCriticalUnchecked = 0;

  for (let i = 0; i < 5; i++) {
    const items = document.querySelectorAll(`#checklist-${i} .check-item`);
    const checked = document.querySelectorAll(`#checklist-${i} .check-item.checked`).length;
    const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

    document.getElementById(`pct-${i}`).textContent = pct + '%';
    document.getElementById(`fill-${i}`).style.width = pct + '%';

    const badge = document.getElementById(`tab${i}badge`);
    if (badge) {
      const remaining = items.length - checked;
      badge.textContent = remaining === 0 ? '✓' : remaining;
    }

    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[i]) {
      tabs[i].classList.toggle('complete', checked === items.length && items.length > 0);
    }

    const criticalUnchecked = document.querySelectorAll(`#checklist-${i} .check-item:not(.checked) .tag-critical`).length;
    totalCriticalUnchecked += criticalUnchecked;

    totalChecked += checked;
  }

  const overallPct = Math.round((totalChecked / TOTAL_ITEMS) * 100);
  const fill = document.getElementById('progressFill');
  fill.style.width = overallPct + '%';
  document.getElementById('progressPct').textContent = overallPct + '%';

  const t = translations[currentLang];
  document.getElementById('progressStatus').textContent = t.progressStatus.replace('{checked}', totalChecked).replace('{total}', TOTAL_ITEMS);

  if (overallPct >= 80) {
    fill.style.background = 'linear-gradient(90deg, #1A5C38 0%, #27AE60 100%)';
  } else if (overallPct >= 50) {
    fill.style.background = 'linear-gradient(90deg, #B8960C 0%, #1A5C38 100%)';
  } else {
    fill.style.background = 'linear-gradient(90deg, #C0392B 0%, #B8960C 100%)';
  }

  updateCriticalStrip(totalCriticalUnchecked);
  updateScoreBanner(overallPct, totalChecked, totalCriticalUnchecked);
}

// ── Critical items strip ──────────────────────────────────
function updateCriticalStrip(unchecked) {
  const strip = document.getElementById('criticalStrip');
  const text  = document.getElementById('criticalText');
  const t = translations[currentLang];

  if (unchecked === 0) {
    strip.classList.add('all-clear');
    text.textContent = t.criticalTextAllClear;
  } else {
    strip.classList.remove('all-clear');
    const plural = unchecked === 1 ? (currentLang === 'ur' ? 'آئٹم' : 'item') : (currentLang === 'ur' ? 'آئٹمز' : 'items');
    text.textContent = t.criticalText.replace('{count}', unchecked).replace('{plural}', plural);
  }
}

// ── Score interpretation banner ───────────────────────────
function updateScoreBanner(pct, checked, criticalLeft) {
  const banner  = document.getElementById('resultBanner');
  const content = document.getElementById('bannerContent');
  const t = translations[currentLang];

  if (checked === 0) {
    banner.classList.remove('show');
    return;
  }

  banner.classList.add('show');

  let html = '';

  if (pct === 100) {
    html = `<div class="score-band band-success">
      <div class="score-band-icon">🎉</div>
      <div class="score-band-body">
        <h3>${t.band100}</h3>
        <p>${t.band100Desc}</p>
      </div>
    </div>`;
  } else if (pct >= 71) {
    const criticalMsg = criticalLeft > 0 ? 
      (currentLang === 'ur' ? 
        `<strong>${criticalLeft} اہم آئٹم${criticalLeft > 1 ? 'ز' : ''} ابھی بھی چیک نہیں کیے گئے</strong> — یہ شپنگ سے پہلے حل ہونا چاہئیں۔` : 
        `<strong>${criticalLeft} critical item${criticalLeft > 1 ? 's' : ''} still unchecked</strong> — these must be resolved before shipping.`) 
      : (currentLang === 'ur' ? 'کوئی اہم آئٹمز باقی نہیں۔ باقی آئٹمز مکمل کریں اور آپ شپنگ کے لیے تیار ہیں۔' : 'No critical items outstanding. Complete the remaining items and you are ready to ship.');
    html = `<div class="score-band band-good">
      <div class="score-band-icon">🔵</div>
      <div class="score-band-body">
        <h3>${t.band71.replace('{remaining}', TOTAL_ITEMS - checked)}</h3>
        <p>${t.band71Desc.replace('{pct}', pct).replace('{criticalMsg}', criticalMsg)}</p>
      </div>
    </div>`;
  } else if (pct >= 41) {
    const criticalMsg = criticalLeft > 0 ? 
      (currentLang === 'ur' ? 
        `<strong>${criticalLeft} اہم آئٹم${criticalLeft > 1 ? 'ز' : ''} چیک نہیں کیے گئے</strong> — اگر آپ ابھی شپ کرتے ہیں، تو آپ ٹیرف پینلٹیز، کنٹینر مستردی، یا کسٹم تاخیر کا خطرہ مول لیتے ہیں۔` : 
        `<strong>${criticalLeft} critical item${criticalLeft > 1 ? 's' : ''} are unchecked</strong> — if you ship now, you risk tariff penalties, container rejection, or customs delays.`) 
      : (currentLang === 'ur' ? 'جاری رکھیں — ابھی تک کوئی اہم آئٹمز باقی نہیں۔' : 'Keep going — no critical items outstanding yet.');
    html = `<div class="score-band band-warning">
      <div class="score-band-icon">⚠️</div>
      <div class="score-band-body">
        <h3>${t.band41}</h3>
        <p>${t.band41Desc.replace('{pct}', pct).replace('{criticalMsg}', criticalMsg)}</p>
      </div>
    </div>`;
  } else {
    const criticalMsg = criticalLeft > 0 ? 
      (currentLang === 'ur' ? 
        `<strong>${criticalLeft} اہم آئٹم${criticalLeft > 1 ? 'ز' : ''} چیک نہیں کیے گئے۔</strong>` : 
        `<strong>${criticalLeft} critical item${criticalLeft > 1 ? 's' : ''} are unchecked.</strong>`) 
      : '';
    html = `<div class="score-band band-danger">
      <div class="score-band-icon">🔴</div>
      <div class="score-band-body">
        <h3>${t.band0}</h3>
        <p>${t.band0Desc.replace('{pct}', pct).replace('{criticalMsg}', criticalMsg)}</p>
      </div>
    </div>`;
  }

  content.innerHTML = html;
}

// ── Section tabs ─────────────────────────────────────────
function showSection(idx, btn) {
  if (allSectionsVisible) {
    allSectionsVisible = false;
    document.getElementById('mainContent').classList.remove('all-sections');
  }
  document.querySelectorAll('.section-card').forEach(c => c.classList.remove('visible'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${idx}`).classList.add('visible');
  btn.classList.add('active');
}

// ── Toggle all sections ───────────────────────────────────
function toggleAllSections() {
  allSectionsVisible = !allSectionsVisible;
  const main = document.getElementById('mainContent');
  if (allSectionsVisible) {
    main.classList.add('all-sections');
    document.querySelectorAll('.section-card').forEach(c => c.classList.add('visible'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  } else {
    main.classList.remove('all-sections');
    document.querySelectorAll('.section-card').forEach(c => c.classList.remove('visible'));
    document.getElementById('section-0').classList.add('visible');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
  }
}

// ── Init ─────────────────────────────────────────────────
loadState();
loadLanguage();
updateProgress();
