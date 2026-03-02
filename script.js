/* ============================================
   BLESSTECHX — SCRIPT.JS
   Data-driven engine: fetch → render → interact
   ============================================ */

'use strict';

let SITE_DATA = null;

// ============================================
// BOOTSTRAP: Fetch data.json then build site
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  fetch('./data.json')
    .then(r => {
      if (!r.ok) throw new Error('Could not load data.json');
      return r.json();
    })
    .then(data => {
      SITE_DATA = data;
      buildSite(data);
    })
    .catch(err => {
      console.error('BLESSTech-X: Failed to load site data.', err);
    });
});

function buildSite(d) {
  applySiteInfo(d.site);
  renderAnnouncement(d.announcement);
  renderStats(d.stats);
  renderServices(d.services);
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
}

// ============================================
// SITE INFO — logo, footer, OG already in HTML
// ============================================
function applySiteInfo(site) {
  const logoImg = document.getElementById('logoImg');
  const footerLogo = document.getElementById('footerLogo');
  if (logoImg) logoImg.src = site.logo;
  if (footerLogo) footerLogo.src = site.logo;
  document.title = `${site.name} | Digital & E-commerce Solutions Zambia`;
}

// ============================================
// ANNOUNCEMENT BAR
// ============================================
function renderAnnouncement(ann) {
  const bar = document.getElementById('announcementBar');
  if (!ann || !ann.active) {
    bar.classList.add('hidden');
    document.body.classList.add('no-banner');
    return;
  }
  document.getElementById('announcementText').innerHTML = ann.message;
  const cta = document.getElementById('announcementCta');
  cta.textContent = ann.cta_text;
  cta.href = ann.cta_link;
  document.body.classList.add('has-banner');

  // Auto-dismiss after 8 seconds
  setTimeout(closeAnnouncement, 8000);
}

function closeAnnouncement() {
  const bar = document.getElementById('announcementBar');
  bar.classList.add('hidden');
  document.body.classList.remove('has-banner');
  document.body.classList.add('no-banner');
}

// ============================================
// STATS BAR
// ============================================
function renderStats(stats) {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  grid.innerHTML = stats.map(s => `
    <div class="stat-item">
      <div class="stat-val">${s.value}</div>
      <div class="stat-lbl">${s.label}</div>
    </div>
  `).join('');
}

// ============================================
// HERO TEXT ROTATOR
// ============================================
function initHeroRotator() {
  const texts = [
    'Professional Websites & E-commerce for Zambia',
    'Airtel Money & MTN Money Integration',
    'Online Stores Delivered in 7–14 Days',
    'Logo & Branding That Builds Trust',
    'Social Media Management & SEO'
  ];
  const el = document.getElementById('heroSub');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      i = (i + 1) % texts.length;
      el.textContent = texts[i];
      el.style.opacity = '1';
    }, 300);
  }, 3200);
  el.style.transition = 'opacity 0.3s ease';
}

