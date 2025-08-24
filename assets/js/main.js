/* ========== Mobil Menü ========== */
const menuBtn = document.querySelector('.menu-btn[aria-label^="Menü"]'); // sağdaki menü butonu
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
    links[i].classList.toggle('active', inView);
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

/* ========== JSON'dan projeleri yükle ========== */
async function loadProjects(){
  try{
    // index.html'de assets/..., alt sayfalarda ../assets/... çalışsın:
    const res = await fetch('assets/data/projects.json').catch(()=>fetch('../assets/data/projects.json'));
    if(!res.ok) throw new Error('JSON yüklenemedi');
    const data = await res.json();
    renderProjectsIndex(data);
    renderProjectsAll(data);
  }catch(err){
    console.warn('Proje verisi alınamadı:', err);
  }
}

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
  const el = document.getElementById('projects-all');
  if(!el) return;
  el.innerHTML = data.map(projectCard).join('');
  el.querySelectorAll('.reveal').forEach(x=> io.observe(x));
}

loadProjects();

/* ========== Basit toast ========== */
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
  // Honeypot (botlara karşı)
  const hp = document.createElement('input');
  hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
  hp.style.position = 'absolute'; hp.style.left='-9999px';
  f.appendChild(hp);

  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(hp.value){ return; } // bot ise iptal
    const action = f.getAttribute('action');
    if(!action){ showToast('Form action tanımsız.', 'error'); return; }

    const fd = new FormData(f);
    try{
      const res = await fetch(action, { method:'POST', body: fd, headers: { 'Accept':'application/json' } });
      if(res.ok){
        f.reset();
        showToast('Mesaj alındı, teşekkürler!', 'success');
      }else{
        showToast('Gönderim başarısız. Daha sonra tekrar deneyin.', 'error');
      }
    }catch(err){
      showToast('Ağ hatası: gönderilemedi.', 'error');
    }
  });
});
