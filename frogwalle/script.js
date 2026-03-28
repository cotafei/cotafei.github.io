// ── Плавное появление секций ──────────────────────────────────
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step, .review-card').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', function() {
  // Inject visible class styles
  var style = document.createElement('style');
  style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);

  // Stagger feature cards
  document.querySelectorAll('.feature-card').forEach(function(el, i) {
    el.style.transitionDelay = (i * 0.05) + 's';
  });
});

// ── Активная ссылка в nav при скролле ────────────────────────
var sections = document.querySelectorAll('section[id]');
var navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', function() {
  var scrollY = window.scrollY;
  sections.forEach(function(section) {
    var top = section.offsetTop - 100;
    var height = section.offsetHeight;
    var id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(function(link) {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + id) {
          link.style.color = '#32d74b';
        }
      });
    }
  });
}, { passive: true });

// ── Прогресс-бар анимация при появлении ──────────────────────
var progressBar = document.querySelector('.mock-progress-bar');
if (progressBar) {
  var progressObs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      progressBar.style.width = '0';
      setTimeout(function() {
        progressBar.style.transition = 'width 1.2s ease';
        progressBar.style.width = '62%';
      }, 300);
      progressObs.disconnect();
    }
  });
  progressObs.observe(progressBar);
}
