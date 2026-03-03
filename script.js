'use strict';
let SITE_DATA = null;

document.addEventListener('DOMContentLoaded', () => {
  fetch('./data.json')
    .then(r => { if (!r.ok) throw new Error('data.json load failed'); return r.json(); })
    .then(data => { SITE_DATA = data; buildSite(data); })
    .catch(err => console.error('BLESSTech-X:', err));
});

function buildSite(d) {
  applySiteInfo(d.site);
  renderAnnouncement(d.announcement);
  renderStats(d.stats);
  renderServices(d.services);
  renderToolsTeaser(d.tools_categories, d.tools);
  renderProcess(d.process_steps);
  renderPortfolio(d.portfolio);
  renderTestimonials(d.testimonials);
  renderFAQ(d.faqs);
  renderTeam(d.team);
  renderContact(d.site);
  initHeroRotator();
  initServiceSearch();
  initMobileMenu();
  initCalcTabs();
  initForms(d.site);
  initSlider();
  initHeaderScroll();
  initModalClose();
  initPopupSystem(d.tools);
}

/* ── SITE INFO ── */
function applySiteInfo(site) {
  const l = document.getElementById('logoImg');
  const f = document.getElementById('footerLogo');
  if (l) l.src = site.logo;
  if (f) f.src = site.logo;
}

/* ── ANNOUNCEMENT ── */
function renderAnnouncement(ann) {
  const bar = document.getElementById('announcementBar');
  if (!ann || !ann.active) { bar.classList.add('hidden'); document.body.classList.add('no-banner'); return; }
  document.getElementById('announcementText').innerHTML = ann.message;
  const cta = document.getElementById('announcementCta');
  cta.textContent = ann.cta_text; cta.href = ann.cta_link;
  document.body.classList.add('has-banner');
  setTimeout(closeAnnouncement, 9000);
}
function closeAnnouncement() {
  document.getElementById('announcementBar').classList.add('hidden');
  document.body.classList.remove('has-banner');
  document.body.classList.add('no-banner');
}

/* ── STATS ── */
function renderStats(stats) {
  const g = document.getElementById('statsGrid');
  if (!g) return;
  g.innerHTML = stats.map(s => `<div class="stat-item"><div class="stat-val">${s.value}</div><div class="stat-lbl">${s.label}</div></div>`).join('');
}

/* ── HERO ROTATOR ── */
function initHeroRotator() {
  const texts = ['Professional Websites & E-commerce for Zambia','Invoice Generator · CV Builder · Email Writer','20+ Free Tools — No Signup Required','Airtel Money & MTN Money Integration','Online Stores Delivered in 7–14 Days'];
  const el = document.getElementById('heroSub');
  if (!el) return;
  let i = 0;
  el.style.transition = 'opacity .3s ease';
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => { i = (i + 1) % texts.length; el.textContent = texts[i]; el.style.opacity = '1'; }, 300);
  }, 3500);
}

