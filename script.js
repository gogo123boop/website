// ZenCare TCM — 基础交互脚本
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ---------- Language switch (中文 / EN) ----------
  const LANG_KEY = 'zc_lang';
  const html = document.documentElement;

  function applyLang(lang) {
    html.setAttribute('data-lang', lang);
    html.lang = lang === 'en' ? 'en' : 'zh-Hans';

    document.querySelectorAll('[data-i18n-zh]').forEach(el => { el.hidden = lang !== 'zh'; });
    document.querySelectorAll('[data-i18n-en]').forEach(el => { el.hidden = lang !== 'en'; });

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === lang));
    });

    const titleEn = html.getAttribute('data-title-en');
    const descEn = html.getAttribute('data-desc-en');
    if (lang === 'en' && titleEn) {
      if (!html.dataset.titleZh) html.dataset.titleZh = document.title;
      document.title = titleEn;
    } else if (html.dataset.titleZh) {
      document.title = html.dataset.titleZh;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && lang === 'en' && descEn) {
      if (!html.dataset.descZh) html.dataset.descZh = metaDesc.content;
      metaDesc.content = descEn;
    } else if (metaDesc && html.dataset.descZh) {
      metaDesc.content = html.dataset.descZh;
    }

    if (navToggle) {
      navToggle.setAttribute('aria-label', lang === 'en' ? 'Open menu' : '开启选单');
    }

    if (window.zcRenderGrf) window.zcRenderGrf();

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  let initialLang = 'zh';
  try { initialLang = localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) {}
  applyLang(initialLang);

  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-btn')));
  });

  // ---------- Floating Google review card ----------
  // Real reviews pulled from ZenCare TCM's Google Business listing
  // (search "槿宁中医诊所 ZenCare TCM" on Google Maps), condensed to short quotes.
  const GRF_REVIEWS = [
    {
      name: 'Peck Fuang Ong',
      zh: '失眠困扰在第一次治疗后就改善了，膝盖旧伤经过4次疗程也明显好转。',
      en: 'My insomnia improved after just one treatment, and my old knee injury noticeably improved after 4 sessions.'
    },
    {
      name: 'Willy Loo',
      zh: '医师和员工都非常专业，会耐心解释疗程，效果确实显著。',
      en: 'Very professional — the doctors take time to explain everything clearly, and the results have been truly effective.'
    },
    {
      name: 'Yeo Florance',
      zh: '环境舒适，医师专业，困扰已久的腰痛3次疗程就大幅改善！',
      en: 'Great environment, very professional physician — my chronic back pain improved within just 3 sessions!'
    },
    {
      name: 'Cynthia Kuek',
      zh: '员工亲切细心，环境舒适放松，针灸配合中药调理几次疗程就有明显改善。',
      en: 'Friendly, attentive staff in a calming environment — I saw real improvement after just a few sessions of acupuncture and herbal treatment.'
    },
    {
      name: 'Muhibah',
      zh: '全家人都在这里看诊，效果很好，医师和员工都非常棒。',
      en: 'My whole family has been treated here — very effective, and the doctor and staff are excellent.'
    }
  ];

  const grf = document.getElementById('googleReviewFloat');
  const grfClose = document.getElementById('grfClose');
  const grfQuoteText = document.getElementById('grfQuoteText');
  const grfQuoteAuthor = document.getElementById('grfQuoteAuthor');
  const grfDots = document.getElementById('grfDots');

  if (grf && grfClose && grfQuoteText) {
    let grfIndex = 0;
    let grfTimer = null;

    GRF_REVIEWS.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'grf-dot';
      dot.setAttribute('aria-label', `${i + 1}`);
      dot.addEventListener('click', () => {
        grfIndex = i;
        renderGrf();
        restartGrfTimer();
      });
      grfDots.appendChild(dot);
    });

    function renderGrf() {
      const lang = html.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
      const r = GRF_REVIEWS[grfIndex];
      grfQuoteText.textContent = (lang === 'en' ? '“' + r.en + '”' : '“' + r.zh + '”');
      grfQuoteAuthor.textContent = r.name;
      grfDots.querySelectorAll('.grf-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === grfIndex);
      });
    }
    window.zcRenderGrf = renderGrf;

    function restartGrfTimer() {
      if (grfTimer) clearInterval(grfTimer);
      grfTimer = setInterval(() => {
        grfIndex = (grfIndex + 1) % GRF_REVIEWS.length;
        renderGrf();
      }, 6000);
    }

    renderGrf();
    restartGrfTimer();
    grf.addEventListener('mouseenter', () => { if (grfTimer) clearInterval(grfTimer); });
    grf.addEventListener('mouseleave', restartGrfTimer);

    // Stays off-screen briefly on load, so it never flashes over the hero
    // rating link / CTA buttons before the visitor has seen them.
    grf.classList.add('is-hidden');

    let dismissed = false;
    try { dismissed = sessionStorage.getItem('zc_grf_dismissed') === '1'; } catch (e) {}

    if (!dismissed) {
      setTimeout(() => { grf.classList.remove('is-hidden'); }, 1500);
    }

    grfClose.addEventListener('click', () => {
      grf.classList.add('is-hidden');
      if (grfTimer) clearInterval(grfTimer);
      try { sessionStorage.setItem('zc_grf_dismissed', '1'); } catch (e) {}
    });
  }
});
