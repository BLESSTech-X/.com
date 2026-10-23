'use strict';
(async function () {
  let data;
  try {
    const response = await fetch('./data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load site content');
    data = await response.json();
  } catch (error) {
    console.error('BLESSTech-X page content:', error);
    return;
  }
  window.BTX_SITE = data.site || {};
  window.BTX_CONTACT_PAGE = data.contact_page || {};
  const text = (id, value) => {
    const el = document.getElementById(id);
    if (el && typeof value === 'string' && value.trim()) el.textContent = value;
  };
  const site = data.site || {};
  const about = data.about_page || {};
  const contact = data.contact_page || {};
  if (location.pathname.endsWith('about.html')) {
    text('aboutPageTitle', about.title);
    text('aboutPageTagline', about.tagline);
    const container = document.getElementById('aboutSections');
    if (container && Array.isArray(about.sections)) {
      container.replaceChildren();
      about.sections.forEach(section => {
        const heading = document.createElement('h2');
        const paragraph = document.createElement('p');
        heading.textContent = section.heading || '';
        paragraph.textContent = section.body || '';
        container.append(heading, paragraph);
      });
    }
  }
  if (location.pathname.endsWith('contact.html')) {
    text('contactPageTitle', contact.title);
    text('contactPageIntro', contact.intro);
    text('contactFormHeading', contact.form_heading);
    text('contactSubmitLabel', contact.submit_label);
    text('contactHours', contact.office_hours);
    text('contactLocation', site.location);
    const phone = String(site.whatsapp || site.phone || '').replace(/[^0-9]/g, '');
    const wa = document.getElementById('contactWhatsApp');
    if (wa && phone) { wa.href = 'https://wa.me/' + phone; wa.textContent = site.phone || ('+' + phone); }
    const email = document.getElementById('contactEmail');
    if (email && site.email) { email.href = 'mailto:' + site.email; email.textContent = site.email; }
    const form = document.getElementById('contactForm');
    if (form) {
      form.querySelectorAll('input,textarea').forEach(el => {
        if (el.name === 'name') el.placeholder = 'Your Name';
        if (el.name === 'email') el.placeholder = 'Your Email';
        if (el.name === 'phone') el.placeholder = 'Your WhatsApp Number';
        if (el.name === 'message') el.placeholder = 'What do you need?';
      });
    }
  }
})();