// ============================================
// SERVICES
// ============================================
function renderServices(services) {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  grid.innerHTML = services.map(s => `
    <div class="service-card" data-category="${s.category}" data-search="${(s.title + ' ' + s.description).toLowerCase()}">
      <img src="${s.image}" alt="${s.title}" loading="lazy" />
      <div class="service-card-body">
        ${s.badge ? `<span class="service-badge">${s.badge}</span>` : ''}
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="service-price">${s.price}</div>
        <div class="service-card-actions">
          <button class="btn btn-danger btn-sm" onclick="quoteService('${esc(s.title)}', '${esc(s.price)}')">
            <i class="fas fa-shopping-cart"></i> Purchase Now
          </button>
          <button class="btn btn-outline btn-sm" onclick="openServiceModal('${s.id}')">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function initServiceSearch() {
  const input = document.getElementById('serviceSearch');
  if (!input) return;

  // Filter pills
  document.getElementById('filterPills').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('#filterPills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    applyServiceFilter();
  });

  input.addEventListener('input', applyServiceFilter);
}

function applyServiceFilter() {
  const term = (document.getElementById('serviceSearch').value || '').toLowerCase();
  const active = document.querySelector('#filterPills .pill.active');
  const cat = active ? active.dataset.filter : 'all';

  document.querySelectorAll('.service-card').forEach(card => {
    const matchCat = cat === 'all' || card.dataset.category === cat;
    const matchSearch = !term || card.dataset.search.includes(term);
    card.style.display = matchCat && matchSearch ? '' : 'none';
  });
}

function openServiceModal(serviceId) {
  if (!SITE_DATA) return;
  const s = SITE_DATA.services.find(x => x.id === serviceId);
  if (!s) return;

  const content = `
    <div class="modal-header">
      <h2 id="modalTitle">${s.title} ${s.badge || ''}</h2>
      <p>${s.description}</p>
    </div>
    <div class="modal-body">
      <div class="service-price" style="font-size:1.2rem;margin-bottom:18px">${s.price}</div>
      <h4 style="margin-bottom:12px;color:var(--slate)">What's Included</h4>
      <div class="modal-features">
        ${s.features.map(f => `<div class="modal-feature"><i class="fas fa-check-circle"></i> ${f}</div>`).join('')}
      </div>
      ${s.gallery && s.gallery.length ? `
        <h4 style="margin-bottom:12px;color:var(--slate)">Examples</h4>
        <div class="modal-gallery">
          ${s.gallery.map(img => `<img src="${img}" alt="${s.title} example" loading="lazy" onclick="window.open('${img}','_blank')">`).join('')}
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="btn btn-danger" onclick="quoteService('${esc(s.title)}', '${esc(s.price)}')">
          <i class="fab fa-whatsapp"></i> Buy via WhatsApp
        </button>
        <button class="btn btn-outline" onclick="closeModal('serviceModal')">
          Close
        </button>
      </div>
    </div>
  `;

  document.getElementById('serviceModalContent').innerHTML = content;
  openModal('serviceModal');
}

function quoteService(name, price) {
  const msg = `Hello BLESSTech-X! I want to purchase: *${name}* (${price})%0A%0ABusiness Name:%0AMy Name:%0APhone Number:%0APreferred Payment (Airtel/MTN/Bank):%0AProject Details:`;
  window.open(`https://wa.me/${SITE_DATA.site.whatsapp}?text=${msg}`, '_blank');
}

// ============================================
// PROCESS STEPS
// ============================================
function renderProcess(steps) {
  const el = document.getElementById('processSteps');
  if (!el) return;
  el.innerHTML = steps.map(s => `
    <div class="process-step">
      <div class="step-num">${s.number}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// ============================================
// PORTFOLIO
// ============================================
function renderPortfolio(items) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <div class="portfolio-card" data-category="${item.category}" onclick="openPortfolioModal('${item.id}')">
      <img src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="portfolio-card-body">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="tag-row">
          ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="stat-pills">
          <div class="stat-pill"><div class="sp-val">${item.stats.growth}</div><div class="sp-lbl">Growth</div></div>
          <div class="stat-pill"><div class="sp-val">${item.stats.time}</div><div class="sp-lbl">Time</div></div>
          <div class="stat-pill"><div class="sp-val">${item.stats.reach}</div><div class="sp-lbl">Reach</div></div>
        </div>
      </div>
    </div>
  `).join('');

  // Portfolio filter pills
  document.getElementById('portfolioPills').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill || !pill.dataset.pf) return;
    document.querySelectorAll('#portfolioPills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const cat = pill.dataset.pf;
    document.querySelectorAll('.portfolio-card').forEach(card => {
      card.style.display = cat === 'all' || card.dataset.category === cat ? '' : 'none';
    });
  });
}

function openPortfolioModal(id) {
  if (!SITE_DATA) return;
  const item = SITE_DATA.portfolio.find(x => x.id === id);
  if (!item) return;

  const content = `
    <div class="modal-header">
      <h2 id="portfolioModalTitle">${item.title}</h2>
      <p>${item.description}</p>
    </div>
    <div class="modal-body">
      <div class="cs-stats">
        <div class="cs-stat"><div class="cs-val">${item.stats.growth}</div><div class="cs-lbl">Sales Growth</div></div>
        <div class="cs-stat"><div class="cs-val">${item.stats.time}</div><div class="cs-lbl">Timeframe</div></div>
        <div class="cs-stat"><div class="cs-val">${item.stats.reach}</div><div class="cs-lbl">Market Reach</div></div>
      </div>

      <p style="color:var(--slate-light);margin-bottom:20px;line-height:1.7">${item.detail}</p>

      <div class="tag-row" style="margin-bottom:20px">
        ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>

      ${(item.before || item.after) ? `
        <h4 style="margin-bottom:14px;color:var(--slate)">Before & After</h4>
        <div class="before-after">
          ${item.before ? `
            <div class="ba-col ba-before">
              <h4>Before</h4>
              <img src="${item.before}" alt="Before" loading="lazy" />
            </div>
          ` : ''}
          ${item.after ? `
            <div class="ba-col ba-after">
              <h4>After</h4>
              <img src="${item.after}" alt="After" loading="lazy" />
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="modal-actions" style="margin-top:24px">
        ${item.live_url && item.live_url !== '#' ? `<a href="${item.live_url}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> View Live Site</a>` : ''}
        <button class="btn btn-danger" onclick="quoteService('Similar to ${esc(item.title)}', '')">
          <i class="fab fa-whatsapp"></i> Get Similar Project
        </button>
        <button class="btn btn-outline" onclick="closeModal('portfolioModal')">Close</button>
      </div>
    </div>
  `;

  document.getElementById('portfolioModalContent').innerHTML = content;
  openModal('portfolioModal');
}

// ============================================
// TESTIMONIALS SLIDER
// ============================================
function renderTestimonials(testimonials) {
  const slider = document.getElementById('testimonialSlider');
  const dots = document.getElementById('sliderDots');
  if (!slider || !dots) return;

  slider.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testi-header">
        <img src="${t.avatar}" alt="${t.name}" loading="lazy" />
        <div>
          <h4>${t.name}</h4>
          <p>${t.role}</p>
        </div>
      </div>
      <div class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testi-text">"${t.text}"</p>
    </div>
  `).join('');

  dots.innerHTML = testimonials.map((_, i) =>
    `<button class="dot${i === 0 ? ' active' : ''}" onclick="goSlide(${i})" aria-label="Testimonial ${i + 1}"></button>`
  ).join('');
}

