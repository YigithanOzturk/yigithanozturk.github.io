/* ========== Mobil Menü ========== */
const menuBtn = document.querySelector('.menu-btn[aria-label^="Menü"]');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', ()=> nav.classList.toggle('open'));

/* ========== Tema (dark/light) ========== */
const THEME_KEY = 'pref-theme';
const themeBtn = document.getElementById('theme-toggle');
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); }
function getSystemPref(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
let saved = localStorage.getItem(THEME_KEY) || getSystemPref();
applyTheme(saved);
themeBtn?.addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

/* ========== Scroll-Spy (aktif link) ========== */
const links = document.querySelectorAll('.nav a[href^="#"]');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
function onScroll(){
  const y = scrollY + 120;
  sections.forEach((sec,i)=>{
    if(!sec) return;
    const inView = sec.offsetTop <= y && (sec.offsetTop + sec.offsetHeight) > y;
    links[i]?.classList.toggle('active', inView);
  });
}
document.addEventListener('scroll', onScroll); onScroll();

/* ========== Reveal on scroll ========== */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

/* ========== Yıl ========== */
const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

/* ========== Analytics (Plausible) ========== */
(function addAnalytics(){
  try{
    const s = document.createElement('script');
    s.defer = true; s.src = 'https://plausible.io/js/script.js';
    s.setAttribute('data-domain', location.hostname);
    document.head.appendChild(s);
  }catch{}
})();

/* ========== JSON yardımcıları ========== */
async function fetchJSON(primary, fallback){
  try{
    const res = await fetch(primary);
    if(res.ok) return await res.json();
    throw new Error('primary failed');
  }catch{
    if(!fallback) throw new Error('no fallback');
    const res2 = await fetch(fallback);
    if(!res2.ok) throw new Error('fallback failed');
    return await res2.json();
  }
}

/* ========== Projeler: yükle + filtre/arama ========== */
let _projects = [];
function thumbStyle(token){
  if(!token) return '';
  if(token.startsWith('gradient:')){
    const g = token.split(':')[1];
    const map = {
      indigo: 'linear-gradient(120deg,#1d4ed8aa,#8b5cf6aa)',
      cyan:   'linear-gradient(120deg,#0ea5e9aa,#10b981aa)',
      rose:   'linear-gradient(120deg,#f43f5eaa,#f59e0baa)'
    };
    return `background:${map[g]||map.indigo}`;
  }
  return `background:#0b1220 url('${token}') center/cover no-repeat`;
}
function pill(t){ return `<span class="badge">${t}</span>`; }
function projectCard(p){
  const liveBtn = p.links?.live ? `<a class="btn" href="${p.links.live}" target="_blank" rel="noreferrer">Canlı</a>` : '';
  const repoBtn = p.links?.repo ? `<a class="btn" href="${p.links.repo}" target="_blank" rel="noreferrer">Repo</a>` : '';
  return `
  <article class="project card reveal">
    <div class="thumb" style="${thumbStyle(p.thumb)}"></div>
    <h3 style="margin:.6rem 0 0">${p.title}</h3>
    <p class="muted" style="margin:.2rem 0 .6rem">${p.desc}</p>
    <div class="meta">
      <div class="badges">${(p.tech||[]).map(pill).join('')}</div>
      <div style="display:flex;gap:.5rem">${liveBtn}${repoBtn}</div>
    </div>
  </article>`;
}
function renderProjectsIndex(data){
  const el = document.getElementById('projects-list');
  if(!el) return;
  el.innerHTML = data.slice(0,3).map(projectCard).join('');
  el.querySelectorAll('.reveal').forEach(x=> io.observe(x));
}
function renderProjectsAll(data){
  const wrap = document.getElementById('projects-all');
  if(!wrap) return;
  // Kontroller
  const qInput = document.getElementById('proj-search');
  const tagWrap = document.getElementById('proj-tags');
  const clearBtn = document.getElementById('proj-clear');

  // Tagleri çıkar
  const allTags = [...new Set(data.flatMap(p=>p.tech||[]))].sort();
  tagWrap.innerHTML = allTags.map(t=>`<button class="filter-tag" data-tag="${t}">${t}</button>`).join('');

  let activeTags = new Set();
  function applyFilters(){
    const q = (qInput?.value || '').toLowerCase();
    const filtered = data.filter(p=>{
      const matchQ = !q || p.title.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q);
      const matchT = activeTags.size===0 || (p.tech||[]).some(t=>activeTags.has(t));
      return matchQ && matchT;
    });
    wrap.innerHTML = filtered.map(projectCard).join('') || `<p class="muted">Eşleşen proje yok.</p>`;
    wrap.querySelectorAll('.reveal').forEach(x=> io.observe(x));
  }

  tagWrap.addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter-tag'); if(!btn) return;
    const tag = btn.dataset.tag;
    if(btn.classList.toggle('active')) activeTags.add(tag); else activeTags.delete(tag);
    applyFilters();
  });
  qInput?.addEventListener('input', applyFilters);
  clearBtn?.addEventListener('click', ()=>{
    qInput.value=''; activeTags.clear();
    tagWrap.querySelectorAll('.filter-tag').forEach(b=> b.classList.remove('active'));
    applyFilters();
  });

  applyFilters();
}
async function loadProjects(){
  try{
    const data = await fetchJSON('assets/data/projects.json','../assets/data/projects.json');
    _projects = data;
    renderProjectsIndex(data);
    renderProjectsAll(data);
  }catch(err){ console.warn('Proje verisi alınamadı:', err); }
}

