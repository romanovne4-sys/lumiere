  /*
      Анимируем SVG-атрибуты через JS, потому что CSS не может анимировать
      height у <rect> внутри <clipPath> и y1/y2 у <line>.

      Используем requestAnimationFrame + ручной easing вместо Web Animations API
      для максимальной совместимости.
    */

  const DURATION = 700; // ms — совпадает с CSS transition

  // cubic-bezier(0.83, 0, 0.17, 1) — easeInOutQuart approximation
  function ease(t) {
      return t < 0.5 ?
          8 * t * t * t * t :
          1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function animateValue(from, to, duration, onUpdate, onDone) {
      const start = performance.now();

      function frame(now) {
          const elapsed = now - start;
          const t = Math.min(elapsed / duration, 1);
          onUpdate(t);
          if (t < 1) requestAnimationFrame(frame);
          else if (onDone) onDone();
      }
      requestAnimationFrame(frame);
  }

  document.querySelectorAll('.brand-item').forEach(item => {
      const svg = item.querySelector('svg');
      const half = parseFloat(svg.dataset.half); // 110 — граница clip
      const full = parseFloat(svg.dataset.full); // 220 — полная высота
      const lineRest = parseFloat(svg.dataset.line); // 132 — линия в статике (чуть ниже текста)

      const word = svg.getAttribute('aria-label').toLowerCase();
      const clipRect = svg.querySelector(`#clip-rect-${word}`);
      const line = svg.querySelector(`#line-${word}`);

      // clip и линия анимируются независимо:
      // clip: half → full
      // line: lineRest → full
      let clipCurrent = half;
      let lineCurrent = lineRest;

      function runTo(toClip, toLine) {
          const fromClip = clipCurrent;
          const fromLine = lineCurrent;
          animateValue(0, 1, DURATION, t => {
              clipCurrent = fromClip + (toClip - fromClip) * ease(t);
              lineCurrent = fromLine + (toLine - fromLine) * ease(t);
              clipRect.setAttribute('height', clipCurrent);
              line.setAttribute('y1', lineCurrent);
              line.setAttribute('y2', lineCurrent);
          });
      }

      item.addEventListener('mouseenter', () => runTo(full, full));
      item.addEventListener('mouseleave', () => runTo(half, lineRest));
  });