/* ── SERVICES ── */
function renderServices(services) {
  const g = document.getElementById('servicesGrid');
  if (!g) return;
  g.innerHTML = services.map(s => `
    <div class="service-card" data-category="${s.category}" data-search="${(s.title+' '+s.description).toLowerCase()}">
      <img src="${s.image}" alt="${s.title}" loading="lazy"/>
      <div class="service-card-body">
        ${s.badge ? `<span class="service-badge">${s.badge}</span>` : ''}
        <h3>${s.title}</h3><p>${s.description}</p>
        <div class="service-price">${s.price}</div>
        <div class="service-card-actions">
          <button class="btn btn-danger btn-sm" onclick="quoteService('${esc(s.title)}','${esc(s.price)}')"><i class="fas fa-shopping-cart"></i> Purchase Now</button>
          <button class="btn btn-outline btn-sm" onclick="openServiceModal('${s.id}')"><i class="fas fa-eye"></i> View Details</button>
        </div>
      </div>
    </div>`).join('');
}
function initServiceSearch() {
  const input = document.getElementById('serviceSearch');
  if (!input) return;
  document.getElementById('filterPills').addEventListener('click', e => {
    const p = e.target.closest('.pill'); if (!p) return;
    document.querySelectorAll('#filterPills .pill').forEach(x => x.classList.remove('active'));
    p.classList.add('active'); applyServiceFilter();
  });
  input.addEventListener('input', applyServiceFilter);
}
function applyServiceFilter() {
  const term = (document.getElementById('serviceSearch').value || '').toLowerCase();
  const cat = (document.querySelector('#filterPills .pill.active') || {}).dataset?.filter || 'all';
  document.querySelectorAll('.service-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.category === cat) && (!term || c.dataset.search.includes(term)) ? '' : 'none';
  });
}
function openServiceModal(id) {
  if (!SITE_DATA) return;
  const s = SITE_DATA.services.find(x => x.id === id); if (!s) return;
  document.getElementById('serviceModalContent').innerHTML = `
    <div class="modal-header"><h2>${s.title} ${s.badge||''}</h2><p>${s.description}</p></div>
    <div class="modal-body">
      <div class="service-price" style="font-size:1.2rem;margin-bottom:18px">${s.price}</div>
      <h4 style="margin-bottom:12px;color:var(--slate)">What's Included</h4>
      <div class="modal-features">${s.features.map(f=>`<div class="modal-feature"><i class="fas fa-check-circle"></i>${f}</div>`).join('')}</div>
      ${s.gallery?.length ? `<h4 style="margin-bottom:12px;color:var(--slate)">Examples</h4><div class="modal-gallery">${s.gallery.map(img=>`<img src="${img}" alt="${s.title}" loading="lazy" onclick="window.open('${img}','_blank')">`).join('')}</div>` : ''}
      <div class="modal-actions">
        <button class="btn btn-danger" onclick="quoteService('${esc(s.title)}','${esc(s.price)}')"><i class="fab fa-whatsapp"></i> Buy via WhatsApp</button>
        <button class="btn btn-outline" onclick="closeModal('serviceModal')">Close</button>
      </div>
    </div>`;
  openModal('serviceModal');
}
function quoteService(name, price) {
  const msg = `Hello BLESSTech-X! I want to purchase: *${name}* (${price})%0A%0ABusiness Name:%0AMy Name:%0APhone:%0APayment Method:`;
  window.open(`https://wa.me/${SITE_DATA.site.whatsapp}?text=${msg}`, '_blank');
}

/* ── TOOLS TEASER ── */
function renderToolsTeaser(categories, tools) {
  const g = document.getElementById('toolsTeaserGrid');
  if (!g) return;
  g.innerHTML = categories.map(cat => {
    const count = cat.tools.length;
    const example = tools.find(t => t.id === cat.tools[0]);
    return `
      <a href="tools/index.html#${cat.id}" class="tool-teaser-card">
        <span class="tool-teaser-icon">${cat.icon}</span>
        <div class="tool-teaser-title">${cat.title}</div>
        <div class="tool-teaser-desc">${cat.description}</div>
        <span class="tool-teaser-count">${count} tool${count>1?'s':''}</span>
      </a>`;
  }).join('');
}

/* ── PROCESS ── */
function renderProcess(steps) {
  const el = document.getElementById('processSteps');
  if (!el) return;
  el.innerHTML = steps.map(s => `
    <div class="process-step"><div class="step-num">${s.number}</div><h3>${s.title}</h3><p>${s.desc}</p></div>`).join('');
}