/* ========== Blog: liste + tek yazı ========== */
function mdToHtml(md){
  // Çok basit Markdown dönüştürücü (başlık, kalın, italik, kod, link)
  let html = md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  // code block (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (m, code)=> `<pre><code>${code.replace(/</g,'&lt;')}</code></pre>`);
  // satır sonu -> <br>
  html = html.replace(/\n{2,}/g, '</p><p>').replace(/\n/g,'<br>');
  return `<p>${html}</p>`;
}
function renderBlogList(posts){
  const list = document.getElementById('blog-list');
  if(!list) return;
  list.innerHTML = posts.map(p=>`
    <article class="card reveal">
      <h3 style="margin:.2rem 0">${p.title}</h3>
      <p class="muted" style="margin:.2rem 0">${new Date(p.date).toLocaleDateString('tr-TR')} — ${p.tags.join(', ')}</p>
      <p>${p.excerpt}</p>
      <p style="margin-top:.6rem"><a class="btn" href="./blog.html?post=${encodeURIComponent(p.slug)}">Oku</a></p>
    </article>
  `).join('');
  list.querySelectorAll('.reveal').forEach(x=> io.observe(x));
}
function renderBlogPost(post){
  const view = document.getElementById('blog-post');
  const list = document.getElementById('blog-list');
  if(!view) return;
  if(!post){ view.style.display='none'; list?.style.removeProperty('display'); return; }
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-meta').textContent =
    `${new Date(post.date).toLocaleDateString('tr-TR')} — ${post.tags.join(', ')}`;
  document.getElementById('post-content').innerHTML = mdToHtml(post.content);
  view.style.display='block'; list?.style.setProperty('display','none');
}
async function initBlog(){
  const isBlog = location.pathname.endsWith('/blog.html');
  if(!isBlog) return;
  const posts = await fetchJSON('../assets/data/blog.json','assets/data/blog.json');
  const params = new URLSearchParams(location.search);
  const slug = params.get('post');
  if(slug){
    const post = posts.find(p=> p.slug === slug);
    renderBlogPost(post || null);
  }else{
    renderBlogList(posts);
  }
  // arama
  const q = document.getElementById('blog-search');
  const clear = document.getElementById('blog-clear');
  if(q){
    q.addEventListener('input', ()=>{
      const s = q.value.toLowerCase();
      const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s) ||
        p.tags.join(' ').toLowerCase().includes(s)
      );
      renderBlogList(filtered);
    });
    clear?.addEventListener('click', ()=>{ q.value=''; q.dispatchEvent(new Event('input')); });
  }
}

/* ========== Toast ========== */
function showToast(message, kind='success'){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.classList.remove('success','error');
  t.classList.add(kind);
  requestAnimationFrame(()=>{
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 2500);
  });
}

/* ========== Form SPA gönderim (Formspree vb.) ========== */
document.querySelectorAll('form').forEach(f=>{
  // Honeypot
  const hp = document.createElement('input');
  hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
  hp.style.position = 'absolute'; hp.style.left='-9999px';
  f.appendChild(hp);

  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(hp.value){ return; }
    const action = f.getAttribute('action');
    if(!action){ showToast('Form action tanımsız.', 'error'); return; }

    const fd = new FormData(f);
    try{
      const res = await fetch(action, { method:'POST', body: fd, headers: { 'Accept':'application/json' } });
      if(res.ok){ f.reset(); showToast('Mesaj alındı, teşekkürler!', 'success'); }
      else{ showToast('Gönderim başarısız.', 'error'); }
    }catch{ showToast('Ağ hatası: gönderilemedi.', 'error'); }
  });
});

/* ========== Başlatıcılar ========== */
loadProjects();
initBlog();
