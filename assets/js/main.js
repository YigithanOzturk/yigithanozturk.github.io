/* ========== Mobil Menü ========== */
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', ()=> nav.classList.toggle('open'));

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
