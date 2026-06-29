/* Sticky navbar: eased smooth-scroll + scrollspy active highlighting */

export function initNav(): void {
  const nav = document.querySelector('.topnav') as HTMLElement;
  const cont = document.getElementById('navLinks') as HTMLElement;
  const links = [...document.querySelectorAll<HTMLButtonElement>('.navlink')];
  const secs = links.map((l) => document.getElementById(l.dataset.target!));
  const navH = () => nav.offsetHeight;
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let raf = 0;
  function smoothTo(y: number): void {
    if (raf) cancelAnimationFrame(raf);
    const start = window.scrollY, dist = Math.max(0, y) - start;
    if (Math.abs(dist) < 2) { window.scrollTo(0, Math.max(0, y)); return; }
    const dur = Math.min(1100, Math.max(420, Math.abs(dist) * 0.45)), t0 = performance.now();
    (function step(now: number) {
      const p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    })(performance.now());
  }
  function ensureVisible(l: HTMLElement): void {
    const target = l.offsetLeft - (cont.clientWidth - l.offsetWidth) / 2;
    if (cont.scrollTo) cont.scrollTo({ left: target, behavior: 'smooth' });
    else cont.scrollLeft = target;
  }
  let activeEl: HTMLElement | null = null;
  function setActive(l: HTMLElement | null): void {
    if (!l || l === activeEl) return;
    activeEl = l;
    links.forEach((x) => x.classList.toggle('active', x === l));
    ensureVisible(l);
  }
  links.forEach((l) =>
    l.addEventListener('click', () => {
      const sec = document.getElementById(l.dataset.target!);
      if (!sec) return;
      setActive(l);
      smoothTo(sec.getBoundingClientRect().top + window.scrollY - navH() - 8);
    })
  );
  document.getElementById('navBrand')?.addEventListener('click', () => smoothTo(0));

  let ticking = false;
  function spy(): void {
    ticking = false;
    const pos = window.scrollY + navH() + 28;
    let idx = 0;
    for (let i = 0; i < secs.length; i++) {
      const s = secs[i];
      if (s && s.offsetTop <= pos) idx = i;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = secs.length - 1;
    setActive(links[idx]);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();
}
