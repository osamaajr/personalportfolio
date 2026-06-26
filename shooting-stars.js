(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.createElement('div');
  layer.className = 'shooting-star-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const random = (min, max) => Math.random() * (max - min) + min;

  const spawnStar = () => {
    const star = document.createElement('span');
    const startX = random(-260, window.innerWidth * 0.15);
    const startY = random(window.innerHeight * 0.08, window.innerHeight * 0.45);
    const travelX = window.innerWidth + random(280, 520);
    const travelY = -random(window.innerHeight * 0.08, window.innerHeight * 0.28);
    const angle = Math.atan2(travelY, travelX) * 180 / Math.PI;

    star.className = 'shooting-star';
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.setProperty('--travel-x', `${travelX}px`);
    star.style.setProperty('--travel-y', `${travelY}px`);
    star.style.setProperty('--angle', `${angle}deg`);
    star.style.setProperty('--length', `${random(130, 230)}px`);
    star.style.setProperty('--alpha', random(0.32, 0.56).toFixed(2));
    star.style.setProperty('--duration', `${random(900, 1450)}ms`);

    layer.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
  };

  const schedule = () => {
    window.setTimeout(() => {
      spawnStar();
      schedule();
    }, random(11000, 24000));
  };

  window.setTimeout(spawnStar, random(4500, 9000));
  schedule();
})();
