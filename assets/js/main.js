/* yigithanozturk.dev — REV 2.0 */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Active section in nav ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navAnchors.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Contact form (mailto, no backend needed) ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();

      if (!name || !email || !message) {
        note.textContent = "Lütfen tüm alanları doldurun.";
        return;
      }
      const subject = encodeURIComponent(`Portföy iletişim — ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href =
        `mailto:yigithanozturk.dev@gmail.com?subject=${subject}&body=${body}`;
      note.textContent = "E-posta uygulamanız açılıyor…";
    });
  }

  /* ---------- Scroll progress bar ---------- */
  const bar = document.getElementById("progress");
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? (h.scrollTop / max) * 100 + "%" : "0%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Hero parallax (desktop, motion allowed) ---------- */
  const traces = document.querySelector(".hero-traces");
  if (traces && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      traces.style.transform = `translate(${dx * -18}px, ${dy * -14}px)`;
    });
    hero.addEventListener("mouseleave", () => {
      traces.style.transform = "translate(0, 0)";
    });
  }


  /* ---------- Language toggle ---------- */
  const langBtn = document.getElementById("lang-toggle");
  let lang = "tr";
  try { lang = localStorage.getItem("lang") || "tr"; } catch (e) {}
  if (window.applyLang && lang !== "tr") window.applyLang(lang);
  if (langBtn) {
    langBtn.textContent = lang === "tr" ? "EN" : "TR";
    langBtn.addEventListener("click", () => {
      lang = lang === "tr" ? "en" : "tr";
      window.applyLang(lang);
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length) {
    const runCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reducedMotion) { el.textContent = target; return; }
      const dur = 1400;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- GitHub live stats ---------- */
  const ghBody = document.getElementById("gh-body");
  if (ghBody) {
    const USER = "YigithanOzturk";
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const render = (user, repos) => {
      const langs = {};
      repos.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      const top = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const recent = [...repos]
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 4);

      ghBody.innerHTML =
        '<div class="gh-grid">' +
          '<div class="gh-numbers">' +
            '<div class="gh-num"><strong>' + user.public_repos + '</strong><span>repo</span></div>' +
            '<div class="gh-num"><strong>' + user.followers + '</strong><span>takipçi</span></div>' +
            '<div class="gh-num"><strong>' + user.following + '</strong><span>takip</span></div>' +
          '</div>' +
          '<div class="gh-langs">' +
            top.map(([name, n]) => {
              const pct = Math.round((n / total) * 100);
              return '<div class="gh-lang"><span>' + esc(name) + '</span>' +
                '<span class="gh-lang-bar"><span class="gh-lang-fill" data-w="' + pct + '"></span></span>' +
                '<span class="gh-lang-pct">' + pct + '%</span></div>';
            }).join("") +
          '</div>' +
          '<div class="gh-repos">' +
            recent.map((r) =>
              '<a class="gh-repo" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' + esc(r.name) + ' ↗</a>'
            ).join("") +
          '</div>' +
        '</div>';

      requestAnimationFrame(() => {
        ghBody.querySelectorAll(".gh-lang-fill").forEach((f) => { f.style.width = f.dataset.w + "%"; });
      });
    };

    const load = async () => {
      try {
        const cached = sessionStorage.getItem("gh-cache");
        if (cached) { const { user, repos } = JSON.parse(cached); render(user, repos); return; }
        const [uRes, rRes] = await Promise.all([
          fetch("https://api.github.com/users/" + USER),
          fetch("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed"),
        ]);
        if (!uRes.ok || !rRes.ok) throw new Error("rate limit");
        const user = await uRes.json();
        const repos = await rRes.json();
        try { sessionStorage.setItem("gh-cache", JSON.stringify({ user, repos })); } catch (e) {}
        render(user, repos);
      } catch (err) {
        const dict = (window.I18N && window.I18N[lang]) || {};
        ghBody.innerHTML = '<p class="gh-error">' + (dict["stats.error"] || "GitHub verileri şu an alınamadı.") + "</p>";
      }
    };
    const gio = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { load(); gio.disconnect(); }
    });
    gio.observe(ghBody);
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById("cursor-glow");
  if (glow && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = null;
    window.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
        glow.classList.add("on");
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- Terminal easter egg ---------- */
  const term = document.getElementById("terminal");
  const termBody = document.getElementById("terminal-body");
  const termInput = document.getElementById("terminal-input");
  if (term && termBody && termInput) {
    const print = (htmlStr) => {
      const div = document.createElement("div");
      div.innerHTML = htmlStr;
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    };
    const COMMANDS = {
      help: () => print(
        '<span class="t-vio">Komutlar:</span> whoami · projects · skills · syswatch · contact · social · clear · exit'
      ),
      whoami: () => print(
        '<span class="t-ok">Yiğithan Öztürk</span> — Full-Stack Developer & Bilgisayar Mühendisi<br>' +
        'Zonguldak, TR · EEM yüksek lisans öğrencisi · web + sistem + donanım'
      ),
      projects: () => print(
        '→ SysWatch (sistem & donanım izleme)<br>→ QR Yoklama Sistemi<br>→ EasyYTD<br>→ LinkedHub'
      ),
      skills: () => print(
        'React · Next.js · TypeScript · C#/.NET · Python · PostgreSQL · Docker · Linux · Sistem & Donanım'
      ),
      syswatch: () => print(
        '<span class="t-vio">[SysWatch]</span> Sistem taranıyor… CPU, RAM, disk, sıcaklık ve donanım sağlığı izleniyor.<br>Her şey kontrol altında. ✅'
      ),
      contact: () => print(
        '✉ <a href="mailto:yigithanozturk.dev@gmail.com">yigithanozturk.dev@gmail.com</a>'
      ),
      social: () => print(
        '<a href="https://github.com/YigithanOzturk" target="_blank" rel="noopener">github.com/YigithanOzturk</a><br>' +
        '<a href="https://linkedin.com/in/yigithanozturk" target="_blank" rel="noopener">linkedin.com/in/yigithanozturk</a>'
      ),
      clear: () => { termBody.innerHTML = ""; },
      exit: () => closeTerm(),
      sudo: () => print('<span class="t-vio">İzin reddedildi.</span> Burada root benim. 😏'),
    };
    const openTerm = () => {
      term.hidden = false;
      if (!termBody.dataset.boot) {
        termBody.dataset.boot = "1";
        print('<span class="t-ok">yigithan@dev</span> sistemine hoş geldin. <span class="t-cmd">help</span> yaz ve keşfet.');
      }
      termInput.focus();
    };
    const closeTerm = () => { term.hidden = true; };

    document.getElementById("terminal-launch")?.addEventListener("click", openTerm);
    document.getElementById("terminal-close")?.addEventListener("click", closeTerm);
    term.addEventListener("click", (e) => { if (e.target === term) closeTerm(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !term.hidden) closeTerm();
      if (e.key === "`" && term.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault();
        openTerm();
      }
    });
    termInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const raw = termInput.value.trim();
      termInput.value = "";
      if (!raw) return;
      print('<span class="t-cmd">$ ' + raw.replace(/</g, "&lt;") + "</span>");
      const cmd = raw.toLowerCase().split(/\s+/)[0];
      (COMMANDS[cmd] || (() => print("komut bulunamadı: " + cmd.replace(/</g, "&lt;") + ' — <span class="t-cmd">help</span> dene')))();
    });
  }

  /* ---------- Theme toggle (dark default / light) ---------- */
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    let theme = "dark";
    try { theme = localStorage.getItem("theme") || "dark"; } catch (e) {}
    const applyTheme = (t) => {
      if (t === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
      try { localStorage.setItem("theme", t); } catch (e) {}
    };
    applyTheme(theme);
    themeBtn.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      applyTheme(theme);
    });
  }

  /* ---------- Kick-up minigame (football keepie-uppie) ---------- */
  const kick = document.getElementById("kickup");
  const ball = document.getElementById("kickup-ball");
  const scoreBox = document.getElementById("kickup-score");
  const countEl = document.getElementById("kickup-count");
  const bestEl = document.getElementById("kickup-best");
  if (kick && ball && countEl) {
    let count = 0;
    let vy = 0;          // vertical velocity (px/frame)
    let y = 0;           // current offset above resting position
    let playing = false;
    let raf = null;
    let lastKick = 0;
    let best = 0;
    try { best = parseInt(localStorage.getItem("kickup-best") || "0", 10) || 0; } catch (e) {}

    const GRAV = 0.9;        // gravity per frame
    const showBest = () => { bestEl.textContent = best ? "REKOR " + best : ""; };

    const endGame = () => {
      playing = false;
      ball.classList.remove("playing");
      if (count > best) {
        best = count;
        try { localStorage.setItem("kickup-best", String(best)); } catch (e) {}
      }
      cancelAnimationFrame(raf);
      ball.style.transform = "";
      // keep score visible briefly, then reset display
      showBest();
      setTimeout(() => {
        if (!playing) {
          scoreBox.hidden = best ? false : true;
          countEl.textContent = "0";
        }
      }, 1400);
    };

    const loop = () => {
      vy -= GRAV;
      y += vy;
      if (y <= 0) {            // hit the ground
        y = 0;
        endGame();
        return;
      }
      ball.style.transform = "translateY(" + (-y) + "px)";
      raf = requestAnimationFrame(loop);
    };

    const kickBall = (e) => {
      if (e) e.preventDefault();
      const now = performance.now();
      // ignore absurdly fast double-fires
      if (now - lastKick < 30) return;
      lastKick = now;

      if (!playing) {
        playing = true;
        count = 0;
        ball.classList.add("playing");
        scoreBox.hidden = false;
      }
      count += 1;
      countEl.textContent = count;
      scoreBox.classList.remove("kickup-anim");
      // restart score pop animation
      void scoreBox.offsetWidth;
      // upward impulse — a touch stronger early, capped so it stays on screen
      vy = Math.min(13 + Math.random() * 2, 15);
      // spin feedback
      ball.classList.remove("spin"); void ball.offsetWidth; ball.classList.add("spin");
      if (!raf || y === 0) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };

    ball.addEventListener("click", kickBall);
    ball.addEventListener("touchstart", kickBall, { passive: false });

    // first-time hint
    const hint = document.createElement("span");
    hint.className = "kickup-hint";
    hint.textContent = "⚽ tıkla & sektir";
    kick.appendChild(hint);
    setTimeout(() => hint.classList.add("show"), 1600);
    setTimeout(() => hint.classList.remove("show"), 6000);
    ball.addEventListener("click", () => hint.remove(), { once: true });
    if (best) { scoreBox.hidden = false; showBest(); }
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
