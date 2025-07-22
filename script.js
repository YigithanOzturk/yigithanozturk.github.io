// script.js
const sections = document.querySelectorAll('.section, .hero');
const options = { threshold:0.2 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, options);
sections.forEach(sec => observer.observe(sec));

// smooth scroll
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior:'smooth' });
  });
});
