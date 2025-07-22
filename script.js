/* script.js */
// tsParticles config
window.addEventListener('DOMContentLoaded', () => {
  tsParticles.load('particles-js', {
    fpsLimit:60,
    particles:{ number:{value:80}, size:{value:3}, move:{enable:true, speed:1} }
  });
  // Typed.js for subtitle
  new Typed('#subtitle', { strings:['Jr. Fullstack Developer', 'Front-end Developer', 'Backend Enthusiast'], typeSpeed:50, backSpeed:30, loop:true });
  // Lottie animation
  lottie.loadAnimation({ container:document.getElementById('lottie-about'), renderer:'svg', loop:true, autoplay:true, path:'about.json' });
  // Scroll progress
  const progBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    progBar.style.width = pct + '%';
    document.getElementById('back-to-top').style.display = window.scrollY>300?'block':'none';
  });
  document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  // Theme toggle
  const toggle = document.getElementById('theme-toggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    toggle.textContent = document.body.classList.contains('light-mode')?'🌙':'🌞';
  });
  // Parallax image
  const img = document.getElementById('parallax-img');
  document.getElementById('hero').addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    img.style.transform = `translate(${x}px, ${y}px)`;
  });
});
