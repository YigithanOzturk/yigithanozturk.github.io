// Smooth scroll & active link
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = link.getAttribute('href');
  });
});
window.addEventListener('scroll', () => {
  const fromTop = window.scrollY + 200;
  document.querySelectorAll('nav a').forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    link.classList.toggle(
      'active',
      section && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop
    );
  });
});

// Reveal on scroll (IntersectionObserver)
const faders = document.querySelectorAll('.fade-in');
const appearOptions = { threshold: 0.2 };
const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, appearOptions);
faders.forEach(fader => appearOnScroll.observe(fader));

// Reveal initially visible elements
document.addEventListener('DOMContentLoaded', () => {
  faders.forEach(fader => {
    if (fader.getBoundingClientRect().top < window.innerHeight) {
      fader.classList.add('visible');
    }
  });
});