function initSlider() {
  let current = 0;
  window._sliderCurrent = 0;

  setInterval(() => {
    const slider = document.getElementById('testimonialSlider');
    if (!slider) return;
    const count = slider.children.length;
    if (count === 0) return;
    window._sliderCurrent = (window._sliderCurrent + 1) % count;
    goSlide(window._sliderCurrent);
  }, 5000);
}

function goSlide(index) {
  const slider = document.getElementById('testimonialSlider');
  if (!slider) return;
  slider.style.transform = `translateX(-${index * 100}%)`;
  window._sliderCurrent = index;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

// ============================================
// FAQ
// ============================================
function renderFAQ(faqs) {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}" onclick="toggleFAQ(this, 'faq-a-${i}')">
        <span>${f.q}</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="faq-a" id="faq-a-${i}" role="region">${f.a}</div>
    </div>
  `).join('');
}

function toggleFAQ(btn, answerId) {
  const answer = document.getElementById(answerId);
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  // Close all
  document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));

  // Open this one if it was closed
  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    answer.classList.add('open');
  }
}

// ============================================
// TEAM
// ============================================
function renderTeam(team) {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;
  grid.innerHTML = team.map(m => `
    <div class="team-card">
      <div class="team-card-header">
        <img src="${m.avatar}" alt="${m.name}" loading="lazy" />
        <div>
          <h4>${m.name}</h4>
          <p>${m.role}</p>
        </div>
      </div>
      <div class="skill-tags">
        ${m.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
      <p style="font-size:0.85rem;color:var(--muted);margin-bottom:10px">${m.bio}</p>
      <blockquote>"${m.quote}"</blockquote>
    </div>
  `).join('');
}

// ============================================
// CONTACT INFO
// ============================================
function renderContact(site) {
  const items = document.getElementById('contactItems');
  if (items) {
    items.innerHTML = `
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-phone"></i></div>
        <div><strong style="color:white">Phone & WhatsApp</strong><br/>
          <a href="tel:${site.phone}">${site.phone}</a>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-envelope"></i></div>
        <div><strong style="color:white">Email</strong><br/>
          <a href="mailto:${site.email}">${site.email}</a>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
        <div><strong style="color:white">Location</strong><br/>
          <span>${site.location}</span>
        </div>
      </div>
    `;
  }

  const social = document.getElementById('socialRow');
  if (social && site.socials) {
    const icons = {
      facebook: 'fab fa-facebook-f',
      instagram: 'fab fa-instagram',
      tiktok: 'fab fa-tiktok',
      twitter: 'fab fa-twitter',
      youtube: 'fab fa-youtube'
    };
    social.innerHTML = Object.entries(site.socials)
      .map(([k, url]) => `<a href="${url}" class="social-icon" target="_blank" rel="noopener" aria-label="${k}"><i class="${icons[k] || 'fas fa-link'}"></i></a>`)
      .join('');
  }
}

// ============================================
// CALCULATORS
// ============================================
function initCalcTabs() {
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('panel' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1));
      if (panel) panel.classList.add('active');
    });
  });
}

function calcROI() {
  const cost = parseFloat(document.getElementById('roiCost').value) || 0;
  const clients = parseFloat(document.getElementById('roiClients').value) || 0;
  const value = parseFloat(document.getElementById('roiValue').value) || 0;

  if (!cost || !clients || !value) {
    alert('Please fill in all three fields.');
    return;
  }

  const monthlyRevenue = clients * value;
  const yearlyRevenue = monthlyRevenue * 12;
  const netYearly = yearlyRevenue - cost;
  const roiPct = ((netYearly / cost) * 100).toFixed(0);
  const paybackDays = Math.ceil(cost / (monthlyRevenue / 30));

  const el = document.getElementById('roiResult');
  el.innerHTML = `
    <div class="calc-result-grid">
      <div class="calc-metric"><div class="metric-val">ZMW ${fmt(monthlyRevenue)}</div><div class="metric-lbl">Monthly Revenue Gain</div></div>
      <div class="calc-metric"><div class="metric-val">ZMW ${fmt(yearlyRevenue)}</div><div class="metric-lbl">Yearly Revenue</div></div>
      <div class="calc-metric"><div class="metric-val">${roiPct}%</div><div class="metric-lbl">Yearly ROI</div></div>
      <div class="calc-metric"><div class="metric-val">${paybackDays} days</div><div class="metric-lbl">Payback Period</div></div>
    </div>
    <p class="calc-summary">Your investment of ZMW ${fmt(cost)} pays for itself in <strong>${paybackDays} days</strong> and generates ZMW ${fmt(netYearly)} net profit in year one.</p>
  `;
  el.classList.add('visible');
}

function calcEcom() {
  const spend = parseFloat(document.getElementById('ecomSpend').value) || 0;
  const sales = parseFloat(document.getElementById('ecomSales').value) || 0;
  const profit = parseFloat(document.getElementById('ecomProfit').value) || 0;

  if (!sales || !profit) {
    alert('Please fill in all three fields.');
    return;
  }

  const grossProfit = sales * profit;
  const netProfit = grossProfit - spend;
  const roas = spend > 0 ? (grossProfit / spend).toFixed(1) : 'N/A';
  const yearly = netProfit * 12;

  const el = document.getElementById('ecomResult');
  el.innerHTML = `
    <div class="calc-result-grid">
      <div class="calc-metric"><div class="metric-val">ZMW ${fmt(grossProfit)}</div><div class="metric-lbl">Gross Monthly Profit</div></div>
      <div class="calc-metric"><div class="metric-val">ZMW ${fmt(netProfit)}</div><div class="metric-lbl">Net Monthly Profit</div></div>
      <div class="calc-metric"><div class="metric-val">${roas}x</div><div class="metric-lbl">Return on Ad Spend</div></div>
      <div class="calc-metric"><div class="metric-val">ZMW ${fmt(yearly)}</div><div class="metric-lbl">Projected Yearly Net</div></div>
    </div>
    <p class="calc-summary">After ad spend of ZMW ${fmt(spend)}, your store nets <strong>ZMW ${fmt(netProfit)}/month</strong> — ZMW ${fmt(yearly)} per year.</p>
  `;
  el.classList.add('visible');
}

function fmt(n) {
  return Number(n).toLocaleString('en-ZM', { maximumFractionDigits: 0 });
}

// ============================================
// FORMS
// ============================================
function initForms(site) {
  // Lead magnet form
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = leadForm.querySelector('[name="name"]').value;
      const phone = leadForm.querySelector('[name="phone"]').value;
      const msg = `Hello BLESSTech-X!%0A%0AI want the *Digital Success Checklist*.%0A%0AName: ${name}%0APhone: ${phone || 'N/A'}`;
      window.open(`https://wa.me/${site.whatsapp}?text=${msg}`, '_blank');
      leadForm.style.display = 'none';
      document.getElementById('leadSuccess').style.display = 'block';
    });
  }

  // Contact form (Formspree)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.setAttribute('action', `https://formspree.io/f/${site.formspree_id}`);
    contactForm.setAttribute('method', 'POST');
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          contactForm.reset();
          document.getElementById('contactSuccess').style.display = 'flex';
          setTimeout(() => { document.getElementById('contactSuccess').style.display = 'none'; }, 6000);
        } else {
          fallbackWhatsApp(contactForm, site.whatsapp);
        }
      } catch {
        fallbackWhatsApp(contactForm, site.whatsapp);
      } finally {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      }
    });
  }
}

function fallbackWhatsApp(form, whatsapp) {
  const data = new FormData(form);
  const msg = `Hello BLESSTech-X!%0A%0AName: ${data.get('name')}%0AEmail: ${data.get('email')}%0ABusiness: ${data.get('business')}%0AService: ${data.get('service')}%0AMessage: ${data.get('message')}`;
  window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('navLinks');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
}

// ============================================
// HEADER SCROLL SHADOW
// ============================================
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20
      ? '0 2px 20px rgba(0,0,0,0.1)'
      : 'none';
  }, { passive: true });
}

// ============================================
// MODALS
// ============================================
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}

function initModalClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(el => closeModal(el.id));
    }
  });
}

// ============================================
// HELPERS
// ============================================
function esc(str) {
  return String(str).replace(/'/g, "\\'");
}