/* ── PORTFOLIO ── */
function renderPortfolio(items) {
  const g = document.getElementById('portfolioGrid'); if (!g) return;
  g.innerHTML = items.map(item => `
    <div class="portfolio-card" data-category="${item.category}" onclick="openPortfolioModal('${item.id}')">
      <img src="${item.image}" alt="${item.title}" loading="lazy"/>
      <div class="portfolio-card-body">
        <h3>${item.title}</h3><p>${item.description}</p>
        <div class="tag-row">${item.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="stat-pills">
          <div class="stat-pill"><div class="sp-val">${item.stats.growth}</div><div class="sp-lbl">Growth</div></div>
          <div class="stat-pill"><div class="sp-val">${item.stats.time}</div><div class="sp-lbl">Time</div></div>
          <div class="stat-pill"><div class="sp-val">${item.stats.reach}</div><div class="sp-lbl">Reach</div></div>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('portfolioPills').addEventListener('click', e => {
    const p = e.target.closest('.pill'); if (!p || !p.dataset.pf) return;
    document.querySelectorAll('#portfolioPills .pill').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    const cat = p.dataset.pf;
    document.querySelectorAll('.portfolio-card').forEach(c => { c.style.display = cat==='all'||c.dataset.category===cat?'':'none'; });
  });
}
function openPortfolioModal(id) {
  if (!SITE_DATA) return;
  const item = SITE_DATA.portfolio.find(x => x.id === id); if (!item) return;
  document.getElementById('portfolioModalContent').innerHTML = `
    <div class="modal-header"><h2>${item.title}</h2><p>${item.description}</p></div>
    <div class="modal-body">
      <div class="cs-stats">
        <div class="cs-stat"><div class="cs-val">${item.stats.growth}</div><div class="cs-lbl">Sales Growth</div></div>
        <div class="cs-stat"><div class="cs-val">${item.stats.time}</div><div class="cs-lbl">Timeframe</div></div>
        <div class="cs-stat"><div class="cs-val">${item.stats.reach}</div><div class="cs-lbl">Market Reach</div></div>
      </div>
      <p style="color:var(--slate-l);margin-bottom:20px;line-height:1.7">${item.detail}</p>
      <div class="tag-row" style="margin-bottom:20px">${item.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      ${item.before||item.after ? `
        <h4 style="margin-bottom:14px;color:var(--slate)">Before &amp; After</h4>
        <div class="before-after">
          ${item.before ? `<div class="ba-col ba-before"><h4>Before</h4><img src="${item.before}" alt="Before" loading="lazy"/></div>` : ''}
          ${item.after  ? `<div class="ba-col ba-after"><h4>After</h4><img src="${item.after}" alt="After" loading="lazy"/></div>`  : ''}
        </div>` : ''}
      <div class="modal-actions" style="margin-top:24px">
        ${item.live_url&&item.live_url!=='#' ? `<a href="${item.live_url}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> View Live</a>` : ''}
        <button class="btn btn-danger" onclick="quoteService('Similar to ${esc(item.title)}','')"><i class="fab fa-whatsapp"></i> Get Similar</button>
        <button class="btn btn-outline" onclick="closeModal('portfolioModal')">Close</button>
      </div>
    </div>`;
  openModal('portfolioModal');
}

/* ── TESTIMONIALS ── */
function renderTestimonials(testimonials) {
  const s = document.getElementById('testimonialSlider');
  const d = document.getElementById('sliderDots');
  if (!s || !d) return;
  s.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testi-header">
        <img src="${t.avatar}" alt="${t.name}" loading="lazy"/>
        <div><h4>${t.name}</h4><p>${t.role}</p></div>
      </div>
      <div class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
      <p class="testi-text">"${t.text}"</p>
    </div>`).join('');
  d.innerHTML = testimonials.map((_,i) => `<button class="dot${i===0?' active':''}" onclick="goSlide(${i})" aria-label="Slide ${i+1}"></button>`).join('');
}
function initSlider() {
  window._slide = 0;
  setInterval(() => {
    const s = document.getElementById('testimonialSlider'); if (!s) return;
    window._slide = (window._slide + 1) % s.children.length;
    goSlide(window._slide);
  }, 5000);
}
function goSlide(i) {
  const s = document.getElementById('testimonialSlider'); if (!s) return;
  s.style.transform = `translateX(-${i*100}%)`;
  window._slide = i;
  document.querySelectorAll('.dot').forEach((d,j) => d.classList.toggle('active', j===i));
}

/* ── FAQ ── */
function renderFAQ(faqs) {
  const l = document.getElementById('faqList'); if (!l) return;
  l.innerHTML = faqs.map((f,i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false" onclick="toggleFAQ(this,'faq-a-${i}')">
        <span>${f.q}</span><i class="fas fa-chevron-down"></i>
      </button>
      <div class="faq-a" id="faq-a-${i}">${f.a}</div>
    </div>`).join('');
}
function toggleFAQ(btn, aid) {
  const a = document.getElementById(aid);
  const open = btn.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded','false'));
  document.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open'));
  if (!open) { btn.setAttribute('aria-expanded','true'); a.classList.add('open'); }
}

/* ── TEAM ── */
function renderTeam(team) {
  const g = document.getElementById('teamGrid'); if (!g) return;
  g.innerHTML = team.map(m => `
    <div class="team-card">
      <div class="team-card-header">
        <img src="${m.avatar}" alt="${m.name}" loading="lazy"/>
        <div><h4>${m.name}</h4><p>${m.role}</p></div>
      </div>
      <div class="skill-tags">${m.skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:10px">${m.bio}</p>
      <blockquote>"${m.quote}"</blockquote>
    </div>`).join('');
}

/* ── CONTACT ── */
function renderContact(site) {
  const ci = document.getElementById('contactItems');
  if (ci) {
    ci.innerHTML = `
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-phone"></i></div>
        <div><strong style="color:white">Phone / WhatsApp</strong><br/><a href="tel:${site.phone}">${site.phone}</a></div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-envelope"></i></div>
        <div><strong style="color:white">Email</strong><br/><a href="mailto:${site.email}">${site.email}</a></div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
        <div><strong style="color:white">Location</strong><br/><span>${site.location}</span></div>
      </div>`;
  }
  const sr = document.getElementById('socialRow');
  if (sr && site.socials) {
    const icons = {facebook:'fab fa-facebook-f',instagram:'fab fa-instagram',tiktok:'fab fa-tiktok',twitter:'fab fa-x-twitter',youtube:'fab fa-youtube'};
    sr.innerHTML = Object.entries(site.socials).map(([k,v]) => icons[k] ? `<a href="${v}" target="_blank" rel="noopener" class="social-icon" aria-label="${k}"><i class="${icons[k]}"></i></a>` : '').join('');
  }
}

/* ── CALCULATOR ── */
function initCalcTabs() {
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add('active');
    });
  });
}
function fmt(n) { return 'ZMW ' + Number(n).toLocaleString('en-ZM', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function calcROI() {
  const cost = parseFloat(document.getElementById('roiCost').value) || 0;
  const clients = parseFloat(document.getElementById('roiClients').value) || 0;
  const value = parseFloat(document.getElementById('roiValue').value) || 0;
  const monthly = clients * value;
  const yearly = monthly * 12;
  const roi = cost > 0 ? ((yearly - cost) / cost * 100).toFixed(0) : 0;
  const payback = monthly > 0 ? Math.ceil(cost / monthly) : '∞';
  const r = document.getElementById('roiResult');
  r.innerHTML = `
    <div class="calc-result-grid">
      <div class="calc-metric"><div class="metric-val">${fmt(monthly)}</div><div class="metric-lbl">Monthly Revenue</div></div>
      <div class="calc-metric"><div class="metric-val">${fmt(yearly)}</div><div class="metric-lbl">Yearly Revenue</div></div>
      <div class="calc-metric"><div class="metric-val">${roi}%</div><div class="metric-lbl">ROI</div></div>
      <div class="calc-metric"><div class="metric-val">${payback} mo</div><div class="metric-lbl">Payback Period</div></div>
    </div>
    <p class="calc-summary">A ${fmt(cost)} investment could return ${fmt(yearly)} per year — a ${roi}% ROI with payback in ${payback} month(s).</p>`;
  r.classList.add('visible');
}
function calcEcom() {
  const spend = parseFloat(document.getElementById('ecomSpend').value) || 0;
  const sales = parseFloat(document.getElementById('ecomSales').value) || 0;
  const profit = parseFloat(document.getElementById('ecomProfit').value) || 0;
  const gross = sales * profit;
  const net = gross - spend;
  const roas = spend > 0 ? (gross / spend).toFixed(2) : '∞';
  const yearly = net * 12;
  const r = document.getElementById('ecomResult');
  r.innerHTML = `
    <div class="calc-result-grid">
      <div class="calc-metric"><div class="metric-val">${fmt(gross)}</div><div class="metric-lbl">Gross Profit</div></div>
      <div class="calc-metric"><div class="metric-val">${fmt(net)}</div><div class="metric-lbl">Net Profit</div></div>
      <div class="calc-metric"><div class="metric-val">${roas}x</div><div class="metric-lbl">ROAS</div></div>
      <div class="calc-metric"><div class="metric-val">${fmt(yearly)}</div><div class="metric-lbl">Yearly Projection</div></div>
    </div>
    <p class="calc-summary">Spending ${fmt(spend)}/month on ads, you net ${fmt(net)}/month — projecting ${fmt(yearly)} per year.</p>`;
  r.classList.add('visible');
}

/* ── FORMS ── */
function initForms(site) {
  const lf = document.getElementById('leadForm');
  if (lf) {
    lf.addEventListener('submit', e => {
      e.preventDefault();
      const name = lf.querySelector('[name=name]').value;
      const phone = lf.querySelector('[name=phone]').value;
      const msg = `Hello BLESSTech-X! I want the Digital Success Checklist.%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone || 'not provided')}`;
      window.open(`https://wa.me/${site.whatsapp}?text=${msg}`, '_blank');
      document.getElementById('leadSuccess').style.display = 'block';
      lf.style.display = 'none';
    });
  }
  const cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = cf.querySelector('button[type=submit]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      btn.disabled = true;
      try {
        const fd = new FormData(cf);
        const res = await fetch(`https://formspree.io/f/${SITE_DATA.site.formspree_id}`, { method:'POST', body:fd, headers:{Accept:'application/json'} });
        if (res.ok) {
          document.getElementById('contactSuccess').style.display = 'flex';
          cf.reset();
        } else throw new Error();
      } catch {
        const name = cf.querySelector('[name=name]').value;
        const service = cf.querySelector('[name=service]').value;
        const message = cf.querySelector('[name=message]').value;
        window.open(`https://wa.me/${site.whatsapp}?text=Hello BLESSTech-X!%0AName: ${encodeURIComponent(name)}%0AService: ${encodeURIComponent(service)}%0AMessage: ${encodeURIComponent(message)}`, '_blank');
      } finally {
        btn.innerHTML = orig; btn.disabled = false;
      }
    });
  }
}

