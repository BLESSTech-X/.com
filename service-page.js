'use strict';
(async function(){
  const root=document.getElementById('servicePageContent');
  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl=value=>{try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
  document.getElementById('serviceYear').textContent=new Date().getFullYear();
  if(!id){root.innerHTML='<div class="service-error"><h1>Choose a service</h1><p>Open a service from the BLESSTech-X services list to see its full details.</p><a class="btn btn-primary" href="./#services">Browse Services</a></div>';return}
  let data;
  try{const response=await fetch('./data.json',{cache:'no-store'});if(!response.ok)throw new Error('Unable to load service data');data=await response.json()}
  catch(e){root.innerHTML='<div class="service-error"><h1>Service details unavailable</h1><p>Please try again or contact BLESSTech-X for help.</p><a class="btn btn-primary" href="./contact.html">Contact Us</a></div>';return}
  const s=(data.services||[]).find(item=>item.id===id&&item.published!==false);
  if(!s){root.innerHTML='<div class="service-error"><h1>Service not found</h1><p>This service may have been updated or is no longer published.</p><a class="btn btn-primary" href="./#services">Browse Services</a></div>';return}
  const site=data.site||{};
  const title=s.seo_title||s.title+' | BLESSTech-X';
  const desc=s.seo_description||s.description||'Explore this BLESSTech-X service.';
  document.title=title;
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=desc;
  const setMeta=(selector,value)=>{let node=document.querySelector(selector);if(!node){node=document.createElement('meta');const parts=selector.match(/\[(name|property)="([^"]+)"\]/);if(parts)node.setAttribute(parts[1],parts[2]);document.head.appendChild(node)}node.content=value};
  setMeta('meta[property="og:title"]',title);
  setMeta('meta[property="og:description"]',desc);
  setMeta('meta[property="og:url"]',location.href);
  setMeta('meta[property="og:type"]','website');
  if(s.image)setMeta('meta[property="og:image"]',s.image);
  setMeta('meta[name="twitter:card"]','summary_large_image');
  setMeta('meta[name="twitter:title"]',title);
  setMeta('meta[name="twitter:description"]',desc);
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.origin+location.pathname+'?id='+encodeURIComponent(s.id);
  const img=safeUrl(s.image);
  const paragraphs=String(s.long_description||s.description||'').split(/\n{2,}/).filter(Boolean).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('');
  const features=(s.features||[]).map(f=>'<div class="service-feature"><i class="fas fa-check-circle"></i><span>'+esc(f)+'</span></div>').join('');
  const gallery=(s.gallery||[]).filter(Boolean).map((image,i)=>{const url=safeUrl(image);return url?'<a href="'+esc(url)+'" target="_blank" rel="noopener"><img src="'+esc(url)+'" alt="'+esc(s.title)+' example '+(i+1)+'" loading="lazy"></a>':''}).join('');
  const demos=(s.demo_links||[]).filter(d=>d&&safeUrl(d.url)).map(d=>'<a class="service-demo" href="'+esc(safeUrl(d.url))+'" target="_blank" rel="noopener"><span>'+esc(d.label||'View sample')+'<small>'+esc(d.type||'Sample work')+'</small></span><i class="fas fa-arrow-up-right-from-square"></i></a>').join('');
  const phone=String(site.whatsapp||site.phone||'260979603741').replace(/[^0-9]/g,'');
  const message='Hello BLESSTech-X! I am interested in '+s.title+'. Please help me understand the scope, price and next steps.';
  const wa='https://wa.me/'+phone+'?text='+encodeURIComponent(message);
  root.innerHTML=`
    <div class="service-crumbs"><a href="./">Home</a> / <a href="./#services">Services</a> / <strong>${esc(s.title)}</strong></div>
    <section class="service-hero">
      <div>
        ${s.badge?'<span class="service-tag">'+esc(s.badge)+'</span>':''}
        <h1>${esc(s.title)}</h1><p>${esc(s.description||'')}</p>
        <div class="service-price-box"><strong>${esc(s.price||'Contact us for pricing')}</strong><span>Final scope and price are confirmed after discussing your requirements.</span></div>
        <div class="service-page-actions">
          <a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Discuss This Service</a>
          <button class="btn btn-outline" id="shareServicePage"><i class="fas fa-share-alt"></i> Share Service</button>
        </div>
        <div class="service-social-share" aria-label="Share this service">
          <strong>Help someone discover this service:</strong>
          <a class="service-share-wa" href="https://wa.me/?text=${encodeURIComponent(s.title+' — '+desc+' '+location.href)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
          <a class="service-share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook" aria-hidden="true"></i> Facebook</a>
          <button type="button" id="copyShareUrl"><i class="fas fa-link" aria-hidden="true"></i> Copy link</button>
        </div>
        <div class="service-share-feedback" id="serviceShareFeedback" role="status" aria-live="polite"></div>
      </div>
      ${img?'<img class="service-main-image" src="'+esc(img)+'" alt="'+esc(s.title)+'" fetchpriority="high">':'<div class="service-main-image" aria-label="Service image unavailable"></div>'}
    </section>
    <div class="service-content-grid">
      <div>
        <section class="service-panel"><h2>Service Overview</h2><div class="service-description">${paragraphs}</div>
          ${s.delivery_time?'<p class="service-description"><strong>Typical turnaround:</strong> '+esc(s.delivery_time)+'</p>':''}
          ${s.best_for?'<p class="service-description"><strong>Best for:</strong> '+esc(s.best_for)+'</p>':''}
        </section>
        ${features?'<section class="service-panel"><h2>What Is Included</h2><div class="service-feature-list">'+features+'</div></section>':''}
        ${gallery?'<section class="service-panel"><h2>Gallery & Examples</h2><div class="service-gallery">'+gallery+'</div></section>':''}
        ${demos?'<section class="service-panel"><h2>Sample Websites & Related Work</h2><div class="service-demo-list">'+demos+'</div></section>':''}
      </div>
      <aside class="service-side">
        <section class="service-panel"><h2>Ready to Start?</h2><p>Tell us about your goals, required features and budget. We will confirm what is possible and the next steps.</p>
          <a class="btn btn-primary" style="width:100%;justify-content:center" href="${esc(wa)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Request a Quote</a>
          <a class="btn btn-outline" style="width:100%;justify-content:center;margin-top:10px" href="./contact.html">Use Contact Form</a>
          <button class="btn btn-outline" id="copyServiceLink" style="width:100%;justify-content:center;margin-top:10px"><i class="fas fa-link"></i> Copy Service Link</button>
        </section>
      </aside>
    </div>
    <div class="service-mobile-cta" aria-label="Quick contact">
      <a class="mobile-quote" href="${esc(wa)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Get a Quote</a>
      <a class="mobile-contact" href="./contact.html"><i class="fas fa-envelope" aria-hidden="true"></i> Contact</a>
    </div>`;
  const shareUrl=location.href;
  const shareButton=document.getElementById('shareServicePage');
  const copyButton=document.getElementById('copyServiceLink');
  const copyShareButton=document.getElementById('copyShareUrl');
  const shareFeedback=document.getElementById('serviceShareFeedback');
  async function share(){try{if(navigator.share)await navigator.share({title, text:desc, url:shareUrl});else{await copyUrl();}}catch(e){if(e?.name!=='AbortError')window.prompt('Copy this service link:',shareUrl)}}
  async function copyUrl(){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareUrl);if(shareFeedback)shareFeedback.textContent='Service link copied. You can now paste it into a message or post.';if(copyButton)copyButton.innerHTML='<i class="fas fa-check"></i> Link Copied';if(copyShareButton)copyShareButton.innerHTML='<i class="fas fa-check"></i> Copied';setTimeout(()=>{if(copyButton)copyButton.innerHTML='<i class="fas fa-link"></i> Copy Service Link';if(copyShareButton)copyShareButton.innerHTML='<i class="fas fa-link" aria-hidden="true"></i> Copy link'},2400)}else{window.prompt('Copy this service link:',shareUrl)}}catch{window.prompt('Copy this service link:',shareUrl)}}
  if(shareButton)shareButton.addEventListener('click',share);
  if(copyShareButton)copyShareButton.addEventListener('click',copyUrl);
  if(copyButton)copyButton.addEventListener('click',copyUrl);
})();
