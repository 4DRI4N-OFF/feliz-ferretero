(() => {
  const root = document.querySelector('.tribute');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  function prepare() {
    observer?.disconnect();
    if (motion.matches) { root.classList.remove('motion-ready'); return; }
    const nodes = [...root.querySelectorAll('.pill,.hero-copy header,.hero-note,.chapter-link,.hero-art,.chapters a,.section > .eyebrow,.section h2,.section p,.timeline article,.moment,.stats > div,.media-preview,.celebrate,footer')]
      .filter(n => !n.parentElement?.closest('.timeline article,.moment,.media-preview,.real-quote') || n.classList.contains('media-preview'));
    root.classList.add('motion-ready');
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.08, rootMargin: '0px 0px -28px 0px'});
    nodes.forEach((n,i) => { n.classList.add('reveal'); n.style.setProperty('--reveal-delay', `${Math.min(i%3*45,90)}ms`); observer.observe(n); });
  }
  prepare();
  motion.addEventListener('change', prepare);
  document.querySelectorAll('.video-facade').forEach(button => button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1&playsinline=1&rel=0&start=${button.dataset.start||0}`;
    frame.title = button.getAttribute('aria-label').replace('Reproducir ', '');
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(frame);
  }));
  const celebrate = document.querySelector('.celebrate');
  celebrate.addEventListener('click', () => {
    const active = celebrate.getAttribute('aria-pressed') !== 'true';
    celebrate.setAttribute('aria-pressed', String(active));
    celebrate.textContent = active ? '¡Va por ti, José! ♥' : 'Un poco de confeti para ti ↗';
    document.querySelector('.confetti')?.remove();
    if (active) {
      const confetti = document.createElement('div'); confetti.className = 'confetti'; confetti.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 24; i++) {
        const bit = document.createElement('i');
        bit.style.left = (i*41%100)+'%'; bit.style.animationDelay = (i%6)*.09+'s';
        bit.style.background = ['#f5c46e','#f18c81','#8acac3','#c3adf7'][i%4]; confetti.append(bit);
      }
      document.querySelector('.birthday').append(confetti);
    }
  });
})();