/* ── MOBILE MENU ── */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('navLinks');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
}

/* ── HEADER SCROLL ── */
function initHeaderScroll() {
  const h = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    h.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,.12)' : '';
  }, { passive: true });
}

/* ── MODALS ── */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
function initModalClose() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('serviceModal');
      closeModal('portfolioModal');
      dismissPopup();
    }
  });
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });
}

/* ── POPUP SYSTEM ── */
function initPopupSystem(tools) {
  const KEY_P1 = 'btx_popup1_seen';
  const KEY_P3 = 'btx_popup3_count';

  // Popup 1 — first visit, after 9s
  if (!localStorage.getItem(KEY_P1)) {
    setTimeout(() => showPopup('popup1'), 9000);
    localStorage.setItem(KEY_P1, '1');
  }

  // Popup 2 — context sensitive: fires when user scrolls into services section
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    const contextPopups = [
      { icon:'🩺', title:'Check your Digital Score', text:'Not sure if your business is fully digital? Take our free Digital Health Check.', link:'tools/health-check/index.html', linkText:'Try It Free' },
      { icon:'📧', title:'Need to write a professional email?', text:'Our free Email Writer handles any situation — formal, follow-up, complaint, proposal.', link:'tools/email-writer/index.html', linkText:'Write Email Free' },
      { icon:'🧾', title:'Send professional invoices', text:'Create and download a PDF invoice in under 2 minutes — completely free.', link:'tools/invoice/index.html', linkText:'Create Invoice' },
    ];
    let contextShown = false;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !contextShown && !activePopup) {
        contextShown = true;
        setTimeout(() => {
          const p = contextPopups[Math.floor(Math.random() * contextPopups.length)];
          document.getElementById('popup2Title').textContent = p.title;
          document.getElementById('popup2Text').innerHTML = `${p.icon} ${p.text}`;
          const lnk = document.getElementById('popup2Link');
          lnk.href = p.link; lnk.textContent = p.linkText;
          showPopup('popup2');
        }, 6000);
      }
    }, { threshold: 0.4 });
    obs.observe(servicesSection);
  }

  // Popup 3 — return visitors: highlight a random tool
  const visits = parseInt(localStorage.getItem(KEY_P3) || '0') + 1;
  localStorage.setItem(KEY_P3, visits);
  if (visits >= 2 && tools && tools.length) {
    const spotlight = tools[Math.floor(Math.random() * tools.length)];
    setTimeout(() => {
      if (!activePopup) {
        document.getElementById('popup3Icon').textContent = spotlight.icon;
        document.getElementById('popup3Title').textContent = spotlight.title;
        document.getElementById('popup3Text').textContent = spotlight.desc;
        document.getElementById('popup3Link').href = spotlight.url;
        showPopup('popup3');
      }
    }, 18000);
  }
}

let activePopup = null;
function showPopup(id) {
  if (activePopup) return;
  activePopup = id;
  document.getElementById('popupOverlay').classList.add('visible');
  document.getElementById(id).classList.add('visible');
}
function dismissPopup() {
  if (!activePopup) return;
  document.getElementById(activePopup).classList.remove('visible');
  document.getElementById('popupOverlay').classList.remove('visible');
  activePopup = null;
}

/* ── HELPERS ── */
function esc(s) { return (s||'').replace(/'/g,"\\'"); }
