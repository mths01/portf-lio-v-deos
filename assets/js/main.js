/* ==========================================================================
   MTHSFILMS — Scripts de Interação (main.js)
   Funcionalidades: Lightbox Dinâmico, Custom Video Player, Scroll Reveal,
                    Menu Responsivo e Efeitos Premium de Movimento do Mouse.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Componentes
  initNavbarScroll();
  initMobileMenu();
  initScrollReveal();
  initHeroParallax();
  initLightboxPlayer();
});

/* ── EFFECT NAVBAR ON SCROLL ────────────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const scrollThreshold = 40;

  const handleScroll = () => {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Executa ao carregar para caso a página inicie scrollada
}

/* ── MOBILE MENU TOGGLE ─────────────────────────────────────────────────── */
function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navToggle || !navMenu) return;

  const toggleMenu = () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
  };

  const closeMenu = () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
  };

  navToggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar menu se redimensionar para tela grande
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
      closeMenu();
    }
  }, { passive: true });
}

/* ── SCROLL REVEAL (INTERSECTION OBSERVER) ───────────────────────────────── */
function initScrollReveal() {
  // Adiciona a classe 'js' no html indicando que o JS está rodando
  // Assim o CSS esconde os elementos para revelá-los progressivamente
  document.documentElement.classList.add('js');

  const revealElements = document.querySelectorAll('.reveal');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback caso o browser antigo não tenha suporte
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Revela apenas uma vez
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/* ── INTERACTIVE HERO LIGHTNING (PARALLAX) ───────────────────────────────── */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Efeito do reflexo de iluminação seguindo o mouse
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  }, { passive: true });
}

/* ── LIGHTBOX DINÂMICO & CUSTOM PLAYER ───────────────────────────────────── */
function initLightboxPlayer() {
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const playCards = document.querySelectorAll('.vcard');

  // Controles do Player Customizado
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const playerTimeline = document.getElementById('playerTimeline');
  const timelineFill = document.getElementById('timelineFill');
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const muteIcon = document.getElementById('muteIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const customPlayer = document.getElementById('customPlayer');

  if (!lightbox || !lightboxVideo || !playPauseBtn) return;

  let isUserChangingVolume = false;

  // ── 1. Métodos de Abertura e Fechamento ──
  
  function openLightbox(card) {
    const videoSrc = card.getAttribute('data-src');
    const title = card.getAttribute('data-title');
    const desc = card.getAttribute('data-desc');
    const format = card.getAttribute('data-type'); // 'horizontal' ou 'vertical'
    const poster = card.getAttribute('data-poster');

    if (!videoSrc) return;

    // Reset de classes de orientação no modal
    lightbox.classList.remove('lightbox-horizontal', 'lightbox-vertical');
    
    // Configura a orientação para dimensionamento correto no CSS
    if (format === 'vertical') {
      lightbox.classList.add('lightbox-vertical');
    } else {
      lightbox.classList.add('lightbox-horizontal');
    }

    // Configura os metadados do vídeo
    lightboxVideo.src = videoSrc;
    if (poster) {
      lightboxVideo.poster = poster;
    } else {
      lightboxVideo.removeAttribute('poster');
    }
    
    if (lightboxTitle) lightboxTitle.textContent = title || 'MTHSFILMS';
    if (lightboxDesc) lightboxDesc.textContent = desc || '';

    // Carrega o vídeo e abre o modal
    lightboxVideo.load();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // Impede o scroll de fundo

    // Play automático com tratamento de promessa (bloqueio de autoplay do navegador)
    lightboxVideo.play()
      .then(() => updatePlayPauseUI(true))
      .catch(() => updatePlayPauseUI(false));
  }

  function closeLightbox() {
    lightboxVideo.pause();
    lightboxVideo.src = ''; // Libera o arquivo e interrompe o download
    lightbox.classList.remove('open', 'lightbox-horizontal', 'lightbox-vertical');
    document.body.style.overflow = ''; // Devolve o scroll de fundo
    
    // Reseta a UI do player
    timelineFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    durationTimeEl.textContent = '0:00';
    updatePlayPauseUI(false);
  }

  // Eventos de Abertura/Fechamento
  playCards.forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
    // Suporte para navegação via teclado
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  
  // Fechar clicando fora da caixa de mídia
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Atalho de teclado ESC para fechar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // ── 2. Lógica de Controle Customizado de Reprodução ──

  function togglePlay() {
    if (lightboxVideo.paused) {
      lightboxVideo.play()
        .then(() => updatePlayPauseUI(true))
        .catch(err => console.log("Erro no play:", err));
    } else {
      lightboxVideo.pause();
      updatePlayPauseUI(false);
    }
  }

  function updatePlayPauseUI(isPlaying) {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }

  playPauseBtn.addEventListener('click', togglePlay);
  lightboxVideo.addEventListener('click', togglePlay); // Clique direto no vídeo

  // ── 3. Tempo e Linha de Progresso ──

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  lightboxVideo.addEventListener('timeupdate', () => {
    if (lightboxVideo.duration) {
      const percentage = (lightboxVideo.currentTime / lightboxVideo.duration) * 100;
      timelineFill.style.width = `${percentage}%`;
      currentTimeEl.textContent = formatTime(lightboxVideo.currentTime);
    }
  });

  lightboxVideo.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(lightboxVideo.duration);
  });

  // Navegar no vídeo clicando na barra de timeline
  playerTimeline.addEventListener('click', (e) => {
    const rect = playerTimeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const duration = lightboxVideo.duration;
    if (duration) {
      lightboxVideo.currentTime = (clickX / timelineWidth) * duration;
    }
  });

  // ── 4. Volume e Mute ──

  function updateVolumeIcon(volume, isMuted) {
    if (isMuted || volume === 0) {
      volumeIcon.style.display = 'none';
      muteIcon.style.display = 'block';
    } else {
      volumeIcon.style.display = 'block';
      muteIcon.style.display = 'none';
    }
  }

  // Controlar o volume via Slider
  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    lightboxVideo.volume = val;
    lightboxVideo.muted = val === 0;
    updateVolumeIcon(val, lightboxVideo.muted);
  });

  // Mute rápido ao clicar no botão
  muteBtn.addEventListener('click', () => {
    if (lightboxVideo.muted) {
      lightboxVideo.muted = false;
      volumeSlider.value = lightboxVideo.volume;
      updateVolumeIcon(lightboxVideo.volume, false);
    } else {
      lightboxVideo.muted = true;
      volumeSlider.value = 0;
      updateVolumeIcon(lightboxVideo.volume, true);
    }
  });

  // ── 5. Fullscreen do Player Customizado ──

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      if (customPlayer.requestFullscreen) {
        customPlayer.requestFullscreen();
      } else if (customPlayer.webkitRequestFullscreen) { // Safari/iOS fallback
        customPlayer.webkitRequestFullscreen();
      } else if (customPlayer.msRequestFullscreen) {
        customPlayer.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
}